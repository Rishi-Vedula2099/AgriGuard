from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from database import get_db
from middleware.auth_middleware import get_current_user, require_role
from models.user import User, RoleEnum
from models.learning import Booking, Feedback, Notes, BookingStatus

router = APIRouter(prefix="/api/v1/interactions", tags=["Learn Interactions"])


# --- Schemas ---
class FeedbackCreate(BaseModel):
    booking_id: str
    rating: int
    review: str

class FeedbackResponse(BaseModel):
    id: str
    booking_id: str
    rating: int
    review: str

    class Config:
        from_attributes = True

class NoteCreate(BaseModel):
    session_id: str
    content: str

class NoteResponse(BaseModel):
    id: str
    session_id: str
    content: str

    class Config:
        from_attributes = True


# --- Endpoints ---
@router.post("/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    data: FeedbackCreate,
    user: User = Depends(require_role(RoleEnum.STUDENT)),
    db: Session = Depends(get_db)
):
    """Submit feedback for a confirmed session booking."""
    booking = db.query(Booking).filter(
        Booking.id == data.booking_id,
        Booking.student_id == user.id,
        Booking.status == BookingStatus.CONFIRMED
    ).first()

    if not booking:
        raise HTTPException(status_code=400, detail="Valid confirmed booking not found for this user")

    existing_feedback = db.query(Feedback).filter(Feedback.booking_id == booking.id).first()
    if existing_feedback:
        raise HTTPException(status_code=400, detail="Feedback already submitted for this booking")

    if not (1 <= data.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    new_feedback = Feedback(
        booking_id=booking.id,
        rating=data.rating,
        review=data.review
    )
    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)
    return new_feedback

@router.get("/feedback/{session_id}", response_model=List[FeedbackResponse])
def get_session_feedback(session_id: str, db: Session = Depends(get_db)):
    """Get all feedback submitted for a particular session."""
    feedbacks = db.query(Feedback).join(Booking).filter(Booking.session_id == session_id).all()
    return feedbacks

@router.post("/notes", response_model=NoteResponse)
def save_notes(
    data: NoteCreate,
    user: User = Depends(require_role(RoleEnum.STUDENT)),
    db: Session = Depends(get_db)
):
    """Create or update notes for a specific session."""
    existing_note = db.query(Notes).filter(
        Notes.student_id == user.id,
        Notes.session_id == data.session_id
    ).first()

    if existing_note:
        # Update existing
        existing_note.content = data.content
        db.commit()
        db.refresh(existing_note)
        return existing_note
    
    # Create new
    new_note = Notes(
        student_id=user.id,
        session_id=data.session_id,
        content=data.content
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note

@router.get("/notes/{session_id}", response_model=NoteResponse)
def get_session_notes(
    session_id: str,
    user: User = Depends(require_role(RoleEnum.STUDENT)),
    db: Session = Depends(get_db)
):
    """Retrieve saved notes for a specific session by the authenticated student."""
    note = db.query(Notes).filter(
        Notes.student_id == user.id,
        Notes.session_id == session_id
    ).first()

    if not note:
        raise HTTPException(status_code=404, detail="No notes found for this session")
    return note
