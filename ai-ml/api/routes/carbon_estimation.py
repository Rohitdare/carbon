"""
Carbon Estimation API Routes
Handles carbon sequestration estimation requests
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime

from services.model_service import ModelService
from services.gee_service import GoogleEarthEngineService

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models for request/response
class SatelliteDataRequest(BaseModel):
    """Request model for satellite data"""
    geometry: Dict[str, Any] = Field(..., description="GeoJSON geometry of the area")
    start_date: str = Field(..., description="Start date in YYYY-MM-DD format")
    end_date: str = Field(..., description="End date in YYYY-MM-DD format")
    cloud_cover_threshold: float = Field(20.0, description="Maximum cloud cover percentage")

class SensorDataRequest(BaseModel):
    """Request model for sensor data"""
    temperature: Optional[float] = Field(None, description="Temperature in Celsius")
    humidity: Optional[float] = Field(None, description="Humidity percentage")
    soil_moisture: Optional[float] = Field(None, description="Soil moisture (0-1)")
    salinity: Optional[float] = Field(None, description="Salinity in ppt")
    ph: Optional[float] = Field(None, description="pH value")
    organic_matter: Optional[float] = Field(None, description="Organic matter percentage")

class FieldMeasurementsRequest(BaseModel):
    """Request model for field measurements"""
    biomass_density: Optional[float] = Field(None, description="Biomass density in kg/m²")
    canopy_height: Optional[float] = Field(None, description="Canopy height in meters")
    stem_density: Optional[float] = Field(None, description="Stem density per m²")
    leaf_area_index: Optional[float] = Field(None, description="Leaf area index")

class ProjectDataRequest(BaseModel):
    """Request model for project data"""
    area_hectares: float = Field(..., description="Project area in hectares")
    ecosystem_type: str = Field(..., description="Ecosystem type (mangrove, saltmarsh, seagrass, tidal_marsh)")
    project_id: Optional[str] = Field(None, description="Project ID")
    location: Optional[Dict[str, Any]] = Field(None, description="Project location coordinates")

class CarbonEstimationRequest(BaseModel):
    """Request model for carbon estimation"""
    satellite_data: Optional[SatelliteDataRequest] = Field(None, description="Satellite data request")
    sensor_data: Optional[SensorDataRequest] = Field(None, description="Sensor data")
    field_measurements: Optional[FieldMeasurementsRequest] = Field(None, description="Field measurements")
    project_data: ProjectDataRequest = Field(..., description="Project data")
    use_historical_data: bool = Field(False, description="Whether to use historical data for analysis")

class CarbonEstimationResponse(BaseModel):
    """Response model for carbon estimation"""
    carbon_estimate_tonnes_co2_per_hectare_per_year: float
    confidence: float
    timestamp: str
    model_version: str
    analysis: Dict[str, Any]
    satellite_data: Optional[Dict[str, Any]] = None
    recommendations: List[str]

# Global services (will be injected)
model_service: Optional[ModelService] = None
gee_service: Optional[GoogleEarthEngineService] = None

def get_model_service() -> ModelService:
    """Dependency to get model service"""
    if model_service is None:
        raise HTTPException(status_code=503, detail="Model service not available")
    return model_service

def get_gee_service() -> GoogleEarthEngineService:
    """Dependency to get Google Earth Engine service"""
    if gee_service is None:
        raise HTTPException(status_code=503, detail="Google Earth Engine service not available")
    return gee_service

@router.post("/estimate", response_model=CarbonEstimationResponse)
async def estimate_carbon_sequestration(
    request: CarbonEstimationRequest,
    background_tasks: BackgroundTasks,
    model_svc: ModelService = Depends(get_model_service),
    gee_svc: GoogleEarthEngineService = Depends(get_gee_service)
):
    """
    Estimate carbon sequestration for a given project area
    
    This endpoint combines satellite data, sensor data, and field measurements
    to provide an AI-powered estimate of carbon sequestration potential.
    """
    try:
        logger.info(f"Processing carbon estimation request for project: {request.project_data.project_id}")
        
        # Initialize data dictionaries
        satellite_data = {}
        sensor_data = {}
        field_measurements = {}
        
        # Process satellite data if provided
        if request.satellite_data:
            try:
                satellite_result = await gee_svc.get_satellite_data(
                    geometry=request.satellite_data.geometry,
                    start_date=request.satellite_data.start_date,
                    end_date=request.satellite_data.end_date,
                    cloud_cover_threshold=request.satellite_data.cloud_cover_threshold
                )
                satellite_data = satellite_result.get('vegetation_indices', {})
                
                # Add to background tasks for logging
                background_tasks.add_task(
                    log_satellite_data_usage,
                    request.project_data.project_id,
                    satellite_result
                )
                
            except Exception as e:
                logger.warning(f"Failed to retrieve satellite data: {e}")
                # Continue with estimation using available data
        
        # Process sensor data if provided
        if request.sensor_data:
            sensor_data = {
                'temperature': request.sensor_data.temperature,
                'humidity': request.sensor_data.humidity,
                'soil_moisture': request.sensor_data.soil_moisture,
                'salinity': request.sensor_data.salinity,
                'ph': request.sensor_data.ph,
                'organic_matter': request.sensor_data.organic_matter
            }
        
        # Process field measurements if provided
        if request.field_measurements:
            field_measurements = {
                'biomass_density': request.field_measurements.biomass_density,
                'canopy_height': request.field_measurements.canopy_height,
                'stem_density': request.field_measurements.stem_density,
                'leaf_area_index': request.field_measurements.leaf_area_index
            }
        
        # Prepare project data
        project_data = {
            'area_hectares': request.project_data.area_hectares,
            'ecosystem_type': request.project_data.ecosystem_type,
            'project_id': request.project_data.project_id,
            'location': request.project_data.location
        }
        
        # Make carbon sequestration prediction
        prediction = await model_svc.predict_carbon_sequestration(
            satellite_data=satellite_data,
            sensor_data=sensor_data,
            field_measurements=field_measurements,
            project_data=project_data
        )
        
        # Extract recommendations from analysis
        recommendations = prediction.get('analysis', {}).get('recommendations', [])
        
        # Prepare response
        response = CarbonEstimationResponse(
            carbon_estimate_tonnes_co2_per_hectare_per_year=prediction['carbon_estimate_tonnes_co2_per_hectare_per_year'],
            confidence=prediction['confidence'],
            timestamp=prediction['timestamp'],
            model_version=prediction['model_version'],
            analysis=prediction.get('analysis', {}),
            satellite_data=satellite_data if satellite_data else None,
            recommendations=recommendations
        )
        
        logger.info(f"Carbon estimation completed for project {request.project_data.project_id}: {response.carbon_estimate_tonnes_co2_per_hectare_per_year:.2f} tCO2/ha/year")
        
        return response
        
    except Exception as e:
        logger.error(f"Error in carbon estimation: {e}")
        raise HTTPException(status_code=500, detail=f"Carbon estimation failed: {str(e)}")

@router.get("/estimate/{project_id}/history")
async def get_estimation_history(
    project_id: str,
    model_svc: ModelService = Depends(get_model_service)
):
    """
    Get carbon estimation history for a project
    
    This endpoint retrieves historical carbon estimation data for a specific project.
    """
    try:
        # This would typically query a database for historical estimates
        # For now, we'll return a placeholder response
        
        logger.info(f"Retrieving estimation history for project: {project_id}")
        
        # Placeholder response - in production, this would query the database
        history = {
            'project_id': project_id,
            'estimates': [
                {
                    'timestamp': datetime.utcnow().isoformat(),
                    'carbon_estimate': 12.5,
                    'confidence': 0.85,
                    'model_version': '1.0.0'
                }
            ],
            'total_estimates': 1
        }
        
        return history
        
    except Exception as e:
        logger.error(f"Error retrieving estimation history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve estimation history: {str(e)}")

@router.post("/estimate/batch")
async def estimate_carbon_batch(
    requests: List[CarbonEstimationRequest],
    background_tasks: BackgroundTasks,
    model_svc: ModelService = Depends(get_model_service),
    gee_svc: GoogleEarthEngineService = Depends(get_gee_service)
):
    """
    Estimate carbon sequestration for multiple projects in batch
    
    This endpoint processes multiple carbon estimation requests efficiently.
    """
    try:
        logger.info(f"Processing batch carbon estimation for {len(requests)} projects")
        
        results = []
        
        for i, request in enumerate(requests):
            try:
                # Process each request
                response = await estimate_carbon_sequestration(
                    request=request,
                    background_tasks=background_tasks,
                    model_svc=model_svc,
                    gee_svc=gee_svc
                )
                
                results.append({
                    'project_id': request.project_data.project_id,
                    'status': 'success',
                    'result': response
                })
                
            except Exception as e:
                logger.error(f"Error processing request {i}: {e}")
                results.append({
                    'project_id': request.project_data.project_id,
                    'status': 'error',
                    'error': str(e)
                })
        
        return {
            'total_requests': len(requests),
            'successful': len([r for r in results if r['status'] == 'success']),
            'failed': len([r for r in results if r['status'] == 'error']),
            'results': results
        }
        
    except Exception as e:
        logger.error(f"Error in batch carbon estimation: {e}")
        raise HTTPException(status_code=500, detail=f"Batch estimation failed: {str(e)}")

async def log_satellite_data_usage(project_id: str, satellite_data: Dict[str, Any]):
    """Background task to log satellite data usage"""
    try:
        logger.info(f"Satellite data used for project {project_id}: {satellite_data.get('image_id', 'unknown')}")
        # In production, this would log to a database or analytics service
    except Exception as e:
        logger.error(f"Error logging satellite data usage: {e}")

