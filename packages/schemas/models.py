"""
Shared Pydantic schemas for AgriGuard services.
"""
from pydantic import BaseModel
from datetime import datetime


class ScanRequest(BaseModel):
    scan_type: str  # "leaf" or "field"
    crop_type: str | None = None


class ScanResult(BaseModel):
    scan_id: str
    scan_type: str
    disease_name: str | None
    confidence: float | None
    severity: str | None
    infected_area_pct: float | None
    result_data: dict | None
    recommendations: dict | None
    crop_type: str | None
    created_at: str | None


class UserCreate(BaseModel):
    phone: str
    name: str | None = None
    region: str | None = "India"


class UserResponse(BaseModel):
    id: str
    phone: str
    name: str | None
    region: str | None
    role: str


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: str | None = None


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    history: list[ChatMessage] | None = None


class ChatResponse(BaseModel):
    response: str
    session_id: str | None
    timestamp: str
