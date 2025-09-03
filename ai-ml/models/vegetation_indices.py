"""
Vegetation Indices Calculation Module
Calculates various vegetation indices from satellite imagery for carbon estimation
"""

import numpy as np
import rasterio
from typing import Dict, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class VegetationIndicesCalculator:
    """
    Calculator for various vegetation indices used in carbon estimation
    """
    
    @staticmethod
    def calculate_ndvi(red: np.ndarray, nir: np.ndarray) -> np.ndarray:
        """
        Calculate Normalized Difference Vegetation Index (NDVI)
        NDVI = (NIR - Red) / (NIR + Red)
        """
        # Avoid division by zero
        denominator = nir + red
        denominator = np.where(denominator == 0, 1e-10, denominator)
        
        ndvi = (nir - red) / denominator
        # Clip values to valid range [-1, 1]
        ndvi = np.clip(ndvi, -1, 1)
        
        return ndvi
    
    @staticmethod
    def calculate_evi(nir: np.ndarray, red: np.ndarray, blue: np.ndarray) -> np.ndarray:
        """
        Calculate Enhanced Vegetation Index (EVI)
        EVI = 2.5 * (NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1)
        """
        # Avoid division by zero
        denominator = nir + 6 * red - 7.5 * blue + 1
        denominator = np.where(denominator == 0, 1e-10, denominator)
        
        evi = 2.5 * (nir - red) / denominator
        # Clip values to valid range [-1, 1]
        evi = np.clip(evi, -1, 1)
        
        return evi
    
    @staticmethod
    def calculate_savi(nir: np.ndarray, red: np.ndarray, l: float = 0.5) -> np.ndarray:
        """
        Calculate Soil Adjusted Vegetation Index (SAVI)
        SAVI = (NIR - Red) / (NIR + Red + L) * (1 + L)
        """
        # Avoid division by zero
        denominator = nir + red + l
        denominator = np.where(denominator == 0, 1e-10, denominator)
        
        savi = (nir - red) / denominator * (1 + l)
        # Clip values to valid range [-1, 1]
        savi = np.clip(savi, -1, 1)
        
        return savi
    
    @staticmethod
    def calculate_ndwi(nir: np.ndarray, swir: np.ndarray) -> np.ndarray:
        """
        Calculate Normalized Difference Water Index (NDWI)
        NDWI = (NIR - SWIR) / (NIR + SWIR)
        """
        # Avoid division by zero
        denominator = nir + swir
        denominator = np.where(denominator == 0, 1e-10, denominator)
        
        ndwi = (nir - swir) / denominator
        # Clip values to valid range [-1, 1]
        ndwi = np.clip(ndwi, -1, 1)
        
        return ndwi
    
    @staticmethod
    def calculate_gci(nir: np.ndarray, green: np.ndarray) -> np.ndarray:
        """
        Calculate Green Chlorophyll Index (GCI)
        GCI = (NIR / Green) - 1
        """
        # Avoid division by zero
        green = np.where(green == 0, 1e-10, green)
        
        gci = (nir / green) - 1
        # Clip values to reasonable range
        gci = np.clip(gci, -1, 10)
        
        return gci
    
    @staticmethod
    def calculate_all_indices(bands: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        """
        Calculate all vegetation indices from satellite bands
        
        Args:
            bands: Dictionary containing band data with keys like 'red', 'nir', 'blue', 'swir', 'green'
        
        Returns:
            Dictionary containing calculated vegetation indices
        """
        indices = {}
        
        try:
            # NDVI (requires red and nir)
            if 'red' in bands and 'nir' in bands:
                indices['ndvi'] = VegetationIndicesCalculator.calculate_ndvi(
                    bands['red'], bands['nir']
                )
            
            # EVI (requires nir, red, and blue)
            if 'nir' in bands and 'red' in bands and 'blue' in bands:
                indices['evi'] = VegetationIndicesCalculator.calculate_evi(
                    bands['nir'], bands['red'], bands['blue']
                )
            
            # SAVI (requires nir and red)
            if 'nir' in bands and 'red' in bands:
                indices['savi'] = VegetationIndicesCalculator.calculate_savi(
                    bands['nir'], bands['red']
                )
            
            # NDWI (requires nir and swir)
            if 'nir' in bands and 'swir' in bands:
                indices['ndwi'] = VegetationIndicesCalculator.calculate_ndwi(
                    bands['nir'], bands['swir']
                )
            
            # GCI (requires nir and green)
            if 'nir' in bands and 'green' in bands:
                indices['gci'] = VegetationIndicesCalculator.calculate_gci(
                    bands['nir'], bands['green']
                )
            
            logger.info(f"Calculated {len(indices)} vegetation indices")
            
        except Exception as e:
            logger.error(f"Error calculating vegetation indices: {e}")
            raise
        
        return indices
    
    @staticmethod
    def get_index_statistics(indices: Dict[str, np.ndarray]) -> Dict[str, Dict]:
        """
        Calculate statistics for vegetation indices
        
        Args:
            indices: Dictionary containing vegetation indices
        
        Returns:
            Dictionary containing statistics for each index
        """
        stats = {}
        
        for index_name, index_data in indices.items():
            # Remove invalid values (NaN, inf)
            valid_data = index_data[np.isfinite(index_data)]
            
            if len(valid_data) > 0:
                stats[index_name] = {
                    'mean': float(np.mean(valid_data)),
                    'std': float(np.std(valid_data)),
                    'min': float(np.min(valid_data)),
                    'max': float(np.max(valid_data)),
                    'median': float(np.median(valid_data)),
                    'percentile_25': float(np.percentile(valid_data, 25)),
                    'percentile_75': float(np.percentile(valid_data, 75)),
                    'valid_pixels': int(len(valid_data)),
                    'total_pixels': int(index_data.size)
                }
            else:
                stats[index_name] = {
                    'mean': 0.0,
                    'std': 0.0,
                    'min': 0.0,
                    'max': 0.0,
                    'median': 0.0,
                    'percentile_25': 0.0,
                    'percentile_75': 0.0,
                    'valid_pixels': 0,
                    'total_pixels': int(index_data.size)
                }
        
        return stats
    
    @staticmethod
    def validate_bands(bands: Dict[str, np.ndarray]) -> bool:
        """
        Validate that band data is suitable for vegetation index calculation
        
        Args:
            bands: Dictionary containing band data
        
        Returns:
            True if bands are valid, False otherwise
        """
        required_bands = ['red', 'nir']
        
        # Check if required bands are present
        for band in required_bands:
            if band not in bands:
                logger.error(f"Required band '{band}' not found")
                return False
        
        # Check if bands have the same shape
        shapes = [bands[band].shape for band in bands.keys()]
        if len(set(shapes)) > 1:
            logger.error("All bands must have the same shape")
            return False
        
        # Check for valid data ranges (assuming 0-1 normalized values)
        for band_name, band_data in bands.items():
            if np.any(band_data < 0) or np.any(band_data > 1):
                logger.warning(f"Band '{band_name}' contains values outside expected range [0, 1]")
        
        return True

