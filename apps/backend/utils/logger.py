import logging
import json
import time
import sys
from typing import Any, Dict

# Create standard python logger
_logger = logging.getLogger("agriguard_structured")
_logger.setLevel(logging.INFO)

# Structured JSON formatter
class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%SZ"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        
        # Include extra dictionary variables
        if hasattr(record, "structured_data"):
            log_data.update(record.structured_data)
            
        return json.dumps(log_data)

# Console handler configured with JSON formatter
_handler = logging.StreamHandler(sys.stdout)
_handler.setFormatter(JSONFormatter())
_logger.addHandler(_handler)

class StructuredLogger:
    """Helper to emit structured JSON logs for AgriGuard event monitoring."""
    
    @staticmethod
    def log(level: int, msg: str, structured_data: Dict[str, Any] = None):
        extra = {"structured_data": structured_data or {}}
        _logger.log(level, msg, extra=extra)

    @staticmethod
    def info(msg: str, **kwargs):
        StructuredLogger.log(logging.INFO, msg, kwargs)

    @staticmethod
    def warning(msg: str, **kwargs):
        StructuredLogger.log(logging.WARNING, msg, kwargs)

    @staticmethod
    def error(msg: str, **kwargs):
        StructuredLogger.log(logging.ERROR, msg, kwargs)

    # Pre-defined events for AgriGuard logs
    @staticmethod
    def user_login(user_id: str, email: str, status: str, ip: str):
        StructuredLogger.info(
            f"User login attempt: {email} ({status})",
            event="user_login",
            user_id=user_id,
            email=email,
            status=status,
            client_ip=ip
        )

    @staticmethod
    def scan_completed(user_id: str, scan_id: str, scan_type: str, disease: str, confidence: float, latency_ms: float):
        StructuredLogger.info(
            f"Scan completed: {scan_id} ({scan_type})",
            event="scan_completed",
            user_id=user_id,
            scan_id=scan_id,
            scan_type=scan_type,
            disease=disease,
            confidence=confidence,
            latency_ms=latency_ms,
            status="success"
        )

    @staticmethod
    def scan_failed(user_id: str, scan_type: str, reason: str, latency_ms: float):
        StructuredLogger.error(
            f"Scan failed: {reason}",
            event="scan_failed",
            user_id=user_id,
            scan_type=scan_type,
            reason=reason,
            latency_ms=latency_ms,
            status="failure"
        )

    @staticmethod
    def ml_timeout(service: str, endpoint: str, elapsed: float):
        StructuredLogger.warning(
            f"ML service timeout on {endpoint}",
            event="ml_timeout",
            service=service,
            endpoint=endpoint,
            elapsed_seconds=elapsed
        )

    @staticmethod
    def rate_limit_exceeded(identifier: str, limit: str, path: str):
        StructuredLogger.warning(
            f"Rate limit exceeded for {identifier} on {path}",
            event="rate_limit_exceeded",
            identifier=identifier,
            limit=limit,
            path=path
        )
