"""
Satellite Data API Routes
Handles satellite data retrieval and processing requests
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime, timedelta

from services.gee_service import GoogleEarthEngineService

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models for request/response
class SatelliteDataRequest(BaseModel):
    """Request model for satellite data retrieval"""
    geometry: Dict[str, Any] = Field(..., description="GeoJSON geometry of the area")
    start_date: str = Field(..., description="Start date in YYYY-MM-DD format")
    end_date: str = Field(..., description="End date in YYYY-MM-DD format")
    cloud_cover_threshold: float = Field(20.0, description="Maximum cloud cover percentage")
    include_historical: bool = Field(False, description="Include historical data analysis")

class HistoricalDataRequest(BaseModel):
    """Request model for historical data analysis"""
    geometry: Dict[str, Any] = Field(..., description="GeoJSON geometry of the area")
    start_date: str = Field(..., description="Start date in YYYY-MM-DD format")
    end_date: str = Field(..., description="End date in YYYY-MM-DD format")
    interval_days: int = Field(30, description="Interval between data points in days")

class LandCoverRequest(BaseModel):
    """Request model for land cover classification"""
    geometry: Dict[str, Any] = Field(..., description="GeoJSON geometry of the area")
    year: int = Field(2023, description="Year for land cover data")

class SatelliteDataResponse(BaseModel):
    """Response model for satellite data"""
    image_id: str
    acquisition_date: str
    cloud_cover: float
    vegetation_indices: Dict[str, float]
    area_statistics: Dict[str, Any]
    geometry: Dict[str, Any]
    processed_at: str

class HistoricalDataResponse(BaseModel):
    """Response model for historical data"""
    total_periods: int
    data_points: List[Dict[str, Any]]
    trends: Dict[str, Any]
    processed_at: str

class LandCoverResponse(BaseModel):
    """Response model for land cover classification"""
    year: int
    total_area_hectares: float
    land_cover_classes: Dict[str, Any]
    geometry: Dict[str, Any]
    processed_at: str

# Global service (will be injected)
gee_service: Optional[GoogleEarthEngineService] = None

def get_gee_service() -> GoogleEarthEngineService:
    """Dependency to get Google Earth Engine service"""
    if gee_service is None:
        raise HTTPException(status_code=503, detail="Google Earth Engine service not available")
    return gee_service

@router.post("/retrieve", response_model=SatelliteDataResponse)
async def retrieve_satellite_data(
    request: SatelliteDataRequest,
    background_tasks: BackgroundTasks,
    gee_svc: GoogleEarthEngineService = Depends(get_gee_service)
):
    """
    Retrieve satellite data for a given area and time period
    
    This endpoint fetches satellite imagery and calculates vegetation indices
    for carbon estimation and monitoring purposes.
    """
    try:
        logger.info(f"Retrieving satellite data for geometry: {request.geometry}")
        
        # Retrieve satellite data
        satellite_data = await gee_svc.get_satellite_data(
            geometry=request.geometry,
            start_date=request.start_date,
            end_date=request.end_date,
            cloud_cover_threshold=request.cloud_cover_threshold
        )
        
        # Add to background tasks for caching
        background_tasks.add_task(
            cache_satellite_data,
            satellite_data
        )
        
        # Prepare response
        response = SatelliteDataResponse(
            image_id=satellite_data['image_id'],
            acquisition_date=satellite_data['acquisition_date'],
            cloud_cover=satellite_data['cloud_cover'],
            vegetation_indices=satellite_data['vegetation_indices'],
            area_statistics=satellite_data['area_statistics'],
            geometry=satellite_data['geometry'],
            processed_at=satellite_data['processed_at']
        )
        
        logger.info(f"Satellite data retrieved successfully: {response.image_id}")
        
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving satellite data: {e}")
        raise HTTPException(status_code=500, detail=f"Satellite data retrieval failed: {str(e)}")

@router.post("/historical", response_model=HistoricalDataResponse)
async def get_historical_data(
    request: HistoricalDataRequest,
    background_tasks: BackgroundTasks,
    gee_svc: GoogleEarthEngineService = Depends(get_gee_service)
):
    """
    Get historical satellite data for trend analysis
    
    This endpoint retrieves historical satellite data over a specified time period
    to analyze trends in vegetation health and carbon sequestration potential.
    """
    try:
        logger.info(f"Retrieving historical data for period: {request.start_date} to {request.end_date}")
        
        # Retrieve historical data
        historical_data = await gee_svc.get_historical_data(
            geometry=request.geometry,
            start_date=request.start_date,
            end_date=request.end_date,
            interval_days=request.interval_days
        )
        
        # Calculate trends
        trends = calculate_trends(historical_data)
        
        # Add to background tasks for analysis
        background_tasks.add_task(
            analyze_historical_trends,
            historical_data,
            trends
        )
        
        # Prepare response
        response = HistoricalDataResponse(
            total_periods=len(historical_data),
            data_points=historical_data,
            trends=trends,
            processed_at=datetime.utcnow().isoformat()
        )
        
        logger.info(f"Historical data retrieved successfully: {len(historical_data)} data points")
        
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving historical data: {e}")
        raise HTTPException(status_code=500, detail=f"Historical data retrieval failed: {str(e)}")

@router.post("/landcover", response_model=LandCoverResponse)
async def get_land_cover_classification(
    request: LandCoverRequest,
    background_tasks: BackgroundTasks,
    gee_svc: GoogleEarthEngineService = Depends(get_gee_service)
):
    """
    Get land cover classification for an area
    
    This endpoint provides land cover classification data to understand
    the ecosystem composition and carbon sequestration potential.
    """
    try:
        logger.info(f"Retrieving land cover classification for year: {request.year}")
        
        # Retrieve land cover data
        land_cover_data = await gee_svc.get_land_cover_classification(
            geometry=request.geometry,
            year=request.year
        )
        
        # Add to background tasks for analysis
        background_tasks.add_task(
            analyze_land_cover,
            land_cover_data
        )
        
        # Prepare response
        response = LandCoverResponse(
            year=land_cover_data['year'],
            total_area_hectares=land_cover_data['total_area_hectares'],
            land_cover_classes=land_cover_data['land_cover_classes'],
            geometry=land_cover_data['geometry'],
            processed_at=land_cover_data['processed_at']
        )
        
        logger.info(f"Land cover classification retrieved successfully: {response.total_area_hectares:.2f} hectares")
        
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving land cover classification: {e}")
        raise HTTPException(status_code=500, detail=f"Land cover classification failed: {str(e)}")

@router.get("/indices/calculate")
async def calculate_vegetation_indices(
    geometry: Dict[str, Any],
    start_date: str,
    end_date: str,
    gee_svc: GoogleEarthEngineService = Depends(get_gee_service)
):
    """
    Calculate vegetation indices for a given area and time period
    
    This endpoint calculates various vegetation indices that are useful
    for carbon estimation and ecosystem monitoring.
    """
    try:
        logger.info(f"Calculating vegetation indices for geometry: {geometry}")
        
        # Retrieve satellite data
        satellite_data = await gee_svc.get_satellite_data(
            geometry=geometry,
            start_date=start_date,
            end_date=end_date,
            cloud_cover_threshold=30.0  # More lenient for index calculation
        )
        
        # Extract vegetation indices
        vegetation_indices = satellite_data.get('vegetation_indices', {})
        
        # Calculate additional statistics
        index_stats = calculate_index_statistics(vegetation_indices)
        
        return {
            'vegetation_indices': vegetation_indices,
            'statistics': index_stats,
            'geometry': geometry,
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'processed_at': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error calculating vegetation indices: {e}")
        raise HTTPException(status_code=500, detail=f"Vegetation index calculation failed: {str(e)}")

def calculate_trends(historical_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate trends from historical data"""
    
    if not historical_data:
        return {'error': 'No historical data available'}
    
    # Extract vegetation indices over time
    ndvi_values = []
    evi_values = []
    dates = []
    
    for data_point in historical_data:
        vegetation_indices = data_point.get('vegetation_indices', {})
        if 'ndvi' in vegetation_indices and 'evi' in vegetation_indices:
            ndvi_values.append(vegetation_indices['ndvi'])
            evi_values.append(vegetation_indices['evi'])
            dates.append(data_point.get('acquisition_date', ''))
    
    # Calculate simple linear trends
    trends = {
        'ndvi_trend': calculate_linear_trend(ndvi_values) if ndvi_values else None,
        'evi_trend': calculate_linear_trend(evi_values) if evi_values else None,
        'data_points': len(historical_data),
        'period_covered': {
            'start': dates[0] if dates else None,
            'end': dates[-1] if dates else None
        }
    }
    
    return trends

