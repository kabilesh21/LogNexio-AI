import json
from fastapi import APIRouter, status
from sqlalchemy import func
from config.db import SessionLocal, DBLogFile, DBAnalysisCache, DBIncident, DBAIReport
from utils.analysis_logger import get_analysis_logger

logger = get_analysis_logger("DashboardRoutes")
router = APIRouter(tags=["Dashboard"])


@router.get(
    "/dashboard/summary",
    status_code=status.HTTP_200_OK,
    summary="Get aggregated dashboard statistics",
    description=(
        "Queries database metadata and analysis cache to compute aggregate statistics "
        "for the Operations Dashboard."
    ),
)
def get_dashboard_summary():
    """
    GET /api/dashboard/summary

    Aggregates counts and metrics by querying database tables:
    - log_files      → file stats
    - analysis_cache → incident severity breakdown
    - ai_reports     → AI report stats
    """
    total_logs: int = 0
    total_lines: int = 0
    total_incidents: int = 0
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0
    ai_reports: int = 0
    avg_ai_time = "~3-5s"

    db = SessionLocal()
    try:
        # 1. Total logs and lines from log_files
        stats = db.query(func.count(DBLogFile.file_id), func.sum(DBLogFile.total_lines)).first()
        if stats:
            total_logs = stats[0] or 0
            total_lines = stats[1] or 0

        # 2. Total incidents and severity breakdown from DBAnalysisCache
        caches = db.query(DBAnalysisCache.analysis_data).all()
        for row in caches:
            try:
                data = json.loads(row[0])
                for incident in data.get("errors", []):
                    severity = incident.get("severity", "LOW").upper()
                    total_incidents += 1
                    if severity in ("CRITICAL", "FATAL"):
                        critical += 1
                    elif severity == "HIGH":
                        high += 1
                    elif severity == "MEDIUM":
                        medium += 1
                    else:
                        low += 1
            except Exception:
                continue

        # 3. AI Reports count
        ai_reports = db.query(func.count(DBAIReport.incident_id)).scalar() or 0

    except Exception as e:
        logger.error(f"Failed to query dashboard summary: {str(e)}")
    finally:
        db.close()

    logger.info(
        f"Dashboard summary computed: logs={total_logs}, incidents={total_incidents}, "
        f"ai_reports={ai_reports}"
    )

    return {
        "total_logs": total_logs,
        "total_lines": total_lines,
        "total_incidents": total_incidents,
        "critical": critical,
        "high": high,
        "medium": medium,
        "low": low,
        "ai_reports": ai_reports,
        "cache_hits": ai_reports,  # Every report in cache = a potential cache hit served
        "average_ai_time": avg_ai_time,
    }


@router.get(
    "/dashboard/incidents",
    status_code=status.HTTP_200_OK,
    summary="Get all detected incidents across all files",
    description="Returns every incident detected across all analysed log files for the dashboard table.",
)
def get_all_incidents():
    """
    GET /api/dashboard/incidents

    Aggregates all incidents from DBIncident table,
    enriched with their AI report status.
    """
    all_incidents = []

    db = SessionLocal()
    try:
        # Query all incidents
        db_incidents = db.query(DBIncident).all()
        
        # Query all AI reports so we can map them in-memory
        db_reports = db.query(DBAIReport).all()
        reports_map = {}
        for r in db_reports:
            try:
                reports_map[r.incident_id] = json.loads(r.report_data)
            except Exception:
                continue

        for inc in db_incidents:
            try:
                incident_id = inc.incident_id
                ai_summary = reports_map.get(incident_id)
                ai_status = "analysed" if ai_summary else "pending"

                incident_data = {
                    "incident_id": incident_id,
                    "file_id": inc.file_id,
                    "line_number": inc.line_number,
                    "error_type": inc.error_type,
                    "severity": inc.severity,
                    "context_before": json.loads(inc.context_before),
                    "error_block": json.loads(inc.error_block),
                    "context_after": json.loads(inc.context_after),
                    "analysis_ready": inc.analysis_ready,
                    "ai_status": ai_status,
                    "ai_summary": ai_summary,
                }
                all_incidents.append(incident_data)
            except Exception as e:
                logger.error(f"Error compiling incident {inc.incident_id} for dashboard: {e}")
                continue

    except Exception as e:
        logger.error(f"Failed to query incidents list: {str(e)}")
    finally:
        db.close()

    # Sort by line_number descending (newest first)
    all_incidents.sort(key=lambda x: x.get("line_number", 0), reverse=True)

    return {"incidents": all_incidents}
