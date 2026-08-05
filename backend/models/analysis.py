from pydantic import BaseModel, Field
from typing import List

class IncidentResponse(BaseModel):
    incident_id: str = Field(..., description="Unique UUID identifier for this incident")
    line_number: int = Field(..., description="Line number where the error started (1-indexed)")
    error_type: str = Field(..., description="Classification of the error type")
    severity: str = Field(..., description="Severity classification (CRITICAL, FATAL, HIGH, MEDIUM, LOW)")
    context_before: List[str] = Field(..., description="Up to 10 lines of context preceding the error block")
    error_block: List[str] = Field(..., description="The multiline error block or stack trace lines")
    context_after: List[str] = Field(..., description="Up to 10 lines of context succeeding the error block")
    analysis_ready: bool = Field(True, description="Indicates the block is structured and ready for future analysis")

class AnalysisResponse(BaseModel):
    success: bool = Field(..., description="Indicates if the analysis completed successfully")
    file_id: str = Field(..., description="The UUID of the analyzed log file")
    total_errors: int = Field(..., description="Total number of detected error incidents")
    errors: List[IncidentResponse] = Field(..., description="List of detected log incidents")
