import json
from pathlib import Path
from typing import Optional, Dict, Any
from config.config import settings
from utils.analysis_logger import get_analysis_logger

logger = get_analysis_logger("CacheService")

# Reports are stored under: backend/uploads/reports/{incident_id}.json
REPORTS_DIR: Path = settings.UPLOAD_DIR / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


class CacheService:
    """
    Handles disk-based caching of AI-generated incident reports.

    Reports are keyed by incident_id and stored as individual JSON files in
    the reports directory. This prevents duplicate Gemini API calls for the
    same incident, honouring the principle of idempotency.
    """

    @staticmethod
    def get_report(incident_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a cached AI report for the given incident_id.

        Args:
            incident_id: UUID of the incident.

        Returns:
            Parsed report dict if found, otherwise None.
        """
        report_path = REPORTS_DIR / f"{incident_id}.json"
        if not report_path.exists():
            return None
        try:
            with open(report_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            logger.info(f"Cache HIT — Loaded cached report for incident_id: {incident_id}")
            return data
        except Exception as exc:
            logger.error(f"Cache read failure for incident_id {incident_id}: {exc}")
            return None

    @staticmethod
    def save_report(incident_id: str, report: Dict[str, Any]) -> None:
        """
        Persists an AI report to disk for future cache hits.

        Args:
            incident_id: UUID of the incident.
            report: Serialised report dictionary to save.
        """
        report_path = REPORTS_DIR / f"{incident_id}.json"
        try:
            with open(report_path, "w", encoding="utf-8") as f:
                json.dump(report, f, indent=4, ensure_ascii=False)
            logger.info(f"Cache WRITE — Saved AI report for incident_id: {incident_id}")
        except Exception as exc:
            logger.error(f"Cache write failure for incident_id {incident_id}: {exc}")

    @staticmethod
    def report_exists(incident_id: str) -> bool:
        """
        Returns True if a cached report file exists for the given incident_id.
        """
        return (REPORTS_DIR / f"{incident_id}.json").exists()
