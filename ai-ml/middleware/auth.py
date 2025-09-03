"""
Authentication middleware for the AI/ML service
"""

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging
from config.settings import settings

logger = logging.getLogger(__name__)

# HTTP Bearer token scheme
security = HTTPBearer()

async def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify API key for service authentication
    
    Args:
        credentials: HTTP Bearer credentials containing the API key
    
    Returns:
        The API key if valid
    
    Raises:
        HTTPException: If the API key is invalid
    """
    try:
        api_key = credentials.credentials
        
        # Check if API key matches the configured key
        if api_key != settings.API_KEY:
            logger.warning(f"Invalid API key attempted: {api_key[:8]}...")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid API key",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.debug("API key verified successfully")
        return api_key
        
    except Exception as e:
        logger.error(f"Error verifying API key: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def verify_backend_api_key(api_key: str) -> bool:
    """
    Verify API key for backend service communication
    
    Args:
        api_key: API key to verify
    
    Returns:
        True if the API key is valid, False otherwise
    """
    try:
        # In production, this would verify against a database or external service
        # For now, we'll use a simple check against the configured key
        return api_key == settings.API_KEY
        
    except Exception as e:
        logger.error(f"Error verifying backend API key: {e}")
        return False

def get_api_key_from_request(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Extract API key from request credentials
    
    Args:
        credentials: HTTP Bearer credentials
    
    Returns:
        The API key string
    """
    return credentials.credentials

