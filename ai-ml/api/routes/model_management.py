"""
Model Management API Routes
Handles model training, retraining, and management requests
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import logging
from datetime import datetime

from services.model_service import ModelService

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models for request/response
class TrainingDataRequest(BaseModel):
    """Request model for training data"""
    satellite_data: Dict[str, Any] = Field(..., description="Satellite data and vegetation indices")
    sensor_data: Dict[str, Any] = Field(..., description="IoT sensor readings")
    field_measurements: Dict[str, Any] = Field(..., description="Field measurement data")
    project_data: Dict[str, Any] = Field(..., description="Project information")
    carbon_estimate: float = Field(..., description="Actual carbon sequestration value")

class RetrainModelRequest(BaseModel):
    """Request model for model retraining"""
    training_data: List[TrainingDataRequest] = Field(..., description="New training data")
    validation_split: float = Field(0.2, description="Validation split ratio")
    epochs: int = Field(50, description="Number of training epochs")

class ModelInfoResponse(BaseModel):
    """Response model for model information"""
    status: str
    model_loaded: bool
    model_path: str
    last_update: Optional[str]
    model_info: Optional[Dict[str, Any]]

class RetrainResponse(BaseModel):
    """Response model for model retraining"""
    status: str
    samples_used: int
    performance_metrics: Dict[str, Any]
    last_update: str

class PredictionRequest(BaseModel):
    """Request model for model prediction"""
    satellite_data: Optional[Dict[str, Any]] = Field(None, description="Satellite data")
    sensor_data: Optional[Dict[str, Any]] = Field(None, description="Sensor data")
    field_measurements: Optional[Dict[str, Any]] = Field(None, description="Field measurements")
    project_data: Dict[str, Any] = Field(..., description="Project data")

class PredictionResponse(BaseModel):
    """Response model for model prediction"""
    carbon_estimate_tonnes_co2_per_hectare_per_year: float
    confidence: float
    timestamp: str
    model_version: str
    analysis: Dict[str, Any]

# Global service (will be injected)
model_service: Optional[ModelService] = None

def get_model_service() -> ModelService:
    """Dependency to get model service"""
    if model_service is None:
        raise HTTPException(status_code=503, detail="Model service not available")
    return model_service

@router.get("/info", response_model=ModelInfoResponse)
async def get_model_info(
    model_svc: ModelService = Depends(get_model_service)
):
    """
    Get information about the current model
    
    This endpoint provides details about the loaded model including
    its status, configuration, and performance metrics.
    """
    try:
        logger.info("Retrieving model information")
        
        # Get model health check
        health_info = await model_svc.health_check()
        
        # Prepare response
        response = ModelInfoResponse(
            status=health_info['status'],
            model_loaded=health_info['model_loaded'],
            model_path=health_info['model_path'],
            last_update=health_info.get('last_update'),
            model_info=health_info.get('model_info')
        )
        
        logger.info("Model information retrieved successfully")
        
        return response
        
    except Exception as e:
        logger.error(f"Error retrieving model information: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve model information: {str(e)}")

@router.post("/retrain", response_model=RetrainResponse)
async def retrain_model(
    request: RetrainModelRequest,
    background_tasks: BackgroundTasks,
    model_svc: ModelService = Depends(get_model_service)
):
    """
    Retrain the model with new data
    
    This endpoint retrains the carbon estimation model using new training data
    to improve prediction accuracy and adapt to new conditions.
    """
    try:
        logger.info(f"Retraining model with {len(request.training_data)} new samples")
        
        # Convert training data to the format expected by the model service
        training_data = []
        for sample in request.training_data:
            training_data.append({
                'satellite_data': sample.satellite_data,
                'sensor_data': sample.sensor_data,
                'field_measurements': sample.field_measurements,
                'project_data': sample.project_data,
                'carbon_estimate': sample.carbon_estimate
            })
        
        # Retrain the model
        retrain_result = await model_svc.retrain_model(training_data)
        
        # Add to background tasks for logging
        background_tasks.add_task(
            log_model_retraining,
            len(training_data),
            retrain_result
        )
        
        # Prepare response
        response = RetrainResponse(
            status=retrain_result['status'],
            samples_used=retrain_result['samples_used'],
            performance_metrics=retrain_result['performance_metrics'],
            last_update=retrain_result['last_update']
        )
        
        logger.info("Model retraining completed successfully")
        
        return response
        
    except Exception as e:
        logger.error(f"Error retraining model: {e}")
        raise HTTPException(status_code=500, detail=f"Model retraining failed: {str(e)}")

@router.post("/predict", response_model=PredictionResponse)
async def predict_carbon(
    request: PredictionRequest,
    model_svc: ModelService = Depends(get_model_service)
):
    """
    Make a carbon sequestration prediction
    
    This endpoint uses the trained model to predict carbon sequestration
    for a given set of input data.
    """
    try:
        logger.info("Making carbon sequestration prediction")
        
        # Make prediction
        prediction = await model_svc.predict_carbon_sequestration(
            satellite_data=request.satellite_data or {},
            sensor_data=request.sensor_data or {},
            field_measurements=request.field_measurements or {},
            project_data=request.project_data
        )
        
        # Prepare response
        response = PredictionResponse(
            carbon_estimate_tonnes_co2_per_hectare_per_year=prediction['carbon_estimate_tonnes_co2_per_hectare_per_year'],
            confidence=prediction['confidence'],
            timestamp=prediction['timestamp'],
            model_version=prediction['model_version'],
            analysis=prediction.get('analysis', {})
        )
        
        logger.info(f"Carbon prediction completed: {response.carbon_estimate_tonnes_co2_per_hectare_per_year:.2f} tCO2/ha/year")
        
        return response
        
    except Exception as e:
        logger.error(f"Error making carbon prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Carbon prediction failed: {str(e)}")

@router.post("/validate")
async def validate_model(
    validation_data: List[TrainingDataRequest],
    model_svc: ModelService = Depends(get_model_service)
):
    """
    Validate the model performance on test data
    
    This endpoint evaluates the model's performance on validation data
    to assess its accuracy and reliability.
    """
    try:
        logger.info(f"Validating model with {len(validation_data)} samples")
        
        # Convert validation data
        test_data = []
        for sample in validation_data:
            test_data.append({
                'satellite_data': sample.satellite_data,
                'sensor_data': sample.sensor_data,
                'field_measurements': sample.field_measurements,
                'project_data': sample.project_data,
                'carbon_estimate': sample.carbon_estimate
            })
        
        # Perform validation
        validation_results = await validate_model_performance(model_svc, test_data)
        
        logger.info("Model validation completed successfully")
        
        return validation_results
        
    except Exception as e:
        logger.error(f"Error validating model: {e}")
        raise HTTPException(status_code=500, detail=f"Model validation failed: {str(e)}")

@router.get("/performance")
async def get_model_performance(
    model_svc: ModelService = Depends(get_model_service)
):
    """
    Get model performance metrics
    
    This endpoint provides current model performance metrics including
    accuracy, precision, recall, and other relevant statistics.
    """
    try:
        logger.info("Retrieving model performance metrics")
        
        # Get model health check which includes performance info
        health_info = await model_svc.health_check()
        
        # Extract performance metrics
        performance_metrics = {
            'model_status': health_info['status'],
            'model_loaded': health_info['model_loaded'],
            'last_update': health_info.get('last_update'),
            'model_info': health_info.get('model_info', {})
        }
        
        # Add additional performance metrics if available
        if health_info.get('model_info'):
            model_info = health_info['model_info']
            performance_metrics.update({
                'input_shape': model_info.get('input_shape'),
                'output_shape': model_info.get('output_shape'),
                'total_params': model_info.get('total_params'),
                'feature_columns': model_info.get('feature_columns', []),
                'ecosystem_types': model_info.get('ecosystem_types', {})
            })
        
        logger.info("Model performance metrics retrieved successfully")
        
        return performance_metrics
        
    except Exception as e:
        logger.error(f"Error retrieving model performance: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve model performance: {str(e)}")

@router.post("/export")
async def export_model(
    export_format: str = "h5",
    model_svc: ModelService = Depends(get_model_service)
):
    """
    Export the trained model
    
    This endpoint exports the trained model in the specified format
    for deployment or sharing purposes.
    """
    try:
        logger.info(f"Exporting model in {export_format} format")
        
        # Get model info
        health_info = await model_svc.health_check()
        
        if not health_info['model_loaded']:
            raise HTTPException(status_code=400, detail="No model loaded to export")
        
        # Prepare export information
        export_info = {
            'export_format': export_format,
            'model_path': health_info['model_path'],
            'model_info': health_info.get('model_info', {}),
            'last_update': health_info.get('last_update'),
            'export_timestamp': datetime.utcnow().isoformat()
        }
        
        # In production, this would actually export the model files
        # For now, we'll return the export information
        
        logger.info("Model export information prepared successfully")
        
        return export_info
        
    except Exception as e:
        logger.error(f"Error exporting model: {e}")
        raise HTTPException(status_code=500, detail=f"Model export failed: {str(e)}")

async def validate_model_performance(model_svc: ModelService, test_data: List[Dict]) -> Dict[str, Any]:
    """Validate model performance on test data"""
    
    predictions = []
    actual_values = []
    
    for sample in test_data:
        try:
            # Make prediction
            prediction = await model_svc.predict_carbon_sequestration(
                satellite_data=sample['satellite_data'],
                sensor_data=sample['sensor_data'],
                field_measurements=sample['field_measurements'],
                project_data=sample['project_data']
            )
            
            predictions.append(prediction['carbon_estimate_tonnes_co2_per_hectare_per_year'])
            actual_values.append(sample['carbon_estimate'])
            
        except Exception as e:
            logger.warning(f"Error making prediction for validation sample: {e}")
            continue
    
    if not predictions:
        return {'error': 'No valid predictions made'}
    
    # Calculate performance metrics
    import numpy as np
    
    predictions = np.array(predictions)
    actual_values = np.array(actual_values)
    
    # Calculate metrics
    mae = np.mean(np.abs(predictions - actual_values))
    mse = np.mean((predictions - actual_values) ** 2)
    rmse = np.sqrt(mse)
    mape = np.mean(np.abs((actual_values - predictions) / actual_values)) * 100
    
    # Calculate R-squared
    ss_res = np.sum((actual_values - predictions) ** 2)
    ss_tot = np.sum((actual_values - np.mean(actual_values)) ** 2)
    r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
    
    return {
        'total_samples': len(test_data),
        'valid_predictions': len(predictions),
        'mae': float(mae),
        'mse': float(mse),
        'rmse': float(rmse),
        'mape': float(mape),
        'r_squared': float(r_squared),
        'validation_timestamp': datetime.utcnow().isoformat()
    }

async def log_model_retraining(samples_count: int, retrain_result: Dict[str, Any]):
    """Background task to log model retraining"""
    try:
        logger.info(f"Model retraining logged: {samples_count} samples, status: {retrain_result['status']}")
        # In production, this would log to a database or analytics service
    except Exception as e:
        logger.error(f"Error logging model retraining: {e}")

