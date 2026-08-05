from fastapi import APIRouter, UploadFile, File, status
from services.upload_service import UploadService
from models.upload import UploadResponse, PipelineMetadataResponse
from utils.logger import get_logger

logger = get_logger("UploadRoutes")

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post(
    "",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a log or text file",
    description="Validates type/size, generates UUID, saves file, counts lines and returns pipeline metadata."
)
async def upload_file(file: UploadFile = File(...)):
    logger.info(f"Received upload request for file: {file.filename}")
    response = UploadService.save_uploaded_file(file)
    return response

@router.get(
    "/{file_id}",
    response_model=PipelineMetadataResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve file metadata",
    description="Retrieves the line count and state of the uploaded file by UUID for processing in future modules."
)
async def get_file_metadata(file_id: str):
    logger.info(f"Received metadata request for file_id: {file_id}")
    response = UploadService.get_metadata(file_id)
    return response
