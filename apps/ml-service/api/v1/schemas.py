from pydantic import BaseModel
from typing import List, Optional

class DetectionResult(BaseModel):
    label: str
    confidence: float
    bbox: Optional[List[float]] = None # [xmin, ymin, xmax, ymax]

class ClassificationResponse(BaseModel):
    status: str = "success"
    model_version: str = "v1.0.0"
    detections: List[DetectionResult]
    summary: str
    recommendation_id: Optional[str] = None
    
    # Advanced diagnostic details
    disease_name: Optional[str] = None
    crop: Optional[str] = None
    is_healthy: Optional[bool] = None
    confidence: Optional[float] = None
    symptoms: Optional[List[str]] = None
    causes: Optional[List[str]] = None
    treatment: Optional[List[str]] = None
    severity: Optional[str] = None
    analysis_mode: Optional[str] = None
