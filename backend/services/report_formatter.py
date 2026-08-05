from typing import Any, Dict, List
from models.ai_report import AIReport
from utils.analysis_logger import get_analysis_logger

logger = get_analysis_logger("ReportFormatter")


class ReportFormatter:
    """
    Converts a raw normalised dict from ResponseParser into a validated AIReport model.

    Responsibilities:
    - Coerce types where necessary (e.g. ensure lists contain strings).
    - Validate the structure with Pydantic.
    - Guarantee the returned model matches the exact contract expected by Modules 4 and 5.
    """

    @staticmethod
    def format(raw_dict: Dict[str, Any], incident_id: str) -> AIReport:
        """
        Formats and validates the parsed AI report dict into an AIReport Pydantic model.

        Args:
            raw_dict:    Normalised dict produced by ResponseParser.parse().
            incident_id: UUID used to override any model echo inconsistency.

        Returns:
            Validated AIReport instance.
        """
        # Always enforce the correct incident_id regardless of what the model echoed
        raw_dict["incident_id"] = incident_id

        # Coerce list fields: ensure all items are strings (model may return int/None)
        for list_field in ["resolution_steps", "preventive_measures", "keywords"]:
            raw_list = raw_dict.get(list_field, [])
            if isinstance(raw_list, list):
                raw_dict[list_field] = [str(item) for item in raw_list if item is not None]
            else:
                raw_dict[list_field] = []

        # Coerce severity to uppercase for consistency
        if isinstance(raw_dict.get("severity"), str):
            raw_dict["severity"] = raw_dict["severity"].upper()

        # Ensure severity is one of the accepted values
        valid_severities = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}
        if raw_dict.get("severity") not in valid_severities:
            logger.warning(
                f"Invalid severity '{raw_dict.get('severity')}' "
                f"for incident_id {incident_id}. Defaulting to HIGH."
            )
            raw_dict["severity"] = "HIGH"

        try:
            report = AIReport(**raw_dict)
            logger.info(f"Report formatted and validated successfully for incident_id: {incident_id}")
            return report
        except Exception as exc:
            logger.error(
                f"Pydantic validation failed for incident_id {incident_id}: {exc}. "
                "Attempting safe construction with fallback values."
            )
            # Safe construction — pick only the fields Pydantic will accept
            return AIReport(
                incident_id=incident_id,
                incident_summary=str(raw_dict.get("incident_summary", "Analysis could not be validated.")),
                error_type=str(raw_dict.get("error_type", "UnknownError")),
                severity="HIGH",
                root_cause=str(raw_dict.get("root_cause", "Could not determine root cause.")),
                technical_explanation=str(raw_dict.get("technical_explanation", "Not available.")),
                affected_component=str(raw_dict.get("affected_component", "Unknown")),
                business_impact=str(raw_dict.get("business_impact", "Impact not assessed.")),
                resolution_steps=["Review incident logs manually.", "Engage on-call engineer."],
                preventive_measures=["Implement monitoring.", "Add alerting thresholds."],
                confidence="N/A",
                estimated_fix_time="Unknown",
                keywords=[],
            )
