import time
from typing import Dict, Any

from fastapi import HTTPException, status

from services.analysis_service import AnalysisService
from services.prompt_builder import PromptBuilder
from services.gemini_service import GeminiService
from services.response_parser import ResponseParser
from services.report_formatter import ReportFormatter
from services.cache_service import CacheService
from models.ai_report import AIReport
from utils.analysis_logger import get_analysis_logger

logger = get_analysis_logger("AIOrchestrator")


class AIOrchestrator:
    """
    Coordinates the end-to-end AI incident analysis pipeline for a single incident.

    Pipeline:
        1. Check disk cache  → return immediately on HIT
        2. Load incident data from Module 2 metadata store
        3. Validate incident fields
        4. Build the expert-persona prompt
        5. Call Gemini API with retry logic
        6. Parse and normalise raw Gemini response
        7. Format into a typed AIReport model
        8. Persist report to disk cache
        9. Return the report

    The frontend NEVER communicates with Gemini directly — all AI interactions
    are mediated through this orchestrator.
    """

    @classmethod
    def run(cls, incident_id: str) -> AIReport:
        """
        Executes the full AI analysis pipeline for the given incident.

        Args:
            incident_id: UUID of the incident to analyse.

        Returns:
            Validated AIReport instance.

        Raises:
            HTTPException: On incident-not-found, validation failure, or AI errors.
        """
        ai_start = time.time()
        cache_hit = False
        retry_count = 0

        logger.info(f"AI Orchestrator START — incident_id: {incident_id}")

        # ── Step 1: Cache Check ────────────────────────────────────────────
        cached_data: Dict[str, Any] | None = CacheService.get_report(incident_id)
        if cached_data is not None:
            cache_hit = True
            ai_end = time.time()
            logger.info(
                f"AI Orchestrator DONE (cache hit) — incident_id: {incident_id} | "
                f"elapsed: {ai_end - ai_start:.4f}s"
            )
            try:
                return AIReport(**cached_data)
            except Exception as exc:
                logger.warning(
                    f"Cached report for {incident_id} failed Pydantic validation: {exc}. "
                    "Re-running analysis."
                )

        # ── Step 2: Load Incident from Module 2 Metadata ──────────────────
        logger.info(f"Loading incident metadata for incident_id: {incident_id}")
        incident = AnalysisService.get_incident(incident_id)
        # AnalysisService.get_incident raises HTTPException 404 if not found,
        # so we don't need an additional existence check here.

        # ── Step 3: Validate Incident Context ────────────────────────────
        if not incident.error_block:
            logger.error(f"Incident {incident_id} has an empty error_block — cannot analyse.")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Incident error_block is empty. Cannot perform AI analysis on empty context.",
            )

        # ── Step 4: Build Prompt ──────────────────────────────────────────
        logger.info(f"Building analysis prompt for incident_id: {incident_id}")
        prompt = PromptBuilder.build(
            incident_id=incident_id,
            context_before=incident.context_before,
            error_block=incident.error_block,
            context_after=incident.context_after,
        )

        # ── Step 5: Call Gemini ────────────────────────────────────────────
        logger.info(f"Calling Gemini for incident_id: {incident_id}")
        raw_response: str = GeminiService.generate(prompt=prompt, incident_id=incident_id)

        # ── Step 6: Parse Response ─────────────────────────────────────────
        logger.info(f"Parsing Gemini response for incident_id: {incident_id}")
        parsed_dict = ResponseParser.parse(raw_response=raw_response, incident_id=incident_id)

        # ── Step 7: Format & Validate ─────────────────────────────────────
        logger.info(f"Formatting report for incident_id: {incident_id}")
        report: AIReport = ReportFormatter.format(raw_dict=parsed_dict, incident_id=incident_id)

        # ── Step 8: Cache Report ───────────────────────────────────────────
        CacheService.save_report(incident_id=incident_id, report=report.dict())

        # ── Step 9: Log Telemetry ─────────────────────────────────────────
        ai_end = time.time()
        logger.info(
            f"AI Orchestrator DONE — incident_id: {incident_id} | "
            f"cache_hit: {cache_hit} | "
            f"retry_count: {retry_count} | "
            f"elapsed: {ai_end - ai_start:.4f}s | "
            f"severity: {report.severity} | "
            f"confidence: {report.confidence}"
        )

        return report
