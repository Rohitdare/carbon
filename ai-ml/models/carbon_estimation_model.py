"""
Carbon Sequestration Estimation Model
Uses satellite imagery, IoT sensor data, and field measurements to estimate carbon storage
"""

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import joblib
from typing import Dict, List, Tuple, Optional
import logging
from datetime import datetime
import os

logger = logging.getLogger(__name__)

class CarbonEstimationModel:
    """
    Deep learning model for estimating carbon sequestration in blue carbon ecosystems
    """
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path
        self.model = None
        self.scaler = None
        self.feature_columns = [
            'ndvi', 'evi', 'savi', 'ndwi',  # Vegetation indices
            'temperature', 'humidity', 'soil_moisture',  # Environmental factors
            'salinity', 'ph', 'organic_matter',  # Soil properties
            'biomass_density', 'canopy_height',  # Biomass indicators
            'area_hectares', 'ecosystem_type_encoded'  # Spatial and categorical
        ]
        self.ecosystem_types = {
            'mangrove': 0,
            'saltmarsh': 1,
            'seagrass': 2,
            'tidal_marsh': 3
        }
        
    def build_model(self, input_shape: int) -> keras.Model:
        """Build the neural network architecture"""
        
        model = keras.Sequential([
            # Input layer
            layers.Dense(128, activation='relu', input_shape=(input_shape,)),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            # Hidden layers
            layers.Dense(256, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.4),
            
            layers.Dense(128, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            layers.Dense(64, activation='relu'),
            layers.Dropout(0.2),
            
            # Output layer - carbon sequestration in tonnes CO2 per hectare per year
            layers.Dense(1, activation='linear')
        ])
        
        # Compile model
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae', 'mape']
        )
        
        return model
    
    def prepare_features(self, data: Dict) -> np.ndarray:
        """Prepare input features for the model"""
        
        # Extract satellite data
        satellite_data = data.get('satellite_data', {})
        ndvi = satellite_data.get('ndvi', 0.0)
        evi = satellite_data.get('evi', 0.0)
        savi = satellite_data.get('savi', 0.0)
        ndwi = satellite_data.get('ndwi', 0.0)
        
        # Extract sensor data
        sensor_data = data.get('sensor_data', {})
        temperature = sensor_data.get('temperature', 25.0)
        humidity = sensor_data.get('humidity', 70.0)
        soil_moisture = sensor_data.get('soil_moisture', 0.5)
        salinity = sensor_data.get('salinity', 35.0)
        ph = sensor_data.get('ph', 7.0)
        organic_matter = sensor_data.get('organic_matter', 2.0)
        
        # Extract field measurements
        field_measurements = data.get('field_measurements', {})
        biomass_density = field_measurements.get('biomass_density', 10.0)
        canopy_height = field_measurements.get('canopy_height', 5.0)
        
        # Extract project data
        project_data = data.get('project_data', {})
        area_hectares = project_data.get('area_hectares', 1.0)
        ecosystem_type = project_data.get('ecosystem_type', 'mangrove')
        ecosystem_type_encoded = self.ecosystem_types.get(ecosystem_type, 0)
        
        # Create feature vector
        features = np.array([
            ndvi, evi, savi, ndwi,
            temperature, humidity, soil_moisture,
            salinity, ph, organic_matter,
            biomass_density, canopy_height,
            area_hectares, ecosystem_type_encoded
        ])
        
        return features.reshape(1, -1)
    
    def train(self, training_data: List[Dict], validation_data: List[Dict] = None):
        """Train the carbon estimation model"""
        
        logger.info(f"Training model with {len(training_data)} samples")
        
        # Prepare training data
        X_train = []
        y_train = []
        
        for sample in training_data:
            features = self.prepare_features(sample)
            carbon_estimate = sample.get('carbon_estimate', 0.0)
            
            X_train.append(features.flatten())
            y_train.append(carbon_estimate)
        
        X_train = np.array(X_train)
        y_train = np.array(y_train)
        
        # Normalize features
        from sklearn.preprocessing import StandardScaler
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        
        # Build and train model
        self.model = self.build_model(X_train_scaled.shape[1])
        
        # Prepare validation data if provided
        validation_split = 0.2
        if validation_data:
            X_val = []
            y_val = []
            
            for sample in validation_data:
                features = self.prepare_features(sample)
                carbon_estimate = sample.get('carbon_estimate', 0.0)
                
                X_val.append(features.flatten())
                y_val.append(carbon_estimate)
            
            X_val = np.array(X_val)
            y_val = np.array(y_val)
            X_val_scaled = self.scaler.transform(X_val)
            validation_split = None
        else:
            X_val_scaled = None
            y_val = None
        
        # Train model
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=20,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=10,
                min_lr=1e-7
            )
        ]
        
        history = self.model.fit(
            X_train_scaled, y_train,
            validation_data=(X_val_scaled, y_val) if validation_data else None,
            validation_split=validation_split,
            epochs=100,
            batch_size=32,
            callbacks=callbacks,
            verbose=1
        )
        
        logger.info("Model training completed")
        return history
    
    def predict(self, data: Dict) -> Dict:
        """Predict carbon sequestration for given data"""
        
        if self.model is None or self.scaler is None:
            raise ValueError("Model not trained or loaded")
        
        # Prepare features
        features = self.prepare_features(data)
        features_scaled = self.scaler.transform(features)
        
        # Make prediction
        prediction = self.model.predict(features_scaled, verbose=0)
        carbon_estimate = float(prediction[0][0])
        
        # Calculate confidence based on model uncertainty
        # This is a simplified approach - in production, use proper uncertainty quantification
        confidence = min(0.95, max(0.5, 1.0 - abs(carbon_estimate) * 0.01))
        
        return {
            'carbon_estimate_tonnes_co2_per_hectare_per_year': carbon_estimate,
            'confidence': confidence,
            'timestamp': datetime.utcnow().isoformat(),
            'model_version': '1.0.0'
        }
    
    def save_model(self, path: str):
        """Save the trained model and scaler"""
        
        if self.model is None or self.scaler is None:
            raise ValueError("No model to save")
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        # Save model
        model_path = os.path.join(path, 'carbon_estimation_model.h5')
        self.model.save(model_path)
        
        # Save scaler
        scaler_path = os.path.join(path, 'scaler.pkl')
        joblib.dump(self.scaler, scaler_path)
        
        # Save metadata
        metadata = {
            'feature_columns': self.feature_columns,
            'ecosystem_types': self.ecosystem_types,
            'model_version': '1.0.0',
            'created_at': datetime.utcnow().isoformat()
        }
        
        metadata_path = os.path.join(path, 'metadata.json')
        import json
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"Model saved to {path}")
    
    def load_model(self, path: str):
        """Load a trained model and scaler"""
        
        # Load model
        model_path = os.path.join(path, 'carbon_estimation_model.h5')
        self.model = keras.models.load_model(model_path)
        
        # Load scaler
        scaler_path = os.path.join(path, 'scaler.pkl')
        self.scaler = joblib.load(scaler_path)
        
        # Load metadata
        metadata_path = os.path.join(path, 'metadata.json')
        import json
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        self.feature_columns = metadata.get('feature_columns', self.feature_columns)
        self.ecosystem_types = metadata.get('ecosystem_types', self.ecosystem_types)
        
        logger.info(f"Model loaded from {path}")
    
    def get_model_info(self) -> Dict:
        """Get model information and statistics"""
        
        if self.model is None:
            return {'status': 'not_loaded'}
        
        return {
            'status': 'loaded',
            'input_shape': self.model.input_shape,
            'output_shape': self.model.output_shape,
            'total_params': self.model.count_params(),
            'feature_columns': self.feature_columns,
            'ecosystem_types': self.ecosystem_types
        }

