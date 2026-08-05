import time
from typing import Optional

from google import genai
from google.genai import types
from fastapi import HTTPException, status

from config.gemini_config import (
    GEMINI_API_KEY,
    GEMINI_MODEL,
    GEMINI_TIMEOUT_SECONDS,
    GEMINI_MAX_RETRIES,
    GEMINI_RETRY_STATUS_CODES,
    GEMINI_TEMPERATURE,
    GEMINI_MAX_OUTPUT_TOKENS,
)
from utils.analysis_logger import get_analysis_logger

logger = get_analysis_logger("GeminiService")

# Initialise the Gemini client once at module load time using the key from
# gemini_config — the key is never referenced from anywhere else in the codebase.
_client = genai.Client(api_key=GEMINI_API_KEY)


class GeminiService:
    """
    Thin wrapper around the Google Gen AI SDK (google-genai >= 1.0).

    Responsibilities:
    - Send a single prompt string to the configured Gemini model.
    - Enforce a request timeout via httpx connection limits.
    - Retry up to GEMINI_MAX_RETRIES times on transient errors (429, 5xx).
    - Return only the raw text response — parsing is handled downstream.
    """

    @classmethod
    def generate(cls, prompt: str, incident_id: str) -> str:
        """
        Sends a prompt to Gemini and returns the raw text response.

        Args:
            prompt:      Fully-constructed prompt string from PromptBuilder.
            incident_id: Used only for structured log messages.

        Returns:
            Raw text response from the Gemini model.

        Raises:
            HTTPException: On exhausted retries or non-retryable errors.
        """
        config = types.GenerateContentConfig(
            temperature=GEMINI_TEMPERATURE,
            max_output_tokens=GEMINI_MAX_OUTPUT_TOKENS,
            response_mime_type="application/json",
        )

        last_exception: Optional[Exception] = None

        for attempt in range(1, GEMINI_MAX_RETRIES + 1):
            try:
                logger.info(
                    f"Gemini call attempt {attempt}/{GEMINI_MAX_RETRIES} "
                    f"for incident_id: {incident_id}"
                )
                t0 = time.time()

                response = _client.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=prompt,
                    config=config,
                )

                elapsed = time.time() - t0
                logger.info(
                    f"Gemini responded in {elapsed:.3f}s "
                    f"for incident_id: {incident_id} (attempt {attempt})"
                )

                # Extract text from the response
                raw_text: str = response.text
                if not raw_text or not raw_text.strip():
                    raise ValueError("Gemini returned an empty response body.")

                return raw_text

            except Exception as exc:
                last_exception = exc
                error_str = str(exc).lower()

                # Check if error contains a retryable status code or keyword
                should_retry = any(
                    str(code) in error_str
                    for code in GEMINI_RETRY_STATUS_CODES
                )
                should_retry = should_retry or any(
                    keyword in error_str
                    for keyword in [
                        "rate limit", "quota", "unavailable",
                        "timeout", "overloaded", "resource_exhausted"
                    ]
                )

                if should_retry and attempt < GEMINI_MAX_RETRIES:
                    wait_seconds = 2 ** attempt  # exponential back-off: 2s, 4s
                    logger.warning(
                        f"Gemini transient error on attempt {attempt} "
                        f"for incident_id {incident_id}: {exc}. "
                        f"Retrying in {wait_seconds}s…"
                    )
                    time.sleep(wait_seconds)
                else:
                    logger.error(
                        f"Gemini non-retryable error on attempt {attempt} "
                        f"for incident_id {incident_id}: {exc}"
                    )
                    break

        # All attempts exhausted
        logger.error(
            f"Gemini failed after {GEMINI_MAX_RETRIES} attempts "
            f"for incident_id: {incident_id}. Last error: {last_exception}"
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                f"The AI analysis service is temporarily unavailable after "
                f"{GEMINI_MAX_RETRIES} attempts. Please try again later."
            ),
        )
