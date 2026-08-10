import hashlib
import secrets
import uuid
import datetime
from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from config.db import SessionLocal, DBUser, DBPasswordReset
from services.email_service import send_reset_otp_email
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

# --- Password Reset Request / Response Models ---

class ForgotPasswordRequest(BaseModel):
    email: str = Field(...)

class ResetPasswordRequest(BaseModel):
    email: str = Field(...)
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6)

@router.post(
    "/auth/forgot-password",
    status_code=status.HTTP_200_OK,
    summary="Request a password reset code",
    description="Checks if email is registered, generates OTP, saves to DB, sends SMTP mail."
)
def forgot_password(payload: ForgotPasswordRequest):
    logger.info(f"Received forgot password request for email: {payload.email}")
    db = SessionLocal()
    try:
        # Check if user exists with this email
        user = db.query(DBUser).filter(DBUser.email == payload.email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No user registered with this email address."
            )
            
        # Generate 6-digit numeric OTP
        otp = f"{secrets.randbelow(1000000):06d}"
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
        
        # Check if a reset code already exists for this email
        reset_record = db.query(DBPasswordReset).filter(DBPasswordReset.email == payload.email).first()
        if reset_record:
            reset_record.otp = otp
            reset_record.expires_at = expires_at
            reset_record.created_at = datetime.datetime.utcnow()
        else:
            reset_record = DBPasswordReset(
                email=payload.email,
                otp=otp,
                expires_at=expires_at,
                created_at=datetime.datetime.utcnow()
            )
            db.add(reset_record)
            
        db.commit()
        
        # Send SMTP verification email
        email_sent = send_reset_otp_email(payload.email, otp)
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send verification email. Please try again later."
            )
            
        return {"success": True, "message": "Verification OTP has been sent to your email."}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error during forgot-password request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Forgot password request failed: {str(e)}"
        )
    finally:
        db.close()

@router.post(
    "/auth/reset-password",
    status_code=status.HTTP_200_OK,
    summary="Reset password using verification code",
    description="Validates OTP, hashes new password, updates database record."
)
def reset_password(payload: ResetPasswordRequest):
    logger.info(f"Received reset password request for email: {payload.email}")
    db = SessionLocal()
    try:
        # Find reset record
        reset_record = db.query(DBPasswordReset).filter(DBPasswordReset.email == payload.email).first()
        if not reset_record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No reset code found or it has already expired."
            )
            
        # Verify expiration
        if datetime.datetime.utcnow() > reset_record.expires_at:
            db.delete(reset_record)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code has expired. Please request a new one."
            )
            
        # Verify OTP code
        if not secrets.compare_digest(reset_record.otp, payload.otp):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code."
            )
            
        # Find user and update password
        user = db.query(DBUser).filter(DBUser.email == payload.email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found."
            )
            
        user.password_hash = hash_password(payload.new_password)
        db.delete(reset_record)
        db.commit()
        
        logger.info(f"Password reset successfully for email: {payload.email}")
        return {"success": True, "message": "Password has been successfully reset! You can now log in."}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error during reset-password request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Password reset failed: {str(e)}"
        )
    finally:
        db.close()
