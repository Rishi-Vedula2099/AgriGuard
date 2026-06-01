"""
Auth Router — Email/Password + OTP login, JWT token management, RBAC role selection
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional
try:
    from utils.logger import StructuredLogger
    from database import get_db
    from services.auth_service import AuthService
    from middleware.auth_middleware import get_current_user
    from models.user import User, RoleEnum
    from middleware.rate_limit import auth_rate_limit
except ImportError:
    from apps.backend.utils.logger import StructuredLogger
    from apps.backend.database import get_db
    from apps.backend.services.auth_service import AuthService
    from apps.backend.middleware.auth_middleware import get_current_user
    from apps.backend.models.user import User, RoleEnum
    from apps.backend.middleware.rate_limit import auth_rate_limit

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
    dependencies=[Depends(auth_rate_limit)]
)


# ─── Request/Response Schemas ───

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str

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
    name: Optional[str] = None
    region: Optional[str] = None
    state: Optional[str] = None
    language: Optional[str] = None

class RoleSelectRequest(BaseModel):
    role: str  # "FARMER" or "STUDENT"


# ─── Helper ───

def _user_dict(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "phone": user.phone,
        "name": user.name,
        "region": user.region,
        "role": user.role.value if user.role else "FARMER",
        "role_selected": user.role_selected,
    }


# ─── Email / Password Routes ───

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(request: RegisterRequest, req: Request, db: Session = Depends(get_db)):
    """Register a new user with email and password."""
    client_ip = req.client.host if req.client else "unknown"
    if not request.email or "@" not in request.email:
        raise HTTPException(status_code=400, detail="Invalid email address")
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if not request.name or len(request.name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters")

    user = AuthService.register_user(db, request.email, request.password, request.name)
    if user is None:
        StructuredLogger.user_login("", request.email, "register_conflict", client_ip)
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    access_token = AuthService.create_access_token({"sub": user.id})
    refresh_token = AuthService.create_refresh_token({"sub": user.id})

    StructuredLogger.user_login(user.id, user.email, "registered", client_ip)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=_user_dict(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, req: Request, db: Session = Depends(get_db)):
    """Login with email and password."""
    client_ip = req.client.host if req.client else "unknown"
    user = AuthService.authenticate_user(db, request.email, request.password)
    if not user:
        StructuredLogger.user_login("", request.email, "failure", client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    access_token = AuthService.create_access_token({"sub": user.id})
    refresh_token = AuthService.create_refresh_token({"sub": user.id})

    StructuredLogger.user_login(user.id, user.email, "success", client_ip)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=_user_dict(user),
    )


@router.put("/role")
async def select_role(
    request: RoleSelectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Set the user's role (FARMER or STUDENT)."""
    try:
        role = RoleEnum(request.role.upper())
    except ValueError:
        raise HTTPException(status_code=400, detail="Role must be FARMER or STUDENT")

    user = AuthService.set_user_role(db, current_user, role)
    return {"message": "Role updated", "user": _user_dict(user)}


# ─── OTP Routes (legacy / phone-based) ───

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
        user=_user_dict(user),
    )


# ─── Token Refresh / Profile ───

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshRequest, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    payload = AuthService.verify_token(request.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    access_token = AuthService.create_access_token({"sub": user.id})
    refresh_token_new = AuthService.create_refresh_token({"sub": user.id})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_new,
        user=_user_dict(user),
    )


@router.get("/me")
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return _user_dict(current_user)


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
    return {"message": "Profile updated", "user": _user_dict(current_user)}
