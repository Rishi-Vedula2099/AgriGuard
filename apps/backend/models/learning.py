"""
AgriGuard Learn Models
"""
from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from enum import Enum
import uuid

from database import Base

class SessionLevel(str, Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"

class BookingStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"

class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    experience_years = Column(Integer)
    bio = Column(Text)

    user = relationship("User", backref="farmer_profile", uselist=False)

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    university = Column(String)

    user = relationship("User", backref="student_profile", uselist=False)

class Crop(Base):
    __tablename__ = "crops"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True)

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id = Column(String, ForeignKey("users.id"))
    crop_id = Column(String, ForeignKey("crops.id"))

    title = Column(String)
    description = Column(Text)
    level = Column(SQLAlchemyEnum(SessionLevel))
    price = Column(Float)
    duration = Column(Integer)  # minutes
    meeting_link = Column(String, nullable=True)

    farmer = relationship("User", backref="sessions")
    crop = relationship("Crop", backref="sessions")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("users.id"))
    session_id = Column(String, ForeignKey("sessions.id"))
    status = Column(SQLAlchemyEnum(BookingStatus), default=BookingStatus.PENDING)

    student = relationship("User", backref="bookings")
    session = relationship("Session", backref="bookings")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String, ForeignKey("bookings.id"))

    razorpay_order_id = Column(String, unique=True, nullable=True)
    razorpay_payment_id = Column(String, unique=True, nullable=True)

    total_amount = Column(Float)
    farmer_share = Column(Float)
    platform_share = Column(Float)
    
    booking = relationship("Booking", backref="payment", uselist=False)

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String, ForeignKey("bookings.id"))
    rating = Column(Integer)
    review = Column(Text)

    booking = relationship("Booking", backref="feedback", uselist=False)

class Notes(Base):
    __tablename__ = "notes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("users.id"))
    session_id = Column(String, ForeignKey("sessions.id"))
    content = Column(Text)

    student = relationship("User", backref="notes")
    session = relationship("Session", backref="notes")
