import hashlib
import secrets
import uuid
import datetime
from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from config.db import SessionLocal, DBUser
from utils.logger import get_logger

logger = get_logger("AuthRoutes")
router = APIRouter(tags=["Authentication"])

# --- Request / Response Pydantic Models ---

class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    email: str = Field(None, max_length=255)

class UserLoginRequest(BaseModel):
    username: str = Field(...)
    password: str = Field(...)

class UserResponse(BaseModel):
    success: bool
    user_id: str
    username: str
    email: str = None
    created_at: str

# --- Security Helpers (PBKDF2 SHA-256) ---

def hash_password(password: str) -> str:
    """Hashes a password securely using PBKDF2 with SHA-256."""
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac(
        'sha256', 
        password.encode('utf-8'), 
        salt.encode('utf-8'), 
        100000
    )
    return f"{salt}:{dk.hex()}"

def verify_password(password: str, hashed: str) -> bool:
    """Verifies a password against its PBKDF2 hash."""
    try:
        salt, key_hex = hashed.split(":")
        dk = hashlib.pbkdf2_hmac(
            'sha256', 
            password.encode('utf-8'), 
            salt.encode('utf-8'), 
            100000
        )
        return secrets.compare_digest(dk.hex(), key_hex)
    except Exception:
        return False

# --- Endpoints ---

@router.post(
    "/auth/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Checks for availability, hashes password, saves credentials to TiDB database."
)
def register_user(payload: UserRegisterRequest):
    logger.info(f"Received registration request for username: {payload.username}")
    
    db = SessionLocal()
    try:
        # Check if username already exists
        existing_user = db.query(DBUser).filter(DBUser.username == payload.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already taken."
            )
            
        # Create and save new user
        password_hash = hash_password(payload.password)
        user_id = str(uuid.uuid4())
        
        new_user = DBUser(
            user_id=user_id,
            username=payload.username,
            password_hash=password_hash,
            email=payload.email,
            created_at=datetime.datetime.utcnow()
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"User {payload.username} registered successfully with id {user_id}")
        return UserResponse(
            success=True,
            user_id=new_user.user_id,
            username=new_user.username,
            email=new_user.email,
            created_at=new_user.created_at.isoformat()
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error during registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )
    finally:
        db.close()

@router.post(
    "/auth/login",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate a user",
    description="Verifies username and password hash against TiDB records."
)
def login_user(payload: UserLoginRequest):
    logger.info(f"Received login request for username: {payload.username}")
    
    db = SessionLocal()
    try:
        # Query user
        user = db.query(DBUser).filter(DBUser.username == payload.username).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password."
            )
            
        # Verify password
        if not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password."
            )
            
        logger.info(f"User {payload.username} logged in successfully.")
        return UserResponse(
            success=True,
            user_id=user.user_id,
            username=user.username,
            email=user.email,
            created_at=user.created_at.isoformat()
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )
    finally:
        db.close()
