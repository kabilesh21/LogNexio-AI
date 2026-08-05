import time
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from services.ai_orchestrator import AIOrchestrator
from services.cache_service import CacheService
from models.ai_report import AIReport, AIReportResponse
from utils.analysis_logger import get_analysis_logger

logger = get_analysis_logger("AIRoutes")

router = APIRouter(prefix="/ai", tags=["AI Analysis"])


@router.post(
    "/analyze/{incident_id}",
    response_model=AIReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Run AI analysis on a single incident",
    description=(
        "Loads the structured incident context (context_before, error_block, context_after) "
        "from Module 2 metadata, submits it to Gemini, and returns a professional SRE incident "
        "report. Returns a cached report immediately if one already exists for this incident."
    ),
)
async def analyze_incident_with_ai(incident_id: str):
    """
    POST /api/ai/analyze/{incident_id}

    Workflow:
        1. Return cached report if available (O(1) disk lookup).
        2. Otherwise: load incident → build prompt → call Gemini →
           parse → format → cache → return.
    """
    t0 = time.time()
    logger.info(f"API REQUEST: POST /api/ai/analyze/{incident_id}")

    report: AIReport = AIOrchestrator.run(incident_id=incident_id)

    elapsed = time.time() - t0
    logger.info(
        f"API RESPONSE: POST /api/ai/analyze/{incident_id} "
        f"— elapsed: {elapsed:.4f}s | severity: {report.severity}"
    )

    return AIReportResponse(success=True, report=report)
