"""
Configuration settings for the AI/ML service
"""

import os
from typing import List
from pydantic import BaseSettings, validator

class Settings(BaseSettings):
    """Application settings"""
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    
    # Database Configuration
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/blue_carbon_mrv"
    REDIS_URL: str = "redis://localhost:6379"
    
    # Google Earth Engine Configuration
    GEE_SERVICE_ACCOUNT_EMAIL: str = ""
    GEE_PRIVATE_KEY_PATH: str = ""
    GEE_PROJECT_ID: str = ""
    
    # Model Configuration
    MODEL_UPDATE_INTERVAL: int = 3600  # seconds
    MODEL_RETRAIN_THRESHOLD: int = 1000  # new data points
    CARBON_ESTIMATION_CONFIDENCE_THRESHOLD: float = 0.8
    
    # API Configuration
    BACKEND_API_URL: str = "http://localhost:3000"
    API_KEY: str = "your-api-key-here"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "/app/logs/ai-ml.log"
    
    # File Storage
    UPLOAD_DIR: str = "/app/data/uploads"
    MODEL_DIR: str = "/app/models"
    TEMP_DIR: str = "/app/data/temp"
    
    @validator('CORS_ORIGINS', pre=True)
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create global settings instance
settings = Settings()

