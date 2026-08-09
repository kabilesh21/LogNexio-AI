import time
import uuid
import json
from collections import deque
from pathlib import Path
from typing import List, Dict, Any

from fastapi import HTTPException, status
from config.config import settings
from services.parser_service import ParserService
from services.detector_service import DetectorService
from models.analysis import IncidentResponse, AnalysisResponse
from utils.analysis_logger import get_analysis_logger

logger = get_analysis_logger("AnalysisService")

class AnalysisService:
    @classmethod
    def analyze_file(cls, file_id: str) -> AnalysisResponse:
        """
        Runs the streaming analysis pipeline to detect error blocks, extract context,
        classify severity levels, and caches the result in TiDB database.
        """
        # 1. Try Cache hit first from database
        from config.db import SessionLocal, DBLogFile, DBAnalysisCache, DBIncident
        db = SessionLocal()
        db_cache = None
        try:
            db_cache = db.query(DBAnalysisCache).filter(DBAnalysisCache.file_id == file_id).first()
        except Exception as e:
            logger.error(f"Error querying analysis cache: {str(e)}")
        finally:
            db.close()

        if db_cache:
            logger.info(f"Analysis cache HIT for file_id: {file_id}. Loading parsed results.")
            try:
                cached_data = json.loads(db_cache.analysis_data)
                return AnalysisResponse(**cached_data)
            except Exception as e:
                logger.error(f"Failed to load cached analysis data: {str(e)}")
                # Continue to re-generate if cache is corrupted
        
        logger.info(f"Analysis cache MISS for file_id: {file_id}. Initiating stream analysis.")
        
        # 2. Get file details from database
        db = SessionLocal()
        db_file = None
        try:
            db_file = db.query(DBLogFile).filter(DBLogFile.file_id == file_id).first()
        except Exception as e:
            logger.error(f"Failed to query log file: {str(e)}")
        finally:
            db.close()

        if not db_file:
            logger.error(f"Upload file not found for ID: {file_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Log file metadata for ID {file_id} not found."
            )

        # 3. Stream through lines to extract incidents
        start_time = time.time()
        
        sliding_window = deque(maxlen=10)
        incidents = []
        state = "IDLE"  # IDLE, IN_ERROR, IN_CONTEXT_AFTER
        
        active_incident = None

        try:
            line_generator = ParserService.stream_log_lines(db_file.content)
            for line_item in line_generator:
                line_num = line_item["line"]
                line_text = line_item["text"]
                
                if state == "IN_ERROR":
                    # Check continuation first
                    if DetectorService.is_continuation(line_text, active_incident["error_block"]):
                        active_incident["error_block"].append(line_text)
                    else:
                        # Not a continuation. Does it start a new error?
                        if DetectorService.is_error_start(line_text):
                            cls._add_to_incidents(active_incident, incidents)
                            active_incident = {
                                "line_number": line_num,
                                "error_block": [line_text],
                                "context_before": list(sliding_window),
                                "context_after": []
                            }
                            state = "IN_ERROR"
                        else:
                            # Transition to context_after collection
                            active_incident["context_after"].append(line_text)
                            sliding_window.append(line_text)
                            if len(active_incident["context_after"]) >= 10:
                                cls._add_to_incidents(active_incident, incidents)
                                active_incident = None
                                state = "IDLE"
                            else:
                                state = "IN_CONTEXT_AFTER"
                                
                elif state == "IN_CONTEXT_AFTER":
                    # Does it start a new error?
                    if DetectorService.is_error_start(line_text):
                        cls._add_to_incidents(active_incident, incidents)
                        active_incident = {
                            "line_number": line_num,
                            "error_block": [line_text],
                            "context_before": list(sliding_window),
                            "context_after": []
                        }
                        state = "IN_ERROR"
                    else:
                        active_incident["context_after"].append(line_text)
                        sliding_window.append(line_text)
                        if len(active_incident["context_after"]) >= 10:
                            cls._add_to_incidents(active_incident, incidents)
                            active_incident = None
                            state = "IDLE"
                            
                else: # IDLE state
                    if DetectorService.is_error_start(line_text):
                        active_incident = {
                            "line_number": line_num,
                            "error_block": [line_text],
                            "context_before": list(sliding_window),
                            "context_after": []
                        }
                        state = "IN_ERROR"
                    else:
                        sliding_window.append(line_text)
            
            # Finalize any leftover active incident
            if active_incident:
                cls._add_to_incidents(active_incident, incidents)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error parsing log file lines: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An internal parser error occurred during log parsing."
            )

        duration = time.time() - start_time
        logger.info(f"Stream analysis completed in {duration:.4f}s. Detected {len(incidents)} incidents.")

        # 4. Generate UUIDs, classify severity / type and write persistent database records
        incident_responses: List[IncidentResponse] = []
        
        db = SessionLocal()
        try:
            # Delete any previously parsed incidents for this file_id (idempotency)
            db.query(DBIncident).filter(DBIncident.file_id == file_id).delete()
            db.commit()
        except Exception as e:
            db.rollback()
            logger.warning(f"Failed to delete old database incidents for file {file_id}: {e}")

        try:
            for inc in incidents:
                inc_id = inc["incident_id"]
                severity = cls.classify_severity(inc["error_block"])
                error_type = cls.extract_error_type(inc["error_block"])

                inc_resp = IncidentResponse(
                    incident_id=inc_id,
                    line_number=inc["line_number"],
                    error_type=error_type,
                    severity=severity,
                    context_before=inc["context_before"],
                    error_block=inc["error_block"],
                    context_after=inc["context_after"],
                    analysis_ready=True
                )
                incident_responses.append(inc_resp)

                # Persist to database
                db_inc = DBIncident(
                    incident_id=inc_id,
                    file_id=file_id,
                    line_number=inc["line_number"],
                    error_type=error_type,
                    severity=severity,
                    context_before=json.dumps(inc["context_before"]),
                    error_block=json.dumps(inc["error_block"]),
                    context_after=json.dumps(inc["context_after"]),
                    analysis_ready=True
                )
                db.add(db_inc)
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to persist incidents to database: {str(e)}")
        finally:
            db.close()

        # 5. Save master cache database record
        analysis_data = {
            "success": True,
            "file_id": file_id,
            "total_errors": len(incident_responses),
            "errors": [inc.dict() for inc in incident_responses]
        }
        
        db = SessionLocal()
        try:
            db_cache = DBAnalysisCache(
                file_id=file_id,
                total_errors=len(incident_responses),
                analysis_data=json.dumps(analysis_data)
            )
            db.merge(db_cache)
            db.commit()
            logger.info(f"Cached master analysis in database: {file_id}")
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to save analysis cache in database: {str(e)}")
        finally:
            db.close()

        return AnalysisResponse(**analysis_data)

    @classmethod
    def get_incident(cls, incident_id: str) -> IncidentResponse:
        """
        Retrieves a single incident from database in O(1) using incident_id.
        """
        from config.db import SessionLocal, DBIncident
        db = SessionLocal()
        db_inc = None
        try:
            db_inc = db.query(DBIncident).filter(DBIncident.incident_id == incident_id).first()
        except Exception as e:
            logger.error(f"Failed to read incident from database: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error reading incident details."
            )
        finally:
            db.close()

        if not db_inc:
            logger.warning(f"Incident lookup failed. ID not found in database: {incident_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Incident with ID {incident_id} not found."
            )

        return IncidentResponse(
            incident_id=db_inc.incident_id,
            line_number=db_inc.line_number,
            error_type=db_inc.error_type,
            severity=db_inc.severity,
            context_before=json.loads(db_inc.context_before),
            error_block=json.loads(db_inc.error_block),
            context_after=json.loads(db_inc.context_after),
            analysis_ready=db_inc.analysis_ready
        )

    @classmethod
    def _add_to_incidents(cls, active_incident: Dict[str, Any], incidents: List[Dict[str, Any]]):
        """
        Finalizes active incident frame and appends it to the list.
        """
        incident_id = str(uuid.uuid4())
        incidents.append({
            "incident_id": incident_id,
            "line_number": active_incident["line_number"],
            "context_before": active_incident["context_before"],
            "error_block": active_incident["error_block"],
            "context_after": active_incident["context_after"]
        })

    @staticmethod
    def classify_severity(error_block: List[str]) -> str:
        """
        Classifies severity based on guidelines.
        """
        text = "\n".join(error_block).upper()
        
        # CRITICAL/FATAL
        if any(kw in text for kw in ["OUTOFMEMORY", "STACKOVERFLOW", "FATAL", "CRITICAL", "MEMORY"]):
            return "CRITICAL"
            
        # HIGH
        if any(kw in text for kw in ["ERROR", "EXCEPTION", "TRACEBACK", "DATABASE", "NULLPOINTER", "SQL"]):
            return "HIGH"
            
        # MEDIUM
        if any(kw in text for kw in ["WARN", "WARNING", "TIMEOUT", "RETRY"]):
            return "MEDIUM"
            
        # LOW
        if "INFO" in text:
            return "LOW"
            
        return "LOW"

    @staticmethod
    def extract_error_type(error_block: List[str]) -> str:
        """
        Heuristically extracts the specific error class name or signature.
        """
        text = "\n".join(error_block)
        
        # Standard exceptions lists
        exceptions = [
            "NullPointerException", "OutOfMemoryError", "OutOfMemory",
            "StackOverflowError", "StackOverflow", "TimeoutException",
            "IOException", "SQLException", "FileNotFoundException",
            "KeyError", "ValueError", "TypeError", "IndexError", 
            "NameError", "AttributeError", "ZeroDivisionError", "AssertionError"
        ]
        
        for exc in exceptions:
            if exc.lower() in text.lower():
                return exc

        # Regex search for words ending with 'Exception' or 'Error'
        import re
        match = re.search(r'\b([A-Z][a-zA-Z0-9]*(?:Exception|Error))\b', text)
        if match:
            return match.group(1)
            
        # Fallback inspection: check reversed lines for traceback descriptions
        for line in reversed(error_block):
            if ":" in line:
                parts = line.split(":", 1)
                first_part = parts[0].strip()
                if first_part.replace(".", "").isalnum() and len(first_part) > 2:
                    return first_part

        if "error" in text.lower():
            return "RuntimeError"
        if "fatal" in text.lower():
            return "FatalError"
        if "warn" in text.lower():
            return "Warning"
            
        return "UnknownError"
