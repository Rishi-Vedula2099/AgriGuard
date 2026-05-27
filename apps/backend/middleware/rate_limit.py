import time
from fastapi import Request, HTTPException, status
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from typing import Dict, List

try:
    from utils.logger import StructuredLogger
    from utils.metrics import MetricsTracker
except ImportError:
    from apps.backend.utils.logger import StructuredLogger
    from apps.backend.utils.metrics import MetricsTracker

class InMemoryRateLimiter:
    """In-memory sliding window rate limiter."""
    def __init__(self, requests_limit: int, window_seconds: int):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        # Store identifier -> list of request timestamps
        self.history: Dict[str, List[float]] = defaultdict(list)

    def is_rate_limited(self, identifier: str) -> bool:
        now = time.time()
        window_start = now - self.window_seconds
        
        # Clean up older timestamps in the window
        self.history[identifier] = [t for t in self.history[identifier] if t > window_start]
        
        if len(self.history[identifier]) >= self.requests_limit:
            return True
            
        self.history[identifier].append(now)
        return False

# 1. Instantiate limiters for specific use cases
auth_limiter = InMemoryRateLimiter(requests_limit=5, window_seconds=60)
upload_limiter = InMemoryRateLimiter(requests_limit=5, window_seconds=60)
global_limiter = InMemoryRateLimiter(requests_limit=100, window_seconds=60)

# Helper to identify users dynamically based on Client IP & JWT access token
def _get_request_identifier(request: Request) -> str:
    client_ip = request.client.host if request.client else "unknown"
    # Inspect Authorization header if present
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        return f"{client_ip}:{token[-10:]}" # use last 10 characters of JWT as part of key
    return client_ip


# 2. Global Rate Limit Middleware (100 req/min)
class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow health checks and static files to pass without global limiting
        if request.url.path in ["/health", "/", "/metrics", "/docs", "/redoc"] or request.url.path.startswith("/uploads/"):
            return await call_next(request)
            
        identifier = _get_request_identifier(request)
        if global_limiter.is_rate_limited(identifier):
            StructuredLogger.rate_limit_exceeded(identifier, "100/min", request.url.path)
            MetricsTracker.track_rate_limit(request.url.path)
            return Response(
                content='{"detail": "Too many requests. Global rate limit (100/min) exceeded. Please try again later."}',
                status_code=429,
                media_type="application/json"
            )
            
        return await call_next(request)


# 3. Route-Specific Rate Limit Dependencies (Auth, Upload)
async def auth_rate_limit(request: Request):
    """Enforces 5 requests/min for login, register, and refresh endpoints."""
    identifier = _get_request_identifier(request)
    if auth_limiter.is_rate_limited(identifier):
        StructuredLogger.rate_limit_exceeded(identifier, "5/min (auth)", request.url.path)
        MetricsTracker.track_rate_limit(request.url.path)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Authentication rate limit (5/min) exceeded. Please try again later."
        )

async def upload_rate_limit(request: Request):
    """Enforces 5 requests/min for leaf and field scanning/uploads."""
    identifier = _get_request_identifier(request)
    if upload_limiter.is_rate_limited(identifier):
        StructuredLogger.rate_limit_exceeded(identifier, "5/min (upload)", request.url.path)
        MetricsTracker.track_rate_limit(request.url.path)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. File upload rate limit (5/min) exceeded. Please try again later."
        )
