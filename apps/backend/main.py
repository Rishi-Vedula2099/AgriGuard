"""
AgriGuard Backend — Main FastAPI Application
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
import time
import os
try:
    from utils.metrics import MetricsTracker
except ImportError:
    from apps.backend.utils.metrics import MetricsTracker

try:
    from config import get_settings
    from database import create_tables
    from middleware.rate_limit import RateLimitMiddleware
    from middleware.security import SecurityHeadersMiddleware
    from routers.auth import router as auth_router
    from routers.scan import router as scan_router
    from routers.history import router as history_router
    from routers.analytics import router as analytics_router
    from routers.learn_sessions import router as learn_sessions_router
    from routers.learn_bookings import router as learn_bookings_router
    from routers.learn_payments import router as learn_payments_router
    from routers.learn_interactions import router as learn_interactions_router
    from routers.crops import router as crops_router
    from api import router as api_router
except ImportError:
    from apps.backend.config import get_settings
    from apps.backend.database import create_tables
    from apps.backend.middleware.rate_limit import RateLimitMiddleware
    from apps.backend.middleware.security import SecurityHeadersMiddleware
    from apps.backend.routers.auth import router as auth_router
    from apps.backend.routers.scan import router as scan_router
    from apps.backend.routers.history import router as history_router
    from apps.backend.routers.analytics import router as analytics_router
    from apps.backend.routers.learn_sessions import router as learn_sessions_router
    from apps.backend.routers.learn_bookings import router as learn_bookings_router
    from apps.backend.routers.learn_payments import router as learn_payments_router
    from apps.backend.routers.learn_interactions import router as learn_interactions_router
    from apps.backend.routers.crops import router as crops_router
    from apps.backend.api import router as api_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    print("[STARTUP] AgriGuard Backend starting...")
    try:
        create_tables()
        print(f"[OK] Database tables created/verified")
    except Exception as e:
        print(f"[ERROR] Could not create database tables: {e}")
        print("   The app will attempt to continue, but DB operations might fail.")
    
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    print(f"[INFO] Upload directory: {settings.UPLOAD_DIR}")
    print(f"[READY] AgriGuard Backend ready!")
    yield
    # Shutdown
    print("[SHUTDOWN] AgriGuard Backend shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered agricultural ecosystem for crop disease detection and management",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time
        
        # Exclude metrics endpoint and static assets
        if not request.url.path.startswith("/metrics") and not request.url.path.startswith("/uploads"):
            MetricsTracker.track_api_request(
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration_seconds=duration
            )
        return response

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(MetricsMiddleware)

# Static files for uploaded images
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Register routers
app.include_router(auth_router)
app.include_router(scan_router)
app.include_router(history_router)
app.include_router(analytics_router)
app.include_router(crops_router)

# Versioned API
app.include_router(api_router, prefix="/api")

# Legacy Routers (Deprecated)
app.include_router(learn_sessions_router, prefix="/legacy/learn", tags=["Legacy"])
app.include_router(learn_bookings_router, prefix="/legacy/learn", tags=["Legacy"])
app.include_router(learn_payments_router, prefix="/legacy/learn", tags=["Legacy"])
app.include_router(learn_interactions_router, prefix="/legacy/learn", tags=["Legacy"])

@app.get("/metrics", response_class=PlainTextResponse)
async def get_metrics():
    return MetricsTracker.get_prometheus_metrics()

@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy",
        "message": "🌱 AgriGuard API is running",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
