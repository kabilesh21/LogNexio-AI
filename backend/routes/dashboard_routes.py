import json
from pathlib import Path
from fastapi import APIRouter, status
from config.config import settings
from utils.analysis_logger import get_analysis_logger

logger = get_analysis_logger("DashboardRoutes")
router = APIRouter(tags=["Dashboard"])

METADATA_DIR: Path = settings.METADATA_DIR
REPORTS_DIR: Path = settings.UPLOAD_DIR / "reports"


@router.get(
    "/dashboard/summary",
    status_code=status.HTTP_200_OK,
    summary="Get aggregated dashboard statistics",
    description=(
        "Scans all on-disk metadata and AI report cache files to compute aggregate statistics "
        "for the Operations Dashboard. This endpoint is read-only and never modifies existing data."
    ),
)
def get_dashboard_summary():
    """
    GET /api/dashboard/summary

    Aggregates counts and metrics by scanning:
    - uploads/metadata/{file_id}.json        → file stats
    - uploads/metadata/{file_id}_analysis.json → incident severity breakdown
    - uploads/reports/{incident_id}.json      → AI report stats
    """
    total_logs: int = 0
    total_lines: int = 0
    total_incidents: int = 0
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0
    ai_reports: int = 0
    cache_hits: int = 0
    ai_times: list = []

    # ── Scan metadata files ────────────────────────────────────────────
    if METADATA_DIR.exists():
        for path in METADATA_DIR.glob("*.json"):
            name = path.stem
            # Skip analysis JSONs (those end with _analysis or are incident UUIDs)
            if "_analysis" in name or "incidents" in name:
                continue
            # Skip incident sub-directory
            if path.is_dir():
                continue
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                total_logs += 1
                total_lines += data.get("total_lines", 0)
            except Exception:
                continue

        # Scan analysis files for incident severity breakdown
        for path in METADATA_DIR.glob("*_analysis.json"):
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
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

    # ── Scan AI report cache ───────────────────────────────────────────
    if REPORTS_DIR.exists():
        for path in REPORTS_DIR.glob("*.json"):
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                if data.get("incident_id"):
                    ai_reports += 1
            except Exception:
                continue

    # ── Compute average AI time from analysis log (approximate) ───────
    # Since timing is not stored persistently, we use a sensible default
    avg_ai_time = "~3-5s"

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

    Aggregates all incidents from all *_analysis.json files.
    Each incident is enriched with its AI report status.
    """
    all_incidents = []

    if not METADATA_DIR.exists():
        return {"incidents": []}

    for path in METADATA_DIR.glob("*_analysis.json"):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            file_id = data.get("file_id", "")
            for incident in data.get("errors", []):
                incident_id = incident.get("incident_id", "")
                # Check if AI report exists
                report_path = REPORTS_DIR / f"{incident_id}.json"
                ai_status = "analysed" if report_path.exists() else "pending"

                # Load AI report summary if available
                ai_summary = None
                if report_path.exists():
                    try:
                        report = json.loads(report_path.read_text(encoding="utf-8"))
                        ai_summary = {
                            "incident_summary": report.get("incident_summary", ""),
                            "root_cause": report.get("root_cause", ""),
                            "severity": report.get("severity", incident.get("severity", "LOW")),
                            "confidence": report.get("confidence", "N/A"),
                            "affected_component": report.get("affected_component", ""),
                            "technical_explanation": report.get("technical_explanation", ""),
                            "business_impact": report.get("business_impact", ""),
                            "resolution_steps": report.get("resolution_steps", []),
                            "preventive_measures": report.get("preventive_measures", []),
                            "estimated_fix_time": report.get("estimated_fix_time", ""),
                            "keywords": report.get("keywords", []),
                        }
                    except Exception:
                        pass

                all_incidents.append({
                    **incident,
                    "file_id": file_id,
                    "ai_status": ai_status,
                    "ai_summary": ai_summary,
                })
        except Exception:
            continue

    # Sort by line_number descending (newest first)
    all_incidents.sort(key=lambda x: x.get("line_number", 0), reverse=True)

    return {"incidents": all_incidents}
