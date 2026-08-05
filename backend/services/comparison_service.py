from typing import List, Dict
from models.ai_report import AIReport
from models.report_model import (
    ReportComparisonResponse,
    ComparisonFieldDiff,
)
from services.report_service import ReportService
from utils.analysis_logger import get_analysis_logger

logger = get_analysis_logger("ComparisonService")


class ComparisonService:
    """
    Handles side-by-side comparison of multiple AI reports.
    """

    @staticmethod
    def compare(incident_ids: List[str]) -> ReportComparisonResponse:
        """
        Loads specified reports and builds a field-by-field diff matrix.
        """
        reports_map: Dict[str, AIReport] = {}
        for i_id in incident_ids:
            try:
                reports_map[i_id] = ReportService.get_report(i_id)
            except Exception as exc:
                logger.warning(f"Could not load report {i_id} for comparison: {exc}")

        if len(reports_map) < 2:
            return ReportComparisonResponse(
                success=False,
                compared_incidents=list(reports_map.keys()),
                reports=reports_map,
                differences=[],
                summary_insight="At least 2 valid incident reports are required for comparison."
            )

        fields_to_compare = [
            ("severity", "Severity Level"),
            ("error_type", "Error Type"),
            ("affected_component", "Affected Component"),
            ("root_cause", "Root Cause"),
            ("confidence", "AI Confidence"),
            ("estimated_fix_time", "Estimated Fix Time"),
            ("business_impact", "Business Impact"),
        ]

        differences: List[ComparisonFieldDiff] = []
        differing_count = 0

        for field_key, display_name in fields_to_compare:
            val_map: Dict[str, str] = {}
            unique_vals = set()

            for i_id, r in reports_map.items():
                val = getattr(r, field_key, "N/A")
                if isinstance(val, list):
                    val = ", ".join(val)
                val_map[i_id] = str(val)
                unique_vals.add(str(val))

            is_diff = len(unique_vals) > 1
            if is_diff:
                differing_count += 1

            differences.append(
                ComparisonFieldDiff(
                    field_name=display_name,
                    values=val_map,
                    is_different=is_diff,
                )
            )

        insight = (
            f"Compared {len(reports_map)} incident reports. "
            f"Found {differing_count} differing operational attributes out of {len(fields_to_compare)} tracked dimensions."
        )

        return ReportComparisonResponse(
            success=True,
            compared_incidents=list(reports_map.keys()),
            reports=reports_map,
            differences=differences,
            summary_insight=insight,
        )
