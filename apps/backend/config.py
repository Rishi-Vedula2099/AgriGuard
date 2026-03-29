"""
AgriGuard Backend Configuration
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AgriGuard API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./storage/agriguard.db"

    # JWT
    JWT_SECRET_KEY: str = "agriguard-dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # OTP
    OTP_MOCK_MODE: bool = True
    OTP_EXPIRY_MINUTES: int = 5

    # Service URLs
    ML_SERVICE_URL: str = "http://localhost:8001"
    AI_ASSISTANT_URL: str = "http://localhost:8002"

    # Storage
    UPLOAD_DIR: str = "./storage/uploads"
    MODEL_DIR: str = "./storage/models"

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    class Config:
        env_file = "../../.env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
