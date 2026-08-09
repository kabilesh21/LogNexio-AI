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
        Saves the file to the TiDB database, counts lines, and saves metadata.
        """
        original_name = file.filename
        
        # Read the file content bytes
        try:
            content_bytes = file.file.read()
            file.file.seek(0)  # Reset to beginning
        except Exception as e:
            logger.error(f"Error checking file size: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not determine file size."
            )

        file_size = len(content_bytes)

        # Validate file size and extension
        cls.validate_file_metadata(original_name, file_size)

        # Decode the file bytes to string for database storing
        try:
            content_text = content_bytes.decode("utf-8", errors="ignore")
        except Exception as e:
            logger.error(f"Failed to decode file: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is not a valid text/log format."
            )

        # Generate unique file id
        file_id = str(uuid.uuid4())
        
        # Count lines from content_text
        total_lines = len(content_text.splitlines())

        # Persist log file and metadata to TiDB Database
        from config.db import SessionLocal, DBLogFile
        db = SessionLocal()
        try:
            db_file = DBLogFile(
                file_id=file_id,
                original_name=original_name,
                content=content_text,
                total_lines=total_lines,
                status="uploaded"
            )
            db.add(db_file)
            db.commit()
            logger.info(f"Log file saved to TiDB successfully: {original_name} (ID: {file_id})")
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to save log file to database: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record upload metadata on database."
            )
        finally:
            db.close()

        metadata = {
            "success": True,
            "file_id": file_id,
            "original_name": original_name,
            "saved_path": f"db://log_files/{file_id}",
            "total_lines": total_lines,
            "status": "uploaded"
        }

        return UploadResponse(**metadata)

    @classmethod
    def get_metadata(cls, file_id: str) -> PipelineMetadataResponse:
        """
        Retrieves log metadata using the file_id from the database.
        """
        from config.db import SessionLocal, DBLogFile
        db = SessionLocal()
        db_file = None
        try:
            db_file = db.query(DBLogFile).filter(DBLogFile.file_id == file_id).first()
        except Exception as e:
            logger.error(f"Database query error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error reading metadata."
            )
        finally:
            db.close()

        if not db_file:
            logger.warning(f"Metadata lookup failed: file_id '{file_id}' not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Log file metadata for ID {file_id} not found."
            )

        return PipelineMetadataResponse(
            file_id=db_file.file_id,
            saved_path=f"db://log_files/{db_file.file_id}",
            total_lines=db_file.total_lines,
            status=db_file.status
        )
