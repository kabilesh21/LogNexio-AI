from typing import List


class PromptBuilder:
    """
    Constructs the expert SRE/DevOps analysis prompt sent to Gemini.

    The prompt instructs the model to behave as a panel of senior engineers,
    analyse only the supplied context window, and return a strictly-typed JSON
    report — never Markdown, never plain prose outside the JSON envelope.
    """

    # Persona definition placed at the top of every prompt so the model always
    # adopts the correct professional framing regardless of temperature settings.
    PERSONA: str = (
        "You are a panel of four expert engineers with combined 40+ years of experience:\n"
        "  • Senior Site Reliability Engineer (SRE)\n"
        "  • Senior DevOps Engineer\n"
        "  • Senior Software Architect\n"
        "  • Senior Production Support Engineer\n\n"
        "Your task is to analyse the log excerpt below and produce a professional, "
        "actionable incident report."
    )

    # Exact JSON schema the model must emit — included inline so the model sees
    # the schema next to the data and cannot hallucinate extra keys.
    SCHEMA: str = """{
  "incident_id": "<string — UUID provided in the input>",
  "incident_summary": "<string — one-sentence executive summary>",
  "error_type": "<string — precise exception or error class name>",
  "severity": "<string — one of: CRITICAL | HIGH | MEDIUM | LOW>",
  "root_cause": "<string — concise root cause statement>",
  "technical_explanation": "<string — detailed technical analysis including how the preceding log context contributed to the failure>",
  "affected_component": "<string — specific service, class, module, or infrastructure component>",
  "business_impact": "<string — impact on end users, SLAs, or business operations>",
  "resolution_steps": [
    "<step 1>",
    "<step 2>",
    "<step 3>"
  ],
  "preventive_measures": [
    "<measure 1>",
    "<measure 2>",
    "<measure 3>"
  ],
  "confidence": "<string — e.g. '95%'>",
  "estimated_fix_time": "<string — e.g. '15-30 minutes'>",
  "keywords": ["<keyword1>", "<keyword2>"]
}"""

    @classmethod
    def build(
        cls,
        incident_id: str,
        context_before: List[str],
        error_block: List[str],
        context_after: List[str],
    ) -> str:
        """
        Constructs the full prompt string ready to send to the Gemini API.

        Args:
            incident_id:    UUID of the incident (injected into the JSON schema so
                            the model echoes it back in the report).
            context_before: Up to 10 log lines preceding the error block.
            error_block:    The multiline exception or stack trace lines.
            context_after:  Up to 10 log lines following the error block.

        Returns:
            A single complete prompt string.
        """
        before_text: str = cls._format_lines(context_before, label="PRE-ERROR CONTEXT")
        error_text: str = cls._format_lines(error_block, label="ERROR BLOCK (primary evidence)")
        after_text: str = cls._format_lines(context_after, label="POST-ERROR CONTEXT")

        schema_with_id: str = cls.SCHEMA.replace(
            "<string — UUID provided in the input>", incident_id
        )

        prompt: str = f"""{cls.PERSONA}

══════════════════════════════════════════════════════════════════
LOG EXCERPT TO ANALYSE  (incident_id: {incident_id})
══════════════════════════════════════════════════════════════════

{before_text}

{error_text}

{after_text}

══════════════════════════════════════════════════════════════════
ANALYSIS REQUIREMENTS
══════════════════════════════════════════════════════════════════

Analyse the log excerpt above and answer ALL of the following:

1. INCIDENT SUMMARY  — Write a single executive-level sentence describing what happened.
2. ERROR TYPE        — Identify the most precise error or exception class name.
3. SEVERITY          — Classify as CRITICAL, HIGH, MEDIUM, or LOW using industry SRE standards.
4. ROOT CAUSE        — State the fundamental technical reason the failure occurred.
5. TECHNICAL EXPLANATION — Explain in depth:
   a) What the error_block reveals about the failure mode.
   b) How the pre-error context lines contributed or led to the failure.
   c) What the post-error context tells us about system behaviour after failure.
6. AFFECTED COMPONENT — Identify the specific class, service, module, database, or infrastructure layer.
7. BUSINESS IMPACT   — Describe real-world effects on users, SLAs, and business operations.
8. RESOLUTION STEPS  — Provide an ordered, actionable step-by-step remediation plan.
9. PREVENTIVE MEASURES — Recommend concrete engineering changes to prevent recurrence.
10. CONFIDENCE       — State your confidence in this analysis as a percentage (e.g. "95%").
11. ESTIMATED FIX TIME — Provide a realistic time estimate to resolve this incident.
12. KEYWORDS         — Extract relevant technical keywords (exception names, components, etc.).

══════════════════════════════════════════════════════════════════
OUTPUT RULES  (strictly enforced)
══════════════════════════════════════════════════════════════════

• Return ONLY valid JSON — no Markdown, no code fences, no commentary outside the JSON.
• The response must start with {{ and end with }}.
• Do NOT include ```json or ``` anywhere in the output.
• Do NOT include any text before or after the JSON object.
• Use the EXACT field names shown in the schema below — do not add or remove fields.
• Arrays must contain at least 3 items each (resolution_steps, preventive_measures).
• Strings must be non-empty for all required fields.
• If information is genuinely unavailable, write "Insufficient context to determine" — do not omit the field.

REQUIRED OUTPUT SCHEMA:
{schema_with_id}
"""
        return prompt.strip()

    @staticmethod
    def _format_lines(lines: List[str], label: str) -> str:
        """Formats a list of log lines with a section label and line numbers."""
        if not lines:
            return f"--- {label} ---\n(no lines available)"
        formatted = "\n".join(f"  {i + 1:>3} | {line}" for i, line in enumerate(lines))
        return f"--- {label} ---\n{formatted}"