def calculate_linear_trend(values: List[float]) -> Dict[str, float]:
    """Calculate linear trend for a series of values"""
    
    if len(values) < 2:
        return {'slope': 0.0, 'r_squared': 0.0}
    
    # Simple linear regression
    n = len(values)
    x = list(range(n))
    
    # Calculate slope and intercept
    sum_x = sum(x)
    sum_y = sum(values)
    sum_xy = sum(x[i] * values[i] for i in range(n))
    sum_x2 = sum(x[i] ** 2 for i in range(n))
    
    slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
    intercept = (sum_y - slope * sum_x) / n
    
    # Calculate R-squared
    y_mean = sum_y / n
    ss_tot = sum((values[i] - y_mean) ** 2 for i in range(n))
    ss_res = sum((values[i] - (slope * x[i] + intercept)) ** 2 for i in range(n))
    r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
    
    return {
        'slope': slope,
        'intercept': intercept,
        'r_squared': r_squared,
        'trend_direction': 'increasing' if slope > 0 else 'decreasing' if slope < 0 else 'stable'
    }

def calculate_index_statistics(vegetation_indices: Dict[str, float]) -> Dict[str, Any]:
    """Calculate statistics for vegetation indices"""
    
    stats = {}
    
    for index_name, value in vegetation_indices.items():
        if value is not None:
            stats[index_name] = {
                'value': value,
                'category': categorize_index_value(index_name, value)
            }
    
    return stats

