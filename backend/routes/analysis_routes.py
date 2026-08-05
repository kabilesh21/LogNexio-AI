from fastapi import APIRouter, status
from services.analysis_service import AnalysisService
from models.analysis import AnalysisResponse, IncidentResponse
from utils.analysis_logger import get_analysis_logger

logger = get_analysis_logger("AnalysisRoutes")

router = APIRouter(tags=["Analysis"])

@router.get(
    "/analyze/{file_id}",
    response_model=AnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze log file errors",
    description="Streams log file, groups multiline stack traces, extracts 10-line surrounding contexts, classifies severities, and caches parsing output."
)
async def analyze_log_file(file_id: str):
    logger.info(f"Received API request: GET /api/analyze/{file_id}")
    start_time = logger.manager.loggerDict.get("root") # Mock reference or just calculate locally
    
    t0 = time_now() if 'time_now' in globals() else 0 # simple tracking or standard time logs
    import time
    t0 = time.time()
    
    response = AnalysisService.analyze_file(file_id)
    
    duration = time.time() - t0
    logger.info(f"Response: GET /api/analyze/{file_id} - Completed in {duration:.4f}s with {response.total_errors} incidents.")
    return response

@router.get(
    "/error/{incident_id}",
    response_model=IncidentResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve single incident",
    description="Returns structured context_before, error_block, and context_after for a specific incident in O(1)."
)
async def get_incident_details(incident_id: str):
    logger.info(f"Received API request: GET /api/error/{incident_id}")
    import time
    t0 = time.time()
    
    response = AnalysisService.get_incident(incident_id)
    
    duration = time.time() - t0
    logger.info(f"Response: GET /api/error/{incident_id} - Completed in {duration:.4f}s.")
    return response
