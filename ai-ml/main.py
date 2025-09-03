"""
AI/ML Service for Blue Carbon MRV Platform
Main FastAPI application for carbon sequestration estimation
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from config.settings import settings
from config.database import init_database
from config.logging_config import setup_logging
from services.model_service import ModelService
from services.gee_service import GoogleEarthEngineService
from api.routes import carbon_estimation, satellite_data, model_management
from middleware.auth import verify_api_key

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Global services
model_service = None
gee_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global model_service, gee_service
    
    # Startup
    logger.info("Starting AI/ML Service...")
    
    try:
        # Initialize database
        await init_database()
        
        # Initialize services
        model_service = ModelService()
        gee_service = GoogleEarthEngineService()
        
        # Load pre-trained models
        await model_service.load_models()
        
        # Initialize Google Earth Engine
        await gee_service.initialize()
        
        # Set global services for dependency injection
        from api.routes import carbon_estimation, satellite_data, model_management
        carbon_estimation.model_service = model_service
        carbon_estimation.gee_service = gee_service
        satellite_data.gee_service = gee_service
        model_management.model_service = model_service
        
        logger.info("AI/ML Service started successfully")
        
    except Exception as e:
        logger.error(f"Failed to start AI/ML Service: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI/ML Service...")

# Create FastAPI app
app = FastAPI(
    title="Blue Carbon MRV AI/ML Service",
    description="AI/ML service for carbon sequestration estimation using satellite data and IoT sensors",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(
    carbon_estimation.router,
    prefix="/api/v1/carbon",
    tags=["Carbon Estimation"],
    dependencies=[Depends(verify_api_key)]
)

app.include_router(
    satellite_data.router,
    prefix="/api/v1/satellite",
    tags=["Satellite Data"],
    dependencies=[Depends(verify_api_key)]
)

app.include_router(
    model_management.router,
    prefix="/api/v1/models",
    tags=["Model Management"],
    dependencies=[Depends(verify_api_key)]
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check if services are initialized
        if model_service is None or gee_service is None:
            raise HTTPException(status_code=503, detail="Services not initialized")
        
        # Check model service health
        model_health = await model_service.health_check()
        
        # Check GEE service health
        gee_health = await gee_service.health_check()
        
        return JSONResponse(
            status_code=200,
            content={
                "status": "healthy",
                "services": {
                    "model_service": model_health,
                    "gee_service": gee_health
                }
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Blue Carbon MRV AI/ML Service",
        "version": "1.0.0",
        "status": "running"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
