import json
from typing import Optional, Dict, Any
from config.db import SessionLocal, DBAIReport
from utils.analysis_logger import get_analysis_logger

logger = get_analysis_logger("CacheService")


class CacheService:
    """
    Handles database-based caching of AI-generated incident reports.

    Reports are keyed by incident_id and stored in the database.
    This prevents duplicate Gemini API calls for the same incident,
    honouring the principle of idempotency.
    """

    @staticmethod
    def get_report(incident_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a cached AI report for the given incident_id from the database.

        Args:
            incident_id: UUID of the incident.

        Returns:
            Parsed report dict if found, otherwise None.
        """
        db = SessionLocal()
        db_report = None
        try:
            db_report = db.query(DBAIReport).filter(DBAIReport.incident_id == incident_id).first()
        except Exception as exc:
            logger.error(f"Failed to query database for incident_id {incident_id}: {exc}")
        finally:
            db.close()

        if not db_report:
            return None

        try:
            data = json.loads(db_report.report_data)
            logger.info(f"Cache HIT — Loaded cached report for incident_id: {incident_id}")
            return data
        except Exception as exc:
            logger.error(f"Cache read failure for incident_id {incident_id}: {exc}")
            return None

    @staticmethod
    def save_report(incident_id: str, report: Dict[str, Any]) -> None:
        """
        Persists an AI report to the database for future cache hits.

        Args:
            incident_id: UUID of the incident.
            report: Serialised report dictionary to save.
        """
        db = SessionLocal()
        try:
            db_report = DBAIReport(
                incident_id=incident_id,
                report_data=json.dumps(report)
            )
            db.merge(db_report)
            db.commit()
            logger.info(f"Cache WRITE — Saved AI report for incident_id: {incident_id}")
        except Exception as exc:
            db.rollback()
            logger.error(f"Cache write failure for incident_id {incident_id}: {exc}")
        finally:
            db.close()

    @staticmethod
    def report_exists(incident_id: str) -> bool:
        """
        Returns True if a cached report exists in the database for the given incident_id.
        """
        db = SessionLocal()
        try:
            count = db.query(DBAIReport).filter(DBAIReport.incident_id == incident_id).count()
            return count > 0
        except Exception as exc:
            logger.error(f"Failed to check report status for incident_id {incident_id}: {exc}")
            return False
        finally:
            db.close()

