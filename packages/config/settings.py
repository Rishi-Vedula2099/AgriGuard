import os
from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "AgriGuard"
    APP_VERSION: str = "2.1.0"
    ENV: str = "local"
    
    # API Settings
    API_PREFIX: str = "/api"
    ALLOWED_ORIGINS: List[str] = ["*"]
    
    # Database
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379/0"
    QDRANT_URL: str = "http://localhost:6333"
    
    # External Services
    ML_SERVICE_URL: str
    AI_ASSISTANT_URL: str
    GOOGLE_API_KEY: Optional[str] = None
    
    # Storage
    STORAGE_DIR: str = "./storage"
    UPLOAD_DIR: str = "./storage/uploads"
    
    # Auth
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 1 week
    
    model_config = SettingsConfigDict(
        env_file=f".env.{os.getenv('ENV', 'local')}",
        env_file_encoding="utf-8",
        extra="ignore"
    )

@lru_cache()
def get_settings():
    return Settings()
