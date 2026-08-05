from pydantic import BaseModel, Field

class UploadResponse(BaseModel):
    success: bool = Field(..., description="Whether the upload was successful")
    file_id: str = Field(..., description="Unique UUID identifier for the file")
    original_name: str = Field(..., description="Original name of the uploaded file")
    saved_path: str = Field(..., description="Relative saved file path on backend server")
    total_lines: int = Field(..., description="Total line count in the file")
    status: str = Field("uploaded", description="Status of the upload pipeline")

class PipelineMetadataResponse(BaseModel):
    file_id: str = Field(..., description="Unique UUID identifier for the file")
    saved_path: str = Field(..., description="Relative saved file path on backend server")
    total_lines: int = Field(..., description="Total line count in the file")
    status: str = Field("uploaded", description="Status of the upload pipeline")

class ErrorResponse(BaseModel):
    success: bool = Field(False, description="Failure indicator")
    message: str = Field(..., description="Descriptive error message")
