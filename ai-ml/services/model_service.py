"""
Model Service for managing AI/ML models and predictions
"""

import os
import logging
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import numpy as np
import pandas as pd
from models.carbon_estimation_model import CarbonEstimationModel
from models.vegetation_indices import VegetationIndicesCalculator
from config.settings import settings

logger = logging.getLogger(__name__)

class ModelService:
    """
    Service for managing AI/ML models and making predictions
    """
    
    def __init__(self):
        self.carbon_model = None
        self.model_loaded = False
        self.model_path = os.path.join(settings.MODEL_DIR, 'carbon_estimation')
        self.last_update = None
        
    async def load_models(self):
        """Load pre-trained models"""
        try:
            # Create model directory if it doesn't exist
            os.makedirs(self.model_path, exist_ok=True)
            
            # Check if model files exist
            model_file = os.path.join(self.model_path, 'carbon_estimation_model.h5')
            scaler_file = os.path.join(self.model_path, 'scaler.pkl')
            
            if os.path.exists(model_file) and os.path.exists(scaler_file):
                # Load existing model
                self.carbon_model = CarbonEstimationModel()
                self.carbon_model.load_model(self.model_path)
                self.model_loaded = True
                logger.info("Carbon estimation model loaded successfully")
            else:
                # Create and train a new model with sample data
                logger.info("No pre-trained model found, creating new model with sample data")
                await self._create_sample_model()
                
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise
    
    async def _create_sample_model(self):
        """Create a sample model with synthetic training data"""
        try:
            # Generate synthetic training data
            training_data = self._generate_synthetic_training_data()
            
            # Create and train model
            self.carbon_model = CarbonEstimationModel()
            self.carbon_model.train(training_data)
            
            # Save the model
            self.carbon_model.save_model(self.model_path)
            self.model_loaded = True
            
            logger.info("Sample carbon estimation model created and saved")
            
        except Exception as e:
            logger.error(f"Error creating sample model: {e}")
            raise
    
    def _generate_synthetic_training_data(self) -> List[Dict]:
        """Generate synthetic training data for model training"""
        
        training_data = []
        
        # Generate data for different ecosystem types
        ecosystem_types = ['mangrove', 'saltmarsh', 'seagrass', 'tidal_marsh']
        
        for ecosystem in ecosystem_types:
            for _ in range(250):  # 250 samples per ecosystem type
                # Generate realistic satellite data
                satellite_data = {
                    'ndvi': np.random.normal(0.6, 0.2),
                    'evi': np.random.normal(0.4, 0.15),
                    'savi': np.random.normal(0.5, 0.18),
                    'ndwi': np.random.normal(0.3, 0.2)
                }
                
                # Generate realistic sensor data
                sensor_data = {
                    'temperature': np.random.normal(25, 5),
                    'humidity': np.random.normal(75, 10),
                    'soil_moisture': np.random.normal(0.6, 0.2),
                    'salinity': np.random.normal(35, 5),
                    'ph': np.random.normal(7.5, 0.5),
                    'organic_matter': np.random.normal(3, 1)
                }
                
                # Generate realistic field measurements
                field_measurements = {
                    'biomass_density': np.random.normal(15, 5),
                    'canopy_height': np.random.normal(8, 3)
                }
                
                # Generate project data
                project_data = {
                    'area_hectares': np.random.uniform(1, 100),
                    'ecosystem_type': ecosystem
                }
                
                # Generate realistic carbon estimate based on ecosystem type
                base_carbon = {
                    'mangrove': 12.0,
                    'saltmarsh': 8.0,
                    'seagrass': 6.0,
                    'tidal_marsh': 7.0
                }
                
                carbon_estimate = base_carbon[ecosystem] + np.random.normal(0, 2)
                carbon_estimate = max(0, carbon_estimate)  # Ensure non-negative
                
                training_data.append({
                    'satellite_data': satellite_data,
                    'sensor_data': sensor_data,
                    'field_measurements': field_measurements,
                    'project_data': project_data,
                    'carbon_estimate': carbon_estimate
                })
        
        return training_data
    
    async def predict_carbon_sequestration(
        self,
        satellite_data: Dict[str, Any],
        sensor_data: Dict[str, Any],
        field_measurements: Dict[str, Any],
        project_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Predict carbon sequestration for given input data
        
        Args:
            satellite_data: Satellite imagery data and vegetation indices
            sensor_data: IoT sensor readings
            field_measurements: Field measurement data
            project_data: Project information including area and ecosystem type
        
        Returns:
            Carbon sequestration prediction with confidence
        """
        try:
            if not self.model_loaded or self.carbon_model is None:
                raise ValueError("Model not loaded")
            
            # Prepare input data
            input_data = {
                'satellite_data': satellite_data,
                'sensor_data': sensor_data,
                'field_measurements': field_measurements,
                'project_data': project_data
            }
            
            # Make prediction
            prediction = self.carbon_model.predict(input_data)
            
            # Add additional analysis
            prediction['analysis'] = self._analyze_prediction(input_data, prediction)
            
            logger.info(f"Carbon sequestration prediction completed: {prediction['carbon_estimate_tonnes_co2_per_hectare_per_year']:.2f} tCO2/ha/year")
            
            return prediction
            
        except Exception as e:
            logger.error(f"Error making carbon sequestration prediction: {e}")
            raise
    
    def _analyze_prediction(self, input_data: Dict, prediction: Dict) -> Dict[str, Any]:
        """Analyze the prediction and provide insights"""
        
        analysis = {
            'confidence_level': 'high' if prediction['confidence'] > 0.8 else 'medium' if prediction['confidence'] > 0.6 else 'low',
            'data_quality': self._assess_data_quality(input_data),
            'recommendations': self._generate_recommendations(input_data, prediction)
        }
        
        return analysis
    
    def _assess_data_quality(self, input_data: Dict) -> Dict[str, Any]:
        """Assess the quality of input data"""
        
        quality_score = 0
        max_score = 0
        issues = []
        
        # Check satellite data
        satellite_data = input_data.get('satellite_data', {})
        if satellite_data:
            max_score += 4
            if 'ndvi' in satellite_data:
                quality_score += 1
            if 'evi' in satellite_data:
                quality_score += 1
            if 'savi' in satellite_data:
                quality_score += 1
            if 'ndwi' in satellite_data:
                quality_score += 1
        else:
            issues.append("No satellite data provided")
        
        # Check sensor data
        sensor_data = input_data.get('sensor_data', {})
        if sensor_data:
            max_score += 3
            if 'temperature' in sensor_data:
                quality_score += 1
            if 'soil_moisture' in sensor_data:
                quality_score += 1
            if 'salinity' in sensor_data:
                quality_score += 1
        else:
            issues.append("No sensor data provided")
        
        # Check field measurements
        field_measurements = input_data.get('field_measurements', {})
        if field_measurements:
            max_score += 2
            if 'biomass_density' in field_measurements:
                quality_score += 1
            if 'canopy_height' in field_measurements:
                quality_score += 1
        else:
            issues.append("No field measurements provided")
        
        # Calculate quality percentage
        quality_percentage = (quality_score / max_score * 100) if max_score > 0 else 0
        
        return {
            'score': quality_percentage,
            'level': 'high' if quality_percentage > 80 else 'medium' if quality_percentage > 60 else 'low',
            'issues': issues
        }
    
    def _generate_recommendations(self, input_data: Dict, prediction: Dict) -> List[str]:
        """Generate recommendations based on prediction and data quality"""
        
        recommendations = []
        
        # Check data quality
        data_quality = self._assess_data_quality(input_data)
        if data_quality['score'] < 60:
            recommendations.append("Consider collecting more comprehensive data to improve prediction accuracy")
        
        # Check confidence level
        if prediction['confidence'] < 0.7:
            recommendations.append("Prediction confidence is low. Consider additional field measurements")
        
        # Check ecosystem type
        ecosystem_type = input_data.get('project_data', {}).get('ecosystem_type', '')
        if ecosystem_type == 'mangrove':
            recommendations.append("Mangrove ecosystems typically have high carbon sequestration potential")
        elif ecosystem_type == 'seagrass':
            recommendations.append("Seagrass meadows are important carbon sinks but require careful monitoring")
        
        # Check area size
        area_hectares = input_data.get('project_data', {}).get('area_hectares', 0)
        if area_hectares < 1:
            recommendations.append("Small project areas may have higher uncertainty in carbon estimates")
        
        return recommendations
    
    async def retrain_model(self, new_data: List[Dict]) -> Dict[str, Any]:
        """
        Retrain the model with new data
        
        Args:
            new_data: List of new training samples
        
        Returns:
            Training results and model performance metrics
        """
        try:
            if not self.model_loaded or self.carbon_model is None:
                raise ValueError("Model not loaded")
            
            logger.info(f"Retraining model with {len(new_data)} new samples")
            
            # Combine with existing training data (if available)
            # For now, we'll use the new data only
            training_data = new_data
            
            # Retrain the model
            history = self.carbon_model.train(training_data)
            
            # Save the updated model
            self.carbon_model.save_model(self.model_path)
            
            # Update last update timestamp
            self.last_update = datetime.utcnow()
            
            # Calculate performance metrics
            performance_metrics = self._calculate_performance_metrics(history)
            
            logger.info("Model retraining completed successfully")
            
            return {
                'status': 'success',
                'samples_used': len(training_data),
                'performance_metrics': performance_metrics,
                'last_update': self.last_update.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error retraining model: {e}")
            raise
    
    def _calculate_performance_metrics(self, history) -> Dict[str, Any]:
        """Calculate model performance metrics from training history"""
        
        if hasattr(history, 'history'):
            # Keras history object
            final_loss = history.history['loss'][-1]
            final_mae = history.history['mae'][-1]
            final_mape = history.history['mape'][-1]
            
            # Validation metrics if available
            val_loss = history.history.get('val_loss', [None])[-1]
            val_mae = history.history.get('val_mae', [None])[-1]
            val_mape = history.history.get('val_mape', [None])[-1]
            
            return {
                'final_loss': float(final_loss),
                'final_mae': float(final_mae),
                'final_mape': float(final_mape),
                'val_loss': float(val_loss) if val_loss is not None else None,
                'val_mae': float(val_mae) if val_mae is not None else None,
                'val_mape': float(val_mape) if val_mape is not None else None,
                'epochs_trained': len(history.history['loss'])
            }
        else:
            return {
                'status': 'history_not_available'
            }
    
    async def health_check(self) -> Dict[str, Any]:
        """Check model service health"""
        try:
            return {
                'status': 'healthy',
                'model_loaded': self.model_loaded,
                'model_path': self.model_path,
                'last_update': self.last_update.isoformat() if self.last_update else None,
                'model_info': self.carbon_model.get_model_info() if self.carbon_model else None
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e)
            }

