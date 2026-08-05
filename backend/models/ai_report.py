from pydantic import BaseModel, Field
from typing import List


class AIReport(BaseModel):
    """
    Exact AI report schema contract for Module 3.
    Modules 4 and 5 depend on this structure — do not alter field names.
    """
    incident_id: str = Field(..., description="UUID of the incident this report addresses")
    incident_summary: str = Field(..., description="One-sentence executive summary of the incident")
    error_type: str = Field(..., description="Classified error or exception type")
    severity: str = Field(..., description="Severity level: CRITICAL, HIGH, MEDIUM, or LOW")
    root_cause: str = Field(..., description="Identified root cause of the failure")
    technical_explanation: str = Field(
        ...,
        description="Detailed technical explanation of why the failure occurred and what the preceding log context reveals"
    )
    affected_component: str = Field(..., description="System component or service affected by this incident")
    business_impact: str = Field(..., description="Business-level description of impact on end users or operations")
    resolution_steps: List[str] = Field(
        ...,
        description="Ordered step-by-step resolution actions an engineer should take",
        min_length=1
    )
    preventive_measures: List[str] = Field(
        ...,
        description="Recommended preventive actions to avoid recurrence",
        min_length=1
    )
    confidence: str = Field("95%", description="AI confidence level for this analysis (e.g. '95%')")
    estimated_fix_time: str = Field(
        "15-30 minutes",
        description="Estimated time required to resolve the incident"
    )
    keywords: List[str] = Field(
        default_factory=list,
        description="Relevant technical keywords extracted from the error context"
    )


class AIReportResponse(BaseModel):
    """API response wrapper for a successfully generated AI report."""
    success: bool = Field(True)
    report: AIReport


class AIErrorResponse(BaseModel):
    """Standardised error response for AI analysis failures."""
    success: bool = Field(False)
    message: str
    details: str = Field("")
