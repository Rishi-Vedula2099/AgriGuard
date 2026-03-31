"""
Auth Router — OTP-based login, JWT token management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from services.auth_service import AuthService
from middleware.auth_middleware import get_current_user
from models.user import User

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


# ─── Request/Response Schemas ───

class OTPRequest(BaseModel):
    phone: str

class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

class RefreshRequest(BaseModel):
    refresh_token: str

class UserUpdateRequest(BaseModel):
    name: str | None = None
    region: str | None = None
    state: str | None = None
    language: str | None = None


# ─── Routes ───

@router.post("/send-otp")
async def send_otp(request: OTPRequest):
    """Send OTP to the provided phone number."""
    if not request.phone or len(request.phone) < 10:
        raise HTTPException(status_code=400, detail="Invalid phone number")

    otp = AuthService.generate_otp(request.phone)
    return {
        "message": "OTP sent successfully",
        "phone": request.phone,
        "debug_otp": otp,  # Only in dev mode
    }


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    """Verify OTP and return JWT tokens."""
    if not AuthService.verify_otp(request.phone, request.otp):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP",
        )

    user = AuthService.get_or_create_user(db, request.phone)
    
    access_token = AuthService.create_access_token({"sub": user.id})
    refresh_token = AuthService.create_refresh_token({"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "phone": user.phone,
            "name": user.name,
            "region": user.region,
            "role": user.role,
        },
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshRequest, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    payload = AuthService.verify_token(request.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    access_token = AuthService.create_access_token({"sub": user.id})
    refresh_token = AuthService.create_refresh_token({"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "phone": user.phone,
            "name": user.name,
            "region": user.region,
            "role": user.role,
        },
    )


@router.get("/me")
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return {
        "id": current_user.id,
        "phone": current_user.phone,
        "name": current_user.name,
        "region": current_user.region,
        "state": current_user.state,
        "language": current_user.language,
        "role": current_user.role,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }


@router.put("/me")
async def update_profile(
    request: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user profile."""
    if request.name is not None:
        current_user.name = request.name
    if request.region is not None:
        current_user.region = request.region
    if request.state is not None:
        current_user.state = request.state
    if request.language is not None:
        current_user.language = request.language

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated",
        "user": {
            "id": current_user.id,
            "phone": current_user.phone,
            "name": current_user.name,
            "region": current_user.region,
            "state": current_user.state,
            "language": current_user.language,
        },
    }
