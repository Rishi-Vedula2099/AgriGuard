"""
AgriGuard Backend — Main FastAPI Application
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from config import get_settings
from database import create_tables
from routers.auth import router as auth_router
from routers.scan import router as scan_router
from routers.history import router as history_router
from routers.analytics import router as analytics_router
from routers.learn_sessions import router as learn_sessions_router
from routers.learn_bookings import router as learn_bookings_router
from routers.learn_payments import router as learn_payments_router
from routers.learn_interactions import router as learn_interactions_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    print("🌱 AgriGuard Backend starting...")
    create_tables()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    print(f"✅ Database tables created")
    print(f"✅ Upload directory: {settings.UPLOAD_DIR}")
    print(f"🚀 AgriGuard Backend ready!")
    yield
    # Shutdown
    print("👋 AgriGuard Backend shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered agricultural ecosystem for crop disease detection and management",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploaded images
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Register routers
app.include_router(auth_router)
app.include_router(scan_router)
app.include_router(history_router)
app.include_router(analytics_router)
app.include_router(learn_sessions_router)
app.include_router(learn_bookings_router)
app.include_router(learn_payments_router)
app.include_router(learn_interactions_router)

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
