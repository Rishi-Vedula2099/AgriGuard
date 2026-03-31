"""
History Router — scan history timeline
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from models.scan import Scan

router = APIRouter(prefix="/api/v1/history", tags=["History"])


@router.get("/")
async def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    scan_type: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get paginated scan history for the current user."""
    query = db.query(Scan).filter(Scan.user_id == current_user.id)

    if scan_type:
        query = query.filter(Scan.scan_type == scan_type)

    total = query.count()
    scans = (
        query.order_by(Scan.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "scans": [
            {
                "id": scan.id,
                "scan_type": scan.scan_type,
                "disease_name": scan.disease_name,
                "confidence": scan.confidence,
                "severity": scan.severity,
                "infected_area_pct": scan.infected_area_pct,
                "crop_type": scan.crop_type,
                "created_at": scan.created_at.isoformat() if scan.created_at else None,
            }
            for scan in scans
        ],
    }


@router.delete("/{scan_id}")
async def delete_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a scan from history."""
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    db.delete(scan)
    db.commit()
    return {"message": "Scan deleted successfully"}
