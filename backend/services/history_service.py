from typing import List
from models.report_model import ReportHistoryItem, ReportHistoryResponse
from services.report_service import ReportService
from datetime import datetime
from utils.analysis_logger import get_analysis_logger

logger = get_analysis_logger("HistoryService")


class HistoryService:
    """
    Provides timeline history of generated AI reports.
    """

    @staticmethod
    def get_history() -> ReportHistoryResponse:
        """
        Gathers chronological history timeline of all saved AI reports.
        """
        reports = ReportService.get_all_reports()
        items: List[ReportHistoryItem] = []

        for r in reports:
            try:
                dt = datetime.fromisoformat(r.created_at)
                formatted = dt.strftime("%b %d, %Y %H:%M:%S")
            except Exception:
                formatted = r.created_at

            items.append(
                ReportHistoryItem(
                    incident_id=r.incident_id,
                    error_type=r.error_type,
                    severity=r.severity,
                    incident_summary=r.incident_summary,
                    affected_component=r.affected_component,
                    timestamp=r.created_at,
                    formatted_date=formatted,
                )
            )

        return ReportHistoryResponse(
            success=True,
            total=len(items),
            history=items,
        )
