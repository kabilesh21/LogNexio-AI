from pathlib import Path
from typing import Generator, Dict, Any
from utils.analysis_logger import get_analysis_logger
from fastapi import HTTPException, status

logger = get_analysis_logger("ParserService")

class ParserService:
    @staticmethod
    def stream_log_lines(filepath: Path) -> Generator[Dict[str, Any], None, None]:
        """
        Streams lines from the log file one-by-one.
        Memory efficient and safely handles large files (100MB+), 
        mixed line endings, UTF-8 BOM, and invalid unicode characters.
        
        Yields:
            dict: {"line": line_number, "text": "line_content"}
        """
        if not filepath.exists():
            logger.error(f"File not found for parsing: {filepath}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target log file not found on the server."
            )

        logger.info(f"Started streaming parse on log file: {filepath.name}")
        
        try:
            # 'utf-8-sig' automatically handles UTF-8 files with or without BOM.
            # errors='ignore' safely skips invalid bytes instead of crashing.
            with open(filepath, mode="r", encoding="utf-8-sig", errors="ignore") as file:
                for line_number, line_content in enumerate(file, start=1):
                    # We keep newline characters stripped or preserved?
                    # The prompt context extraction and display is cleaner if we keep standard text,
                    # but strip trailing newlines for presentation. 
                    # Let's strip trailing carriage return / newline characters to normalize mixed line endings.
                    normalized_text = line_content.rstrip("\r\n")
                    yield {
                        "line": line_number,
                        "text": normalized_text
                    }
            logger.info(f"Successfully finished parsing file: {filepath.name}")
        except Exception as e:
            logger.error(f"Failure during streaming parse of {filepath.name}: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred while streaming and parsing the log content."
            )
