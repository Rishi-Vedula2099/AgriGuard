"""
AgriGuard Backend Configuration
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AgriGuard API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@127.0.0.1:5433/agriguard"
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET_KEY: str = "agriguard-dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
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
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    # Payment Gateway
    RAZORPAY_KEY_ID: str = "rzp_test_placeholder"
    RAZORPAY_KEY_SECRET: str = "rzp_test_secret_placeholder"

    # Weather API
    OPENWEATHER_API_KEY: str = "your_openweather_api_key"

    # SMS Service (Twilio)
    TWILIO_ACCOUNT_SID: str | None = None
    TWILIO_AUTH_TOKEN: str | None = None
    TWILIO_PHONE_NUMBER: str | None = None

    class Config:
        env_file = "../../.env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
