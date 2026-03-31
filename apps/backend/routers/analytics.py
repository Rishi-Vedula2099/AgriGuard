"""
Analytics Router — dashboard stats, disease trends, scan analytics
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])


@router.get("/dashboard")
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get dashboard summary stats."""
    stats = AnalyticsService.get_dashboard_stats(db, current_user.id)
    return stats


@router.get("/trends")
async def get_trends(
    days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get disease detection trends over time."""
    trends = AnalyticsService.get_disease_trends(db, current_user.id, days)
    return {"days": days, "trends": trends}


@router.get("/scans")
async def get_scan_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get comprehensive scan analytics."""
    analytics = AnalyticsService.get_scan_analytics(db, current_user.id)
    return analytics
