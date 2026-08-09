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

class ReportService:
    """
    Manages saved AI reports in TiDB database.
    Reads existing JSON reports without re-calling Gemini.
    """

    @staticmethod
    def get_all_reports() -> List[ReportSummaryItem]:
        """
        Retrieves summaries of all saved AI reports ordered newest to oldest from TiDB database.
        """
        from config.db import SessionLocal, DBAIReport
        db = SessionLocal()
        try:
            db_reports = db.query(DBAIReport).order_by(DBAIReport.created_at.desc()).all()
        except Exception as exc:
            logger.error(f"Failed to query reports from database: {exc}")
            return []
        finally:
            db.close()

        summaries = []
        for db_rep in db_reports:
            try:
                data = json.loads(db_rep.report_data)
                incident_id = data.get("incident_id", db_rep.incident_id)
                created_at = db_rep.created_at.isoformat()

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
                summaries.append(summary)
            except Exception as exc:
                logger.warning(f"Failed to parse report for incident {db_rep.incident_id}: {exc}")
                continue
        return summaries

    @staticmethod
    def get_report(incident_id: str) -> AIReport:
        """
        Retrieves a single AI report by incident_id from the database.
        Raises 404 if not found.
        """
        from config.db import SessionLocal, DBAIReport
        db = SessionLocal()
        db_rep = None
        try:
            db_rep = db.query(DBAIReport).filter(DBAIReport.incident_id == incident_id).first()
        except Exception as exc:
            logger.error(f"Database error querying report {incident_id}: {exc}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error reading report details."
            )
        finally:
            db.close()

        if not db_rep:
            logger.warning(f"Report not found for incident_id: {incident_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"AI report not found for incident ID '{incident_id}'."
            )

        try:
            data = json.loads(db_rep.report_data)
            return AIReport(**data)
        except Exception as exc:
            logger.error(f"Error reading report {incident_id} from JSON: {exc}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Corrupted report data for incident ID '{incident_id}'."
            )

    @staticmethod
    def delete_report(incident_id: str) -> bool:
        """
        Deletes an AI report from the database.
        """
        from config.db import SessionLocal, DBAIReport
        db = SessionLocal()
        try:
            db_rep = db.query(DBAIReport).filter(DBAIReport.incident_id == incident_id).first()
            if not db_rep:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Report file not found for incident ID '{incident_id}'."
                )
            db.delete(db_rep)
            db.commit()
            logger.info(f"Deleted report from database: {incident_id}")
            return True
        except HTTPException:
            raise
        except Exception as exc:
            db.rollback()
            logger.error(f"Failed to delete report {incident_id} from database: {exc}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete report '{incident_id}'."
            )
        finally:
            db.close()

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
