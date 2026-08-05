import logging
from pathlib import Path
from logging.handlers import RotatingFileHandler

# Resolve directory path
BACKEND_DIR = Path(__file__).resolve().parent.parent
LOG_FILE_PATH = BACKEND_DIR / "analysis.log"

# Define log message layout
formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s - %(message)s")

# File Rotating Handler (Max size 10MB, keep 3 backup copies)
file_handler = RotatingFileHandler(
    LOG_FILE_PATH,
    maxBytes=10 * 1024 * 1024,
    backupCount=3,
    encoding="utf-8"
)
file_handler.setFormatter(formatter)
file_handler.setLevel(logging.INFO)

# Standard stdout streaming handler for local CLI visibility
stream_handler = logging.StreamHandler()
stream_handler.setFormatter(formatter)
stream_handler.setLevel(logging.INFO)

def get_analysis_logger(name: str) -> logging.Logger:
    """
    Returns a configured logger instance that writes to analysis.log and stdout.
    """
    logger = logging.getLogger(f"Analysis.{name}")
    logger.setLevel(logging.INFO)
    
    # Avoid duplicating handlers if logger is imported in multiple modules
    if not logger.handlers:
        logger.addHandler(file_handler)
        logger.addHandler(stream_handler)
        
    return logger
