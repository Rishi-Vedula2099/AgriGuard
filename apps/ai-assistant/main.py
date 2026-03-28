"""
AgriGuard AI Assistant — AgroBuddy Service
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.chat import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🤖 AgroBuddy AI Assistant starting...")
    print("🚀 AgroBuddy ready!")
    yield
    print("👋 AgroBuddy shutting down...")


app = FastAPI(
    title="AgriGuard AgroBuddy",
    version="1.0.0",
    description="AI-powered agricultural chatbot assistant",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)


@app.get("/")
async def root():
    return {
        "name": "AgriGuard AgroBuddy",
        "version": "1.0.0",
        "status": "healthy",
        "message": "🤖 AgroBuddy AI Assistant is running",
    }
