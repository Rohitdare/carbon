"""
Google Earth Engine Service
Handles satellite data retrieval and processing for carbon estimation
"""

import ee
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
import logging
from datetime import datetime, timedelta
import json
import os
from config.settings import settings

logger = logging.getLogger(__name__)

class GoogleEarthEngineService:
    """
    Service for interacting with Google Earth Engine API
    """
    
    def __init__(self):
        self.initialized = False
        self.service_account_email = settings.GEE_SERVICE_ACCOUNT_EMAIL
        self.private_key_path = settings.GEE_PRIVATE_KEY_PATH
        self.project_id = settings.GEE_PROJECT_ID
    
    async def initialize(self):
        """Initialize Google Earth Engine"""
        try:
            if not ee.data._initialized:
                # Initialize with service account if credentials are provided
                if self.service_account_email and self.private_key_path:
                    credentials = ee.ServiceAccountCredentials(
                        self.service_account_email,
                        self.private_key_path
                    )
                    ee.Initialize(credentials, project=self.project_id)
                else:
                    # Initialize with default credentials (for development)
                    ee.Initialize()
                
                self.initialized = True
                logger.info("Google Earth Engine initialized successfully")
            else:
                self.initialized = True
                logger.info("Google Earth Engine already initialized")
                
        except Exception as e:
            logger.error(f"Failed to initialize Google Earth Engine: {e}")
            raise
    
    async def health_check(self) -> Dict[str, Any]:
        """Check Google Earth Engine service health"""
        try:
            if not self.initialized:
                return {"status": "not_initialized", "error": "GEE not initialized"}
            
            # Test with a simple operation
            test_image = ee.Image('COPERNICUS/S2_SR/20230101T100319_20230101T100321_T32UPA')
            test_result = test_image.select('B4').getInfo()
            
            return {
                "status": "healthy",
                "initialized": self.initialized,
                "test_result": "success"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }
    
    async def get_satellite_data(
        self,
        geometry: Dict,
        start_date: str,
        end_date: str,
        cloud_cover_threshold: float = 20.0
    ) -> Dict[str, Any]:
        """
        Retrieve satellite data for a given geometry and time period
        
        Args:
            geometry: GeoJSON geometry object
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
            cloud_cover_threshold: Maximum cloud cover percentage
        
        Returns:
            Dictionary containing satellite data and vegetation indices
        """
        try:
            if not self.initialized:
                await self.initialize()
            
            # Convert geometry to EE geometry
            ee_geometry = ee.Geometry(geometry)
            
            # Get Sentinel-2 data
            collection = (ee.ImageCollection('COPERNICUS/S2_SR')
                         .filterDate(start_date, end_date)
                         .filterBounds(ee_geometry)
                         .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', cloud_cover_threshold)))
            
            # Get the most recent image
            image = collection.sort('system:time_start', False).first()
            
            if image is None:
                raise ValueError("No suitable satellite image found for the given criteria")
            
            # Clip image to geometry
            clipped_image = image.clip(ee_geometry)
            
            # Calculate vegetation indices
            vegetation_indices = self._calculate_vegetation_indices(clipped_image)
            
            # Get image metadata
            metadata = image.getInfo()
            
            # Calculate statistics for the area
            stats = self._calculate_area_statistics(clipped_image, ee_geometry)
            
            return {
                'image_id': metadata['id'],
                'acquisition_date': metadata['properties']['system:time_start'],
                'cloud_cover': metadata['properties']['CLOUDY_PIXEL_PERCENTAGE'],
                'vegetation_indices': vegetation_indices,
                'area_statistics': stats,
                'geometry': geometry,
                'processed_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error retrieving satellite data: {e}")
            raise
    
    def _calculate_vegetation_indices(self, image: ee.Image) -> Dict[str, float]:
        """Calculate vegetation indices from satellite image"""
        
        # Define band names for Sentinel-2
        bands = {
            'blue': 'B2',
            'green': 'B3', 
            'red': 'B4',
            'nir': 'B8',
            'swir1': 'B11',
            'swir2': 'B12'
        }
        
        # Calculate NDVI
        ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
        
        # Calculate EVI
        evi = image.expression(
            '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))',
            {
                'NIR': image.select('B8'),
                'RED': image.select('B4'),
                'BLUE': image.select('B2')
            }
        ).rename('EVI')
        
        # Calculate SAVI
        savi = image.expression(
            '((NIR - RED) / (NIR + RED + 0.5)) * 1.5',
            {
                'NIR': image.select('B8'),
                'RED': image.select('B4')
            }
        ).rename('SAVI')
        
        # Calculate NDWI
        ndwi = image.normalizedDifference(['B8', 'B11']).rename('NDWI')
        
        # Calculate GCI
        gci = image.expression(
            '(NIR / GREEN) - 1',
            {
                'NIR': image.select('B8'),
                'GREEN': image.select('B3')
            }
        ).rename('GCI')
        
        # Combine all indices
        indices_image = image.addBands([ndvi, evi, savi, ndwi, gci])
        
        # Calculate mean values for the area
        indices_stats = indices_image.select(['NDVI', 'EVI', 'SAVI', 'NDWI', 'GCI']).reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=image.geometry(),
            scale=10,  # Sentinel-2 resolution
            maxPixels=1e9
        )
        
        # Get the statistics
        stats = indices_stats.getInfo()
        
        return {
            'ndvi': float(stats.get('NDVI', 0.0)),
            'evi': float(stats.get('EVI', 0.0)),
            'savi': float(stats.get('SAVI', 0.0)),
            'ndwi': float(stats.get('NDWI', 0.0)),
            'gci': float(stats.get('GCI', 0.0))
        }
    
    def _calculate_area_statistics(self, image: ee.Image, geometry: ee.Geometry) -> Dict[str, Any]:
        """Calculate area statistics for the satellite image"""
        
        # Calculate area in hectares
        area = geometry.area().divide(10000)  # Convert from m² to hectares
        
        # Calculate basic statistics for key bands
        stats = image.select(['B2', 'B3', 'B4', 'B8', 'B11']).reduceRegion(
            reducer=ee.Reducer.mean().combine(
                ee.Reducer.minMax(), '', True
            ).combine(
                ee.Reducer.stdDev(), '', True
            ),
            geometry=geometry,
            scale=10,
            maxPixels=1e9
        )
        
        stats_info = stats.getInfo()
        
        return {
            'area_hectares': float(area.getInfo()),
            'band_statistics': stats_info
        }
    
    async def get_historical_data(
        self,
        geometry: Dict,
        start_date: str,
        end_date: str,
        interval_days: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Get historical satellite data for trend analysis
        
        Args:
            geometry: GeoJSON geometry object
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
            interval_days: Interval between data points in days
        
        Returns:
            List of satellite data for each time period
        """
        try:
            if not self.initialized:
                await self.initialize()
            
            # Convert dates
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = datetime.strptime(end_date, '%Y-%m-%d')
            
            historical_data = []
            current_date = start_dt
            
            while current_date < end_dt:
                # Calculate period end date
                period_end = min(current_date + timedelta(days=interval_days), end_dt)
                
                # Get data for this period
                try:
                    data = await self.get_satellite_data(
                        geometry=geometry,
                        start_date=current_date.strftime('%Y-%m-%d'),
                        end_date=period_end.strftime('%Y-%m-%d'),
                        cloud_cover_threshold=30.0  # More lenient for historical data
                    )
                    
                    historical_data.append(data)
                    
                except Exception as e:
                    logger.warning(f"No data available for period {current_date} to {period_end}: {e}")
                
                # Move to next period
                current_date = period_end
            
            return historical_data
            
        except Exception as e:
            logger.error(f"Error retrieving historical data: {e}")
            raise
    
    async def get_land_cover_classification(
        self,
        geometry: Dict,
        year: int = 2023
    ) -> Dict[str, Any]:
        """
        Get land cover classification for the area
        
        Args:
            geometry: GeoJSON geometry object
            year: Year for land cover data
        
        Returns:
            Land cover classification data
        """
        try:
            if not self.initialized:
                await self.initialize()
            
            # Use ESA WorldCover dataset
            ee_geometry = ee.Geometry(geometry)
            
            # Get WorldCover data for the specified year
            if year >= 2021:
                worldcover = ee.Image('ESA/WorldCover/v200/2021')
            else:
                worldcover = ee.Image('ESA/WorldCover/v100/2020')
            
            # Clip to geometry
            clipped_worldcover = worldcover.clip(ee_geometry)
            
            # Calculate area for each land cover class
            area_stats = clipped_worldcover.reduceRegion(
                reducer=ee.Reducer.frequencyHistogram(),
                geometry=ee_geometry,
                scale=10,
                maxPixels=1e9
            )
            
            # Get the statistics
            stats = area_stats.getInfo()
            
            # Convert pixel counts to areas (assuming 10m resolution)
            pixel_area_m2 = 100  # 10m x 10m
            total_area_m2 = ee_geometry.area().getInfo()
            
            land_cover_data = {}
            if 'Map' in stats:
                for class_id, pixel_count in stats['Map'].items():
                    class_area_m2 = pixel_count * pixel_area_m2
                    class_area_hectares = class_area_m2 / 10000
                    percentage = (class_area_m2 / total_area_m2) * 100
                    
                    land_cover_data[class_id] = {
                        'area_hectares': class_area_hectares,
                        'percentage': percentage,
                        'pixel_count': pixel_count
                    }
            
            return {
                'year': year,
                'total_area_hectares': total_area_m2 / 10000,
                'land_cover_classes': land_cover_data,
                'geometry': geometry,
                'processed_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error retrieving land cover classification: {e}")
            raise

