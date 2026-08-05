from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from models.ai_report import AIReport


class ReportSummaryItem(BaseModel):
    """Compact report summary for list and grid displays."""
    incident_id: str = Field(..., description="UUID of the incident")
    error_type: str = Field(..., description="Exception or error type")
    severity: str = Field(..., description="Severity level: CRITICAL, HIGH, MEDIUM, LOW")
    incident_summary: str = Field(..., description="One-sentence executive summary")
    affected_component: str = Field(..., description="Affected system component")
    confidence: str = Field("95%", description="AI confidence score")
    created_at: str = Field(..., description="ISO 8601 creation timestamp")
    estimated_fix_time: str = Field("15-30 minutes", description="Estimated fix duration")
    keywords: List[str] = Field(default_factory=list, description="Associated technical keywords")


class ReportListResponse(BaseModel):
    """API response for report listing."""
    success: bool = Field(True)
    total: int = Field(..., description="Total count of saved AI reports")
    reports: List[ReportSummaryItem] = Field(default_factory=list)


class ReportComparisonRequest(BaseModel):
    """Payload for comparing multiple AI reports."""
    incident_ids: List[str] = Field(..., min_length=2, description="List of incident IDs to compare")


class ComparisonFieldDiff(BaseModel):
    """Comparison item for a single attribute across reports."""
    field_name: str
    values: Dict[str, Any]  # { incident_id: value }
    is_different: bool


class ReportComparisonResponse(BaseModel):
    """API response for report comparison."""
    success: bool = Field(True)
    compared_incidents: List[str]
    reports: Dict[str, AIReport]
    differences: List[ComparisonFieldDiff]
    summary_insight: str = Field("", description="High-level comparative insight")


class ReportHistoryItem(BaseModel):
    """Item in chronological report history timeline."""
    incident_id: str
    error_type: str
    severity: str
    incident_summary: str
    affected_component: str
    timestamp: str
    formatted_date: str


class ReportHistoryResponse(BaseModel):
    """Response containing chronological report generation timeline."""
    success: bool = Field(True)
    total: int
    history: List[ReportHistoryItem]
