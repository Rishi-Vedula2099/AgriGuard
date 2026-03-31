"""
Scan Router — leaf and field scan endpoints
"""
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from services.scan_service import ScanService

router = APIRouter(prefix="/api/v1/scan", tags=["Scan"])


@router.post("/leaf")
async def scan_leaf(
    file: UploadFile = File(...),
    crop_type: str | None = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a leaf image for disease detection."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    scan = await ScanService.perform_leaf_scan(db, current_user.id, file, crop_type)

    return {
        "scan_id": scan.id,
        "scan_type": scan.scan_type,
        "disease_name": scan.disease_name,
        "confidence": scan.confidence,
        "result_data": scan.result_data,
        "recommendations": scan.recommendations,
        "crop_type": scan.crop_type,
        "created_at": scan.created_at.isoformat() if scan.created_at else None,
    }


@router.post("/field")
async def scan_field(
    file: UploadFile = File(...),
    crop_type: str | None = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a field image for segmentation analysis."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    scan = await ScanService.perform_field_scan(db, current_user.id, file, crop_type)

    return {
        "scan_id": scan.id,
        "scan_type": scan.scan_type,
        "disease_name": scan.disease_name,
        "severity": scan.severity,
        "infected_area_pct": scan.infected_area_pct,
        "result_data": scan.result_data,
        "recommendations": scan.recommendations,
        "crop_type": scan.crop_type,
        "created_at": scan.created_at.isoformat() if scan.created_at else None,
    }


@router.get("/{scan_id}")
async def get_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific scan result by ID."""
    from models.scan import Scan

    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    return {
        "scan_id": scan.id,
        "scan_type": scan.scan_type,
        "disease_name": scan.disease_name,
        "confidence": scan.confidence,
        "severity": scan.severity,
        "infected_area_pct": scan.infected_area_pct,
        "result_data": scan.result_data,
        "recommendations": scan.recommendations,
        "crop_type": scan.crop_type,
        "image_path": scan.image_path,
        "created_at": scan.created_at.isoformat() if scan.created_at else None,
    }
