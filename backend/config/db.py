import os
import sys
from sqlalchemy import create_engine, Column, String, Integer, Text, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
from config.config import settings

# Since TiDB Cloud requires SSL/TLS, configure connection args appropriately
connect_args = {}
# PyMySQL handles SSL modes: PREFERRED, REQUIRED, VERIFY_CA, VERIFY_IDENTITY
# Auto-enable SSL for any remote database host (not localhost/127.0.0.1)
if "127.0.0.1" not in settings.DATABASE_URL.lower() and "localhost" not in settings.DATABASE_URL.lower():
    connect_args = {
        "ssl": {
            "ssl_mode": "PREFERRED"
        }
    }

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DBLogFile(Base):
    __tablename__ = "log_files"
    file_id = Column(String(50), primary_key=True, index=True)
    original_name = Column(String(255), nullable=False)
    content = Column(Text(4294967295), nullable=False)  # LONGTEXT in MySQL/TiDB
    total_lines = Column(Integer, nullable=False)
    status = Column(String(50), default="uploaded")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DBAnalysisCache(Base):
    __tablename__ = "analysis_cache"
    file_id = Column(String(50), primary_key=True, index=True)
    total_errors = Column(Integer, nullable=False)
    analysis_data = Column(Text(4294967295), nullable=False)  # LONGTEXT in MySQL/TiDB
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DBIncident(Base):
    __tablename__ = "incidents"
    incident_id = Column(String(50), primary_key=True, index=True)
    file_id = Column(String(50), index=True)
    line_number = Column(Integer, nullable=False)
    error_type = Column(String(255), nullable=False)
    severity = Column(String(50), nullable=False)
    context_before = Column(Text(16777215), nullable=False)  # MEDIUMTEXT in MySQL/TiDB
    error_block = Column(Text(16777215), nullable=False)     # MEDIUMTEXT in MySQL/TiDB
    context_after = Column(Text(16777215), nullable=False)     # MEDIUMTEXT in MySQL/TiDB
    analysis_ready = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DBAIReport(Base):
    __tablename__ = "ai_reports"
    incident_id = Column(String(50), primary_key=True, index=True)
    report_data = Column(Text(16777215), nullable=False)  # MEDIUMTEXT in MySQL/TiDB
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DBUser(Base):
    __tablename__ = "users"
    user_id = Column(String(50), primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DBPasswordReset(Base):
    __tablename__ = "password_resets"
    email = Column(String(255), primary_key=True, index=True)
    otp = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

# Auto-initialize database tables on import to guarantee existence in serverless environments
try:
    init_db()
except Exception as e:
    print(f"Database auto-initialization failed: {e}", file=sys.stderr)
