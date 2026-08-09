from pathlib import Path
from typing import Generator, Dict, Any
from utils.analysis_logger import get_analysis_logger
from fastapi import HTTPException, status

logger = get_analysis_logger("ParserService")

class ParserService:
    @staticmethod
    def stream_log_lines(content: str) -> Generator[Dict[str, Any], None, None]:
        """
        Streams lines from the log content string one-by-one.
        Memory efficient and safely handles large contents using StringIO.
        
        Yields:
            dict: {"line": line_number, "text": "line_content"}
        """
        logger.info("Started streaming parse on log content")
        
        try:
            import io
            # StringIO acts like a file object in memory, avoiding reading the whole string into a list
            file_like = io.StringIO(content)
            for line_number, line_content in enumerate(file_like, start=1):
                normalized_text = line_content.rstrip("\r\n")
                yield {
                    "line": line_number,
                    "text": normalized_text
                }
            logger.info("Successfully finished parsing content")
        except Exception as e:
            logger.error(f"Failure during streaming parse: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred while streaming and parsing the log content."
            )
