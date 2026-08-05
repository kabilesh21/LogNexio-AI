import os
from pathlib import Path
from dotenv import load_dotenv

# Resolve the backend directory path and load .env
BACKEND_DIR = Path(__file__).resolve().parent.parent
env_path = BACKEND_DIR / ".env"
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

# Model selection - gemini-3.1-flash-lite: confirmed available on this API key's free tier
GEMINI_MODEL: str = "gemini-3.1-flash-lite"

# Request timeout in seconds
GEMINI_TIMEOUT_SECONDS: int = 30

# Maximum number of retry attempts on transient errors
GEMINI_MAX_RETRIES: int = 3

# HTTP status codes that should trigger a retry
GEMINI_RETRY_STATUS_CODES: list = [429, 500, 502, 503, 504]

# Generation configuration for structured deterministic output
GEMINI_TEMPERATURE: float = 0.2
GEMINI_MAX_OUTPUT_TOKENS: int = 4096
