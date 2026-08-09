import time
import os
from pathlib import Path
from fastapi import APIRouter, status
from config.config import settings
from config.gemini_config import GEMINI_API_KEY
from utils.logger import get_logger

logger = get_logger("SystemRoutes")

router = APIRouter(prefix="/system", tags=["System Diagnostics"])

START_TIME = time.time()


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Get system health and diagnostics status",
    description="Returns real-time status of backend services, storage subsystems, Gemini API, and uptime.",
)
def get_system_health():
    """
    GET /api/system/health
    """
    uptime_seconds = int(time.time() - START_TIME)
    hours = uptime_seconds // 3600
    minutes = (uptime_seconds % 3600) // 60
    seconds = uptime_seconds % 60
    uptime_str = f"{hours}h {minutes}m {seconds}s"

    # Check database health
    from config.db import SessionLocal
    from sqlalchemy import text
    database_healthy = False
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        database_healthy = True
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
    finally:
        db.close()

    # Check Gemini API Key configuration status
    gemini_healthy = bool(GEMINI_API_KEY and GEMINI_API_KEY != "PASTE_YOUR_GEMINI_API_KEY_HERE")

    return {
        "backend": "healthy",
        "gemini": "healthy" if gemini_healthy else "degraded",
        "database": "healthy" if database_healthy else "unhealthy",
        "uploads": "healthy" if database_healthy else "unhealthy",
        "reports": "healthy" if database_healthy else "unhealthy",
        "cache": "healthy" if database_healthy else "unhealthy",
        "version": "1.0.0",
        "uptime": uptime_str,
        "timestamp": time.time(),
    }


@router.get(
    "/version",
    status_code=status.HTTP_200_OK,
    summary="Get application version information",
    description="Returns static version metadata for LogNexio AI.",
)
def get_system_version():
    """
    GET /api/system/version
    """
    return {
        "application": "LogNexio AI",
        "version": "1.0.0",
        "build": "production",
        "phases": ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5", "Phase 6"],
    }

@router.get(
    "/db-debug",
    status_code=status.HTTP_200_OK,
    summary="Get database connection debug trace",
    description="Diagnostics helper that attempts a database connection and outputs the traceback on failure."
)
def get_db_debug():
    import traceback
    from config.db import SessionLocal
    from sqlalchemy import text
    
    result = {
        "status": "unknown",
        "message": "",
        "traceback": ""
    }
    
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        result["status"] = "success"
        result["message"] = "Database connection successful!"
    except Exception as e:
        result["status"] = "error"
        result["message"] = str(e)
        result["traceback"] = traceback.format_exc()
        
    return result

