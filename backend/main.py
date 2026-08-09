import sys
import os
# Ensure backend directory is in sys.path for Vercel import resolution
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException, RequestValidationError

from config.config import settings
from routes.upload_routes import router as upload_router
from routes.analysis_routes import router as analysis_router
from routes.ai_routes import router as ai_router
from routes.dashboard_routes import router as dashboard_router
from routes.report_routes import router as report_router
from routes.system_routes import router as system_router
from utils.logger import get_logger

logger = get_logger("Main")

# Bootstrapping the FastAPI Application
app = FastAPI(
    title="LogNexio AI - Backend Services",
    description="Production-ready AI-powered Log Analysis platform.",
    version="6.0.0"
)

@app.on_event("startup")
def on_startup():
    from config.db import init_db
    logger.info("Initializing database...")
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")

# CORS Middleware setup to allow communication with Frontend Vite Server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production environments if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(upload_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(report_router, prefix="/api")
app.include_router(system_router, prefix="/api")

# --- CUSTOM ERROR HANDLERS ---

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Handles standard HTTPExceptions and formats them as standard JSON.
    """
    logger.warning(f"HTTP Error on {request.url.path}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handles Pydantic input validation exceptions and formats them as standard JSON.
    """
    errors = exc.errors()
    # Build a clean readable validation message
    msg = "; ".join([f"{'.'.join(str(l) for l in err['loc'])}: {err['msg']}" for err in errors])
    logger.warning(f"Validation Error on {request.url.path}: {msg}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": f"Input validation failed: {msg}"
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """
    Handles all unhandled system exceptions to prevent raw stack traces from exposing to client.
    """
    logger.error(f"Unhandled Exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected server error occurred. Please try again later."
        }
    )

# Root Endpoint
@app.get("/", tags=["General"])
async def root():
    return {
        "app": "LogNexio AI",
        "module": "1.0 - Foundation & Log Upload Pipeline",
        "status": "online"
    }

if __name__ == "__main__":
    logger.info(f"Starting server on {settings.HOST}:{settings.PORT}")
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
