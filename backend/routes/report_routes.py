from typing import Optional, List
from fastapi import APIRouter, status, Query, Response
from fastapi.responses import Response, JSONResponse

from services.report_service import ReportService
from services.history_service import HistoryService
from services.comparison_service import ComparisonService
from services.export_service import ExportService
from models.ai_report import AIReport
from models.report_model import (
    ReportListResponse,
    ReportHistoryResponse,
    ReportComparisonRequest,
    ReportComparisonResponse,
)
from utils.analysis_logger import get_analysis_logger

logger = get_analysis_logger("ReportRoutes")

router = APIRouter(prefix="/reports", tags=["Report Center"])


@router.get(
    "",
    response_model=ReportListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all saved AI incident reports",
    description="Returns a list of all AI reports saved on disk under uploads/reports/.",
)
async def list_all_reports():
    logger.info("API REQUEST: GET /api/reports")
    reports = ReportService.get_all_reports()
    return ReportListResponse(success=True, total=len(reports), reports=reports)


@router.get(
    "/history",
    response_model=ReportHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get report timeline history",
    description="Returns chronological history of saved AI reports.",
)
async def get_report_history():
    logger.info("API REQUEST: GET /api/reports/history")
    return HistoryService.get_history()


@router.post(
    "/compare",
    response_model=ReportComparisonResponse,
    status_code=status.HTTP_200_OK,
    summary="Compare multiple AI reports side-by-side",
    description="Accepts a list of incident_ids and returns field-by-field differences.",
)
async def compare_reports(payload: ReportComparisonRequest):
    logger.info(f"API REQUEST: POST /api/reports/compare for IDs: {payload.incident_ids}")
    return ComparisonService.compare(payload.incident_ids)


@router.get(
    "/search",
    response_model=ReportListResponse,
    summary="Search and filter AI reports",
    description="Filters reports by query, severity, error_type, keyword, or date.",
)
async def search_reports(
    query: Optional[str] = Query(None, description="General search term"),
    severity: Optional[str] = Query(None, description="Severity filter"),
    error_type: Optional[str] = Query(None, description="Error type filter"),
    keyword: Optional[str] = Query(None, description="Keyword filter"),
    date: Optional[str] = Query(None, description="ISO Date YYYY-MM-DD"),
):
    logger.info(f"API REQUEST: GET /api/reports/search query={query}, severity={severity}")
    results = ReportService.search_reports(
        query=query,
        severity=severity,
        error_type=error_type,
        keyword=keyword,
        date_str=date,
    )
    return ReportListResponse(success=True, total=len(results), reports=results)


@router.get(
    "/{incident_id}",
    response_model=AIReport,
    status_code=status.HTTP_200_OK,
    summary="Get single AI report details",
    description="Returns full AI report object for a given incident_id.",
)
async def get_single_report(incident_id: str):
    logger.info(f"API REQUEST: GET /api/reports/{incident_id}")
    return ReportService.get_report(incident_id)


@router.delete(
    "/{incident_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete single AI report",
    description="Deletes report file from disk.",
)
async def delete_report(incident_id: str):
    logger.info(f"API REQUEST: DELETE /api/reports/{incident_id}")
    ReportService.delete_report(incident_id)
    return {"success": True, "message": f"Report '{incident_id}' deleted successfully."}


# ── EXPORT ENDPOINTS ───────────────────────────────────────────────────

@router.get(
    "/export/pdf/{incident_id}",
    summary="Export report as PDF",
    description="Generates a downloadable PDF document for the incident report.",
)
async def export_pdf(incident_id: str):
    logger.info(f"API REQUEST: GET /api/reports/export/pdf/{incident_id}")
    report = ReportService.get_report(incident_id)
    pdf_bytes = ExportService.export_pdf(report)
    filename = f"LogNexio_Incident_{incident_id[:8]}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get(
    "/export/docx/{incident_id}",
    summary="Export report as Word (.docx)",
    description="Generates a downloadable Microsoft Word document for the incident report.",
)
async def export_docx(incident_id: str):
    logger.info(f"API REQUEST: GET /api/reports/export/docx/{incident_id}")
    report = ReportService.get_report(incident_id)
    docx_bytes = ExportService.export_docx(report)
    filename = f"LogNexio_Incident_{incident_id[:8]}.docx"
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get(
    "/export/json/{incident_id}",
    summary="Export report as JSON",
    description="Returns raw report JSON file for download.",
)
async def export_json(incident_id: str):
    logger.info(f"API REQUEST: GET /api/reports/export/json/{incident_id}")
    report = ReportService.get_report(incident_id)
    json_str = ExportService.export_json(report)
    filename = f"LogNexio_Incident_{incident_id[:8]}.json"
    return Response(
        content=json_str,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get(
    "/export/markdown/{incident_id}",
    summary="Export report as Markdown (.md)",
    description="Generates a downloadable GitHub-formatted Markdown document.",
)
async def export_markdown(incident_id: str):
    logger.info(f"API REQUEST: GET /api/reports/export/markdown/{incident_id}")
    report = ReportService.get_report(incident_id)
    md_str = ExportService.export_markdown(report)
    filename = f"LogNexio_Incident_{incident_id[:8]}.md"
    return Response(
        content=md_str,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
