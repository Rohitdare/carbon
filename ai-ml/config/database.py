"""
Database configuration and connection management
"""

import asyncio
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from config.settings import settings

logger = logging.getLogger(__name__)

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=300
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_database():
    """Initialize database connection and verify connectivity"""
    try:
        async with engine.begin() as conn:
            # Test connection
            result = await conn.execute(text("SELECT 1"))
            logger.info("Database connection established successfully")
            
            # Enable PostGIS extension if not already enabled
            try:
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
                logger.info("PostGIS extension enabled")
            except Exception as e:
                logger.warning(f"Could not enable PostGIS extension: {e}")
                
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

async def close_database():
    """Close database connections"""
    await engine.dispose()
    logger.info("Database connections closed")

