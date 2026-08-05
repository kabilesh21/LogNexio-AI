import re
from typing import List

class DetectorService:
    # Compiled pattern for error start keywords with word boundaries
    ERROR_PATTERN = re.compile(
        r"\b(ERROR|FATAL|CRITICAL|SEVERE|EXCEPTION|UNHANDLED|"
        r"OUTOFMEMORY|STACKOVERFLOW|NULLPOINTEREXCEPTION|"
        r"TIMEOUTEXCEPTION|IOEXCEPTION|SQL\s+EXCEPTION|TRACEBACK|CAUSED\s+BY)\b",
        re.IGNORECASE
    )

    @classmethod
    def is_error_start(cls, line_text: str) -> bool:
        """
        Detects if a log line indicates the start of an error incident using word boundary regex.
        """
        # 1. Check keyword pattern with word boundaries
        if cls.ERROR_PATTERN.search(line_text):
            return True
            
        # 2. Check Java multi-thread exception pattern
        # e.g., Exception in thread "main" java.lang.NullPointerException
        if "exception in thread" in line_text.lower():
            return True
            
        return False

    @classmethod
    def is_continuation(cls, line_text: str, parent_error_block: List[str]) -> bool:
        """
        Determines if the current line is a continuation of the active stack trace/error block.
        
        Rules:
        - Indented lines (starts with spaces or tabs) are continuation.
        - Lines starting with 'at ', 'Caused by:', or '... ' are continuation (Java/NodeJS/etc.).
        - If the error block started with a Python 'Traceback (most recent call last):',
          all indented lines are continuation, and we also consume exactly one non-indented line 
          immediately following them (which is the exception description: e.g. "ValueError: details").
        """
        stripped = line_text.strip()
        if not stripped:
            return True # Empty lines inside tracebacks are kept
            
        # Check standard indentation
        if line_text.startswith(" ") or line_text.startswith("\t"):
            return True
            
        # Java / Node stack trace prefix checks
        if stripped.startswith("at ") or stripped.startswith("Caused by:") or stripped.startswith("... "):
            return True

        # Special Python Traceback logic:
        # Check if the error block started with Python Traceback header
        if parent_error_block:
            first_line = parent_error_block[0].lower()
            if "traceback (most" in first_line:
                # If we have only seen indented lines after the traceback start header,
                # then this non-indented line is the exception description (final traceback line).
                # We should accept it as part of the error block.
                # Let's count how many non-indented lines exist in parent_error_block (excluding the header).
                # If zero, then we accept this one as the final line.
                non_indented_count = 0
                for line in parent_error_block[1:]:
                    if not (line.startswith(" ") or line.startswith("\t")):
                        non_indented_count += 1
                if non_indented_count == 0:
                    return True

        return False
