"""
Scan ORM Model — stores leaf and field scan results
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from database import Base


class Scan(Base):
    __tablename__ = "scans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    scan_type = Column(String(20), nullable=False)  # "leaf" or "field"
    image_path = Column(String(500), nullable=False)
    
    # Results
    disease_name = Column(String(200), nullable=True)
    confidence = Column(Float, nullable=True)
    severity = Column(String(20), nullable=True)  # "low", "medium", "high"
    infected_area_pct = Column(Float, nullable=True)  # For field scans
    
    # Detailed results stored as JSON
    result_data = Column(JSON, nullable=True)
    
    # Recommendations
    recommendations = Column(JSON, nullable=True)
    
    # Metadata
    crop_type = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="scans")

    def __repr__(self):
        return f"<Scan(id={self.id}, type={self.scan_type}, disease={self.disease_name})>"
