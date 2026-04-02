"""
User ORM Model
"""
from sqlalchemy import Column, String, Integer, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from enum import Enum
from sqlalchemy import Enum as SQLAlchemyEnum

from database import Base


class RoleEnum(str, Enum):
    STUDENT = "STUDENT"
    FARMER = "FARMER"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    phone = Column(String(15), unique=True, nullable=True, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=True)
    name = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True, default="India")
    state = Column(String(100), nullable=True)
    language = Column(String(20), nullable=True, default="en")
    role = Column(SQLAlchemyEnum(RoleEnum), nullable=False, default=RoleEnum.FARMER)
    role_selected = Column(Boolean, default=False)  # True once user has chosen their role
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"
