import json
import re
from typing import Any, Dict, Optional
from utils.analysis_logger import get_analysis_logger

logger = get_analysis_logger("ResponseParser")

# Required keys every valid AI report must contain
REQUIRED_KEYS = {
    "incident_id",
    "incident_summary",
    "error_type",
    "severity",
    "root_cause",
    "technical_explanation",
    "affected_component",
    "business_impact",
    "resolution_steps",
    "preventive_measures",
    "confidence",
    "estimated_fix_time",
    "keywords",
}


class ResponseParser:
    """
    Robustly extracts and validates a JSON report from a raw Gemini response.

    Gemini may wrap the JSON in Markdown code fences, add trailing commentary,
    or return subtly malformed JSON. This parser handles all those cases without
    ever crashing — it always returns a dict (possibly with fallback values).
    """

    @classmethod
    def parse(cls, raw_response: str, incident_id: str) -> Dict[str, Any]:
        """
        Parses the raw Gemini response string into a validated report dict.

        Strategy:
        1. Strip Markdown code fences if present.
        2. Attempt a direct JSON parse.
        3. If that fails, use regex to extract the outermost JSON object.
        4. Fill any missing optional fields with sensible defaults.

        Args:
            raw_response: Raw text returned by GeminiService.generate().
            incident_id:  Incident UUID used for fallback population.

        Returns:
            A normalised report dict with all required keys present.
        """
        cleaned = cls._strip_markdown(raw_response)

        parsed: Optional[Dict[str, Any]] = None

        # Attempt 1: direct JSON parse on the cleaned string
        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError:
            logger.warning(
                f"Direct JSON parse failed for incident_id {incident_id}. "
                "Attempting regex extraction."
            )

        # Attempt 2: regex extraction of the outermost JSON object
        if parsed is None:
            parsed = cls._extract_json_with_regex(cleaned, incident_id)

        # Attempt 3: hard fallback — return a structured error report
        if parsed is None:
            logger.error(
                f"All JSON extraction strategies failed for incident_id {incident_id}. "
                "Returning fallback report."
            )
            parsed = cls._fallback_report(incident_id)

        # Normalise: fill missing keys with safe defaults
        normalised = cls._normalise(parsed, incident_id)
        return normalised

    @staticmethod
    def _strip_markdown(text: str) -> str:
        """Removes ```json ... ``` and ``` ... ``` fences from the response text."""
        # Remove opening fence variants: ```json, ```JSON, ``` with optional whitespace
        text = re.sub(r"^```[a-zA-Z]*\s*", "", text.strip(), flags=re.MULTILINE)
        # Remove closing fences
        text = re.sub(r"```\s*$", "", text.strip(), flags=re.MULTILINE)
        return text.strip()

    @staticmethod
    def _extract_json_with_regex(text: str, incident_id: str) -> Optional[Dict[str, Any]]:
        """
        Attempts to locate and parse the first complete JSON object in the string.
        Handles cases where the model prepends or appends explanation text.
        """
        # Find the outermost balanced braces
        start = text.find("{")
        if start == -1:
            return None

        depth = 0
        end = -1
        for i, char in enumerate(text[start:], start=start):
            if char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break

        if end == -1:
            return None

        candidate = text[start:end]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError as exc:
            logger.warning(
                f"Regex-extracted JSON failed to parse for incident_id {incident_id}: {exc}"
            )
            return None

    @staticmethod
    def _fallback_report(incident_id: str) -> Dict[str, Any]:
        """Returns a structured placeholder report when all parsing attempts fail."""
        return {
            "incident_id": incident_id,
            "incident_summary": "AI analysis could not be parsed. Manual review required.",
            "error_type": "ParseError",
            "severity": "HIGH",
            "root_cause": "AI response was not parseable as valid JSON.",
            "technical_explanation": (
                "The AI model returned a response that could not be parsed into the "
                "expected report schema. This may indicate a model output formatting "
                "issue. The raw log context has been preserved in the incident record."
            ),
            "affected_component": "AI Analysis Pipeline",
            "business_impact": "Automated analysis unavailable. Manual SRE review required.",
            "resolution_steps": [
                "Review the raw incident context via GET /api/error/{incident_id}.",
                "Manually analyse the error_block and surrounding context lines.",
                "Re-trigger AI analysis via POST /api/ai/analyze/{incident_id} after verifying API key.",
            ],
            "preventive_measures": [
                "Monitor Gemini API response format consistency.",
                "Add structured output enforcement (response_mime_type=application/json).",
                "Implement a response schema validator before caching.",
            ],
            "confidence": "0%",
            "estimated_fix_time": "Manual review required",
            "keywords": ["ParseError", "AI", "Analysis", "Fallback"],
        }

    @classmethod
    def _normalise(cls, data: Dict[str, Any], incident_id: str) -> Dict[str, Any]:
        """
        Ensures all required fields are present and have correct types.
        Fills missing fields with safe defaults rather than crashing.
        """
        # Ensure incident_id is always correct
        data["incident_id"] = incident_id

        # String fields with defaults
        str_defaults: Dict[str, str] = {
            "incident_summary": "No summary provided.",
            "error_type": "UnknownError",
            "severity": "HIGH",
            "root_cause": "Root cause could not be determined.",
            "technical_explanation": "Technical explanation not available.",
            "affected_component": "Unknown",
            "business_impact": "Business impact not assessed.",
            "confidence": "N/A",
            "estimated_fix_time": "Unknown",
        }
        for field, default in str_defaults.items():
            if not data.get(field) or not isinstance(data[field], str):
                logger.warning(
                    f"Missing or invalid field '{field}' for incident_id {incident_id}. "
                    f"Using default: '{default}'"
                )
                data[field] = default

        # List fields with defaults
        list_defaults: Dict[str, list] = {
            "resolution_steps": ["Review logs.", "Engage on-call engineer.", "Escalate if unresolved."],
            "preventive_measures": ["Add monitoring.", "Implement alerting.", "Write post-mortem."],
            "keywords": [],
        }
        for field, default in list_defaults.items():
            if not data.get(field) or not isinstance(data[field], list):
                logger.warning(
                    f"Missing or invalid list field '{field}' for incident_id {incident_id}. "
                    "Using default list."
                )
                data[field] = default

        # Remove any extra keys not in the contract (keeps the response clean for Modules 4 & 5)
        return {key: data[key] for key in REQUIRED_KEYS if key in data}
