from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from database import get_db
from middleware.auth_middleware import get_current_user, require_role
from models.user import User, RoleEnum
from models.learning import Session as LearningSession, Crop, SessionLevel

router = APIRouter(prefix="/api/v1/sessions", tags=["Learn Sessions"])

# --- Schemas ---
class SessionCreate(BaseModel):
    crop_id: str
    title: str
    description: str
    level: SessionLevel
    price: float
    duration: int
    meeting_link: Optional[str] = None

class SessionResponse(BaseModel):
    id: str
    farmer_id: str
    crop_id: str
    title: str
    description: str
    level: SessionLevel
    price: float
    duration: int
    meeting_link: Optional[str] = None

    class Config:
        from_attributes = True

# --- Endpoints ---
@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    data: SessionCreate,
    user: User = Depends(require_role(RoleEnum.FARMER)),
    db: Session = Depends(get_db)
):
    """Create a new session (Farmers only)."""
    # Verify crop exists
    crop = db.query(Crop).filter(Crop.id == data.crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")

    new_session = LearningSession(
        farmer_id=user.id,
        crop_id=data.crop_id,
        title=data.title,
        description=data.description,
        level=data.level,
        price=data.price,
        duration=data.duration,
        meeting_link=data.meeting_link
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.get("", response_model=List[SessionResponse])
def list_sessions(
    crop_id: Optional[str] = None,
    level: Optional[SessionLevel] = None,
    db: Session = Depends(get_db)
):
    """List available sessions with optional filtering."""
    query = db.query(LearningSession)
    if crop_id:
        query = query.filter(LearningSession.crop_id == crop_id)
    if level:
        query = query.filter(LearningSession.level == level)
        
    return query.all()

@router.get("/{session_id}", response_model=SessionResponse)
def get_session(session_id: str, db: Session = Depends(get_db)):
    """Get details of a specific session."""
    session = db.query(LearningSession).filter(LearningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
