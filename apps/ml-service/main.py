"""
AgriGuard ML Service — Main FastAPI Application for ML inference
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.classify import router as classify_router
from routers.segment import router as segment_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup."""
    print("🧠 AgriGuard ML Service starting...")
    # Models are lazy-loaded on first request
    print("🚀 ML Service ready!")
    yield
    print("👋 ML Service shutting down...")


app = FastAPI(
    title="AgriGuard ML Service",
    version="1.0.0",
    description="Machine learning inference service for crop disease detection",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(classify_router)
app.include_router(segment_router)


@app.get("/")
async def root():
    return {
        "name": "AgriGuard ML Service",
        "version": "1.0.0",
        "status": "healthy",
        "message": "🧠 ML inference service is running",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
