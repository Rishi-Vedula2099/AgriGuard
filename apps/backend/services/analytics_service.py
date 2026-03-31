"""
Analytics Service — aggregates scan data for insights
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from collections import Counter

from models.scan import Scan


class AnalyticsService:
    """Provides analytics and insights from scan history."""

    @staticmethod
    def get_dashboard_stats(db: Session, user_id: str) -> dict:
        """Get summary stats for the user dashboard."""
        total_scans = db.query(Scan).filter(Scan.user_id == user_id).count()
        
        recent_scans = (
            db.query(Scan)
            .filter(Scan.user_id == user_id)
            .order_by(Scan.created_at.desc())
            .limit(10)
            .all()
        )

        # Calculate health score (0-100)
        if recent_scans:
            avg_confidence = sum(s.confidence or 0 for s in recent_scans) / len(recent_scans)
            high_severity_count = sum(1 for s in recent_scans if s.severity == "high")
            health_score = max(10, int(100 - (high_severity_count * 20) - ((1 - avg_confidence) * 30)))
        else:
            health_score = 85  # Default for new users

        # Disease distribution
        diseases = [s.disease_name for s in recent_scans if s.disease_name]
        disease_counts = dict(Counter(diseases))

        # Threat level
        if any(s.severity == "high" for s in recent_scans[:3]):
            threat_level = "high"
        elif any(s.severity == "medium" for s in recent_scans[:3]):
            threat_level = "medium"
        else:
            threat_level = "low"

        return {
            "total_scans": total_scans,
            "health_score": health_score,
            "threat_level": threat_level,
            "disease_distribution": disease_counts,
            "recent_scan_count": len(recent_scans),
        }

    @staticmethod
    def get_disease_trends(db: Session, user_id: str, days: int = 30) -> list[dict]:
        """Get disease detection trends over time."""
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        scans = (
            db.query(Scan)
            .filter(Scan.user_id == user_id, Scan.created_at >= cutoff)
            .order_by(Scan.created_at.asc())
            .all()
        )

        trends = []
        for scan in scans:
            trends.append({
                "date": scan.created_at.isoformat() if scan.created_at else None,
                "disease": scan.disease_name,
                "severity": scan.severity,
                "confidence": scan.confidence,
                "scan_type": scan.scan_type,
            })

        return trends

    @staticmethod
    def get_scan_analytics(db: Session, user_id: str) -> dict:
        """Get comprehensive scan analytics."""
        all_scans = db.query(Scan).filter(Scan.user_id == user_id).all()

        if not all_scans:
            return {
                "total_scans": 0,
                "leaf_scans": 0,
                "field_scans": 0,
                "most_common_disease": None,
                "average_confidence": 0,
                "severity_breakdown": {"low": 0, "medium": 0, "high": 0},
            }

        leaf_scans = [s for s in all_scans if s.scan_type == "leaf"]
        field_scans = [s for s in all_scans if s.scan_type == "field"]
        
        diseases = [s.disease_name for s in all_scans if s.disease_name]
        most_common = Counter(diseases).most_common(1)

        severities = [s.severity for s in all_scans if s.severity]
        severity_breakdown = dict(Counter(severities))

        confidences = [s.confidence for s in all_scans if s.confidence]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0

        return {
            "total_scans": len(all_scans),
            "leaf_scans": len(leaf_scans),
            "field_scans": len(field_scans),
            "most_common_disease": most_common[0][0] if most_common else None,
            "average_confidence": round(avg_confidence, 2),
            "severity_breakdown": {
                "low": severity_breakdown.get("low", 0),
                "medium": severity_breakdown.get("medium", 0),
                "high": severity_breakdown.get("high", 0),
            },
        }
