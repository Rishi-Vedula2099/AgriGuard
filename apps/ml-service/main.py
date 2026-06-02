"""
AgriGuard ML Service — Main FastAPI Application
"""
import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure apps/ml-service is in path for module resolution
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from api.v1.classify import router as classify_v1_router
from routers.classify import router as classify_legacy_router
from routers.segment import router as segment_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup."""
    print("🧠 AgriGuard ML Service starting...")
    print("🚀 ML Service ready!")
    yield
    print("👋 ML Service shutting down...")

app = FastAPI(
    title="AgriGuard ML Service",
    version="2.1.0",
    description="Industrial ML inference service for agricultural intelligence",
    lifespan=lifespan,
)

# Configure secure CORS origins
allowed_origins_str = os.environ.get(
    "ALLOWED_ORIGINS", 
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000"
)
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Versioned API (New)
app.include_router(classify_v1_router, prefix="/api")
app.include_router(segment_router, prefix="/api")

# Legacy Routers
app.include_router(classify_legacy_router, prefix="/legacy")

@app.get("/")
async def root():
    return {
        "name": "AgriGuard ML Service",
        "version": "2.1.0",
        "status": "healthy",
        "message": "🧠 ML Intelligence service is running",
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
