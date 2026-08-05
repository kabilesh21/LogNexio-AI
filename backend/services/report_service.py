import json
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import HTTPException, status

from config.config import settings
from models.ai_report import AIReport
from models.report_model import ReportSummaryItem
from utils.analysis_logger import get_analysis_logger

logger = get_analysis_logger("ReportService")

REPORTS_DIR: Path = settings.UPLOAD_DIR / "reports"


class ReportService:
    """
    Manages saved AI reports on disk under backend/uploads/reports/.
    Reads existing JSON reports without re-calling Gemini.
    """

    @staticmethod
    def get_all_reports() -> List[ReportSummaryItem]:
        """
        Retrieves summaries of all saved AI reports ordered newest to oldest.
        """
        if not REPORTS_DIR.exists():
            return []

        summaries = []
        for file_path in REPORTS_DIR.glob("*.json"):
            try:
                data = json.loads(file_path.read_text(encoding="utf-8"))
                incident_id = data.get("incident_id", file_path.stem)
                
                # File modification date as ISO string
                mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
                created_at = mtime.isoformat()

                summary = ReportSummaryItem(
                    incident_id=incident_id,
                    error_type=data.get("error_type", "UnknownError"),
                    severity=str(data.get("severity", "LOW")).upper(),
                    incident_summary=data.get("incident_summary", "No summary available."),
                    affected_component=data.get("affected_component", "Unknown"),
                    confidence=data.get("confidence", "95%"),
                    created_at=created_at,
                    estimated_fix_time=data.get("estimated_fix_time", "15-30 minutes"),
                    keywords=data.get("keywords", []),
                )
                summaries.append((mtime, summary))
            except Exception as exc:
                logger.warning(f"Failed to parse report file {file_path}: {exc}")
                continue

        # Sort by creation timestamp descending
        summaries.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in summaries]

    @staticmethod
    def get_report(incident_id: str) -> AIReport:
        """
        Retrieves a single AI report by incident_id.
        Raises 404 if not found.
        """
        report_path = REPORTS_DIR / f"{incident_id}.json"
        if not report_path.exists():
            logger.warning(f"Report not found for incident_id: {incident_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"AI report not found for incident ID '{incident_id}'."
            )

        try:
            data = json.loads(report_path.read_text(encoding="utf-8"))
            return AIReport(**data)
        except Exception as exc:
            logger.error(f"Error reading report {incident_id}: {exc}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Corrupted report file for incident ID '{incident_id}'."
            )

    @staticmethod
    def delete_report(incident_id: str) -> bool:
        """
        Deletes an AI report file from disk.
        """
        report_path = REPORTS_DIR / f"{incident_id}.json"
        if not report_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Report file not found for incident ID '{incident_id}'."
            )
        try:
            report_path.unlink()
            logger.info(f"Deleted report file: {incident_id}.json")
            return True
        except Exception as exc:
            logger.error(f"Failed to delete report {incident_id}: {exc}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete report '{incident_id}'."
            )

    @staticmethod
    def search_reports(
        query: Optional[str] = None,
        severity: Optional[str] = None,
        error_type: Optional[str] = None,
        keyword: Optional[str] = None,
        date_str: Optional[str] = None,
    ) -> List[ReportSummaryItem]:
        """
        Filters saved reports on disk by various search parameters.
        """
        all_reports = ReportService.get_all_reports()
        filtered = []

        for r in all_reports:
            # Query match (incident_id, error_type, summary, or component)
            if query:
                q = query.lower()
                match = (
                    q in r.incident_id.lower()
                    or q in r.error_type.lower()
                    or q in r.incident_summary.lower()
                    or q in r.affected_component.lower()
                )
                if not match:
                    continue

            # Severity filter
            if severity and severity.upper() != "ALL":
                if r.severity.upper() != severity.upper():
                    continue

            # Error type filter
            if error_type and error_type.lower() != "all":
                if error_type.lower() not in r.error_type.lower():
                    continue

            # Keyword filter
            if keyword:
                kw_match = any(keyword.lower() in kw.lower() for kw in r.keywords)
                if not kw_match:
                    continue

            # Date filter (YYYY-MM-DD prefix check)
            if date_str:
                if not r.created_at.startswith(date_str):
                    continue

            filtered.append(r)

        return filtered
