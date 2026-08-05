import os
import uuid
import json
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from config.config import settings
from utils.logger import get_logger
from models.upload import UploadResponse, PipelineMetadataResponse

logger = get_logger("UploadService")

class UploadService:
    @staticmethod
    def validate_file_metadata(filename: str, size: int = None):
        """
        Validates the extension and size of the file before uploading.
        """
        # Validate extension
        ext = Path(filename).suffix.lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            logger.warning(f"File rejection: unsupported extension '{ext}' for file '{filename}'")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file format. Only .log and .txt files are allowed."
            )
            
        # Validate size if provided
        if size is not None and size > settings.MAX_FILE_SIZE_BYTES:
            logger.warning(f"File rejection: size {size} bytes exceeds limit of {settings.MAX_FILE_SIZE_BYTES} bytes")
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum allowed size is {settings.MAX_FILE_SIZE_MB}MB."
            )

    @staticmethod
    def _count_lines(filepath: Path) -> int:
        """
        Counts total lines in a file efficiently.
        """
        count = 0
        try:
            with open(filepath, "rb") as f:
                for _ in f:
                    count += 1
            logger.info(f"Counted {count} lines in file: {filepath.name}")
        except Exception as e:
            logger.error(f"Error counting lines for file {filepath.name}: {str(e)}")
            # Fallback or propagate
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error parsing the content of the uploaded file."
            )
        return count

    @classmethod
    def save_uploaded_file(cls, file: UploadFile) -> UploadResponse:
        """
        Saves the file to the uploads directory, counts lines, and saves metadata.
        """
        # 1. Perform metadata verification (filename and content size)
        original_name = file.filename
        
        # Read a small chunk or check headers if needed, but FastAPI does not give size by default
        # unless we check the headers content-length or seek to the end.
        # Let's seek to end to check size if not provided by headers.
        try:
            # Check content-length header first
            content_length = file.headers.get("content-length")
            if content_length:
                file_size = int(content_length)
            else:
                # Seek to find file size
                file.file.seek(0, os.SEEK_END)
                file_size = file.file.tell()
                file.file.seek(0)  # Reset to beginning
        except Exception as e:
            logger.error(f"Error checking file size: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not determine file size."
            )

        # Validate file
        cls.validate_file_metadata(original_name, file_size)

        # Generate unique file id and save filename
        file_id = str(uuid.uuid4())
        extension = Path(original_name).suffix.lower()
        unique_filename = f"{file_id}{extension}"
        
        # Paths
        saved_file_path = settings.UPLOAD_DIR / unique_filename
        # Relative path returned to client (as per contract/standards)
        relative_saved_path = f"{settings.UPLOAD_DIR_NAME}/{unique_filename}"

        # 2. Write file content to disk in chunks to handle size efficiently
        try:
            with open(saved_file_path, "wb") as buffer:
                while True:
                    chunk = file.file.read(1024 * 1024)  # 1MB chunks
                    if not chunk:
                        break
                    buffer.write(chunk)
            logger.info(f"File saved successfully: {unique_filename} (Original: {original_name})")
        except Exception as e:
            logger.error(f"Failed to write file {unique_filename} to disk: {str(e)}")
            if saved_file_path.exists():
                saved_file_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save uploaded file to server disk."
            )

        # 3. Count lines
        total_lines = cls._count_lines(saved_file_path)

        # 4. Prepare metadata
        metadata = {
            "success": True,
            "file_id": file_id,
            "original_name": original_name,
            "saved_path": relative_saved_path,
            "total_lines": total_lines,
            "status": "uploaded"
        }

        # 5. Persist metadata to JSON file
        metadata_filepath = settings.METADATA_DIR / f"{file_id}.json"
        try:
            with open(metadata_filepath, "w", encoding="utf-8") as f:
                json.dump(metadata, f, indent=4)
            logger.info(f"Metadata stored successfully for file_id: {file_id}")
        except Exception as e:
            logger.error(f"Failed to save metadata for file_id {file_id}: {str(e)}")
            # Clean up the file if metadata write fails
            if saved_file_path.exists():
                saved_file_path.unlink()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record upload metadata on server."
            )

        return UploadResponse(**metadata)

    @classmethod
    def get_metadata(cls, file_id: str) -> PipelineMetadataResponse:
        """
        Retrieves log metadata using the file_id.
        """
        metadata_filepath = settings.METADATA_DIR / f"{file_id}.json"
        if not metadata_filepath.exists():
            logger.warning(f"Metadata lookup failed: file_id '{file_id}' not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Log file metadata for ID {file_id} not found."
            )

        try:
            with open(metadata_filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            # Verify the referenced log file still exists
            actual_file_path = settings.BACKEND_DIR / data["saved_path"]
            if not actual_file_path.exists():
                logger.error(f"Reference log file missing for metadata ID {file_id}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Log file has been removed or is missing from server."
                )

            return PipelineMetadataResponse(
                file_id=data["file_id"],
                saved_path=data["saved_path"],
                total_lines=data["total_lines"],
                status=data["status"]
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error loading metadata for file_id {file_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal error reading upload metadata."
            )
