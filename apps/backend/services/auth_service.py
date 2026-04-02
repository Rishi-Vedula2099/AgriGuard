"""
Authentication Service — JWT tokens + OTP (mock mode) + Email/Password
"""
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from sqlalchemy.orm import Session
import random
import string
import hashlib
import hmac

from config import get_settings
from models.user import User, RoleEnum

settings = get_settings()

# In-memory OTP store (for dev/mock mode)
_otp_store: dict[str, dict] = {}


def _hash_password(password: str) -> str:
    """Hash password using SHA-256 (simple, no extra deps needed)."""
    return hashlib.sha256(password.encode()).hexdigest()


def _verify_password(plain: str, hashed: str) -> bool:
    return hmac.compare_digest(hashlib.sha256(plain.encode()).hexdigest(), hashed)


class AuthService:
    """Handles OTP generation/verification, JWT token management, and email/password auth."""

    # ── OTP ──────────────────────────────────────────────────────────

    @staticmethod
    def generate_otp(phone: str) -> str:
        """Generate a 6-digit OTP for the given phone number."""
        otp = "".join(random.choices(string.digits, k=6))

        if settings.OTP_MOCK_MODE:
            otp = "123456"

        _otp_store[phone] = {
            "otp": otp,
            "expires_at": datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRY_MINUTES),
        }
        print(f"[OTP] Phone: {phone}, OTP: {otp}")
        return otp

    @staticmethod
    def verify_otp(phone: str, otp: str) -> bool:
        """Verify the OTP for the given phone number."""
        if phone not in _otp_store:
            return False
        stored = _otp_store[phone]
        if datetime.now(timezone.utc) > stored["expires_at"]:
            del _otp_store[phone]
            return False
        if stored["otp"] != otp:
            return False
        del _otp_store[phone]
        return True

    @staticmethod
    def get_or_create_user(db: Session, phone: str) -> User:
        """Get existing user or create new user by phone number."""
        user = db.query(User).filter(User.phone == phone).first()
        if not user:
            user = User(phone=phone, name=f"Farmer-{phone[-4:]}")
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    # ── Email/Password ────────────────────────────────────────────────

    @staticmethod
    def register_user(db: Session, email: str, password: str, name: str) -> User:
        """Create a new user with email and password."""
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            return None  # Caller handles conflict
        user = User(
            email=email.lower().strip(),
            password_hash=_hash_password(password),
            name=name,
            role=RoleEnum.FARMER,  # default; will be updated on role select
            role_selected=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User | None:
        """Verify email & password, return user or None."""
        user = db.query(User).filter(User.email == email.lower().strip()).first()
        if not user or not user.password_hash:
            return None
        if not _verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    def set_user_role(db: Session, user: User, role: RoleEnum) -> User:
        """Update a user's role and mark role as selected."""
        user.role = role
        user.role_selected = True
        db.commit()
        db.refresh(user)
        return user

    # ── JWT ──────────────────────────────────────────────────────────

    @staticmethod
    def create_access_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire, "type": "access"})
        return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    @staticmethod
    def create_refresh_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    @staticmethod
    def verify_token(token: str) -> dict | None:
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            return payload
        except JWTError:
            return None
