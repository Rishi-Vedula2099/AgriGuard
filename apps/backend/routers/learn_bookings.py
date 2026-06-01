# TODO: Deprecated after v2.1 migration. Legacy learning modules.
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from database import get_db
from middleware.auth_middleware import get_current_user, require_role
from models.user import User, RoleEnum
from models.learning import Booking, BookingStatus, Session as LearningSession

router = APIRouter(prefix="/api/v1/bookings", tags=["Learn Bookings"])

# --- Schemas ---
class BookingCreate(BaseModel):
    session_id: str

from .learn_sessions import SessionResponse

class BookingResponse(BaseModel):
    id: str
    student_id: str
    session_id: str
    status: BookingStatus
    session: SessionResponse
    
    class Config:
        from_attributes = True

# --- Endpoints ---
@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    data: BookingCreate,
    user: User = Depends(require_role(RoleEnum.STUDENT)),
    db: Session = Depends(get_db)
):
    """Book a session (Students only). Creates a pending booking."""
    session_obj = db.query(LearningSession).filter(LearningSession.id == data.session_id).first()
    if not session_obj:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Check if a booking already exists for this user and session
    existing_booking = db.query(Booking).filter(
        Booking.student_id == user.id,
        Booking.session_id == data.session_id,
        Booking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED])
    ).first()
    
    if existing_booking:
        raise HTTPException(status_code=400, detail="Already booked or pending payment")

    new_booking = Booking(
        student_id=user.id,
        session_id=data.session_id,
        status=BookingStatus.PENDING
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return new_booking

@router.get("/my", response_model=List[BookingResponse])
def get_my_bookings(
    user: User = Depends(require_role(RoleEnum.STUDENT)),
    db: Session = Depends(get_db)
):
    """Retrieve all bookings for the currently authenticated student."""
    bookings = db.query(Booking).filter(Booking.student_id == user.id).all()
    return bookings
