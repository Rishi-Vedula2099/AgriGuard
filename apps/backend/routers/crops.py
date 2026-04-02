from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from database import get_db
from models.learning import Crop

router = APIRouter(prefix="/api/v1/crops", tags=["Crops"])

# --- Schemas ---
class CropResponse(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True

# --- Endpoints ---
@router.get("", response_model=List[CropResponse])
def list_crops(db: Session = Depends(get_db)):
    """List all available crops for session creation and filtering."""
    crops = db.query(Crop).all()
    return crops
