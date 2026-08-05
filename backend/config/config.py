import os
from pathlib import Path
from dotenv import load_dotenv

# Resolve the backend directory path
BACKEND_DIR = Path(__file__).resolve().parent.parent

# Load the environment variables from the .env file
env_path = BACKEND_DIR / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    BACKEND_DIR: Path = BACKEND_DIR
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENV: str = os.getenv("ENV", "development")
    
    # Upload Settings
    UPLOAD_DIR_NAME: str = os.getenv("UPLOAD_DIR", "uploads")
    UPLOAD_DIR: Path = BACKEND_DIR / UPLOAD_DIR_NAME
    METADATA_DIR: Path = UPLOAD_DIR / "metadata"
    
    # Validation Constraints
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "50"))
    MAX_FILE_SIZE_BYTES: int = MAX_FILE_SIZE_MB * 1024 * 1024
    ALLOWED_EXTENSIONS: set = {".log", ".txt"}

settings = Settings()

# Ensure directories exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.METADATA_DIR.mkdir(parents=True, exist_ok=True)