def categorize_index_value(index_name: str, value: float) -> str:
    """Categorize vegetation index value"""
    
    if index_name == 'ndvi':
        if value > 0.6:
            return 'high_vegetation'
        elif value > 0.3:
            return 'moderate_vegetation'
        elif value > 0.1:
            return 'low_vegetation'
        else:
            return 'sparse_vegetation'
    
    elif index_name == 'evi':
        if value > 0.4:
            return 'high_vegetation'
        elif value > 0.2:
            return 'moderate_vegetation'
        elif value > 0.1:
            return 'low_vegetation'
        else:
            return 'sparse_vegetation'
    
    elif index_name == 'ndwi':
        if value > 0.3:
            return 'high_water_content'
        elif value > 0.1:
            return 'moderate_water_content'
        else:
            return 'low_water_content'
    
    else:
        return 'unknown'

async def cache_satellite_data(satellite_data: Dict[str, Any]):
    """Background task to cache satellite data"""
    try:
        # In production, this would cache the data in Redis or a database
        logger.info(f"Caching satellite data: {satellite_data.get('image_id', 'unknown')}")
    except Exception as e:
        logger.error(f"Error caching satellite data: {e}")

async def analyze_historical_trends(historical_data: List[Dict[str, Any]], trends: Dict[str, Any]):
    """Background task to analyze historical trends"""
    try:
        logger.info(f"Analyzing historical trends for {len(historical_data)} data points")
        # In production, this would perform deeper analysis and store results
    except Exception as e:
        logger.error(f"Error analyzing historical trends: {e}")

async def analyze_land_cover(land_cover_data: Dict[str, Any]):
    """Background task to analyze land cover data"""
    try:
        logger.info(f"Analyzing land cover data for {land_cover_data.get('total_area_hectares', 0):.2f} hectares")
        # In production, this would perform deeper analysis and store results
    except Exception as e:
        logger.error(f"Error analyzing land cover data: {e}")

