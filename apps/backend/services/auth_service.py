"""
Authentication Service — JWT tokens + OTP (mock mode)
"""
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from sqlalchemy.orm import Session
import random
import string

from config import get_settings
from models.user import User

settings = get_settings()

# In-memory OTP store (for dev/mock mode)
_otp_store: dict[str, dict] = {}


class AuthService:
    """Handles OTP generation/verification and JWT token management."""

    @staticmethod
    def generate_otp(phone: str) -> str:
        """Generate a 6-digit OTP for the given phone number."""
        otp = "".join(random.choices(string.digits, k=6))

        # In mock mode, use a fixed OTP for easy testing
        if settings.OTP_MOCK_MODE:
            otp = "123456"

        _otp_store[phone] = {
            "otp": otp,
            "expires_at": datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRY_MINUTES),
        }

        # In production, send OTP via SMS provider here
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

    @staticmethod
    def create_access_token(data: dict) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire, "type": "access"})
        return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    @staticmethod
    def create_refresh_token(data: dict) -> str:
        """Create a JWT refresh token."""
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    @staticmethod
    def verify_token(token: str) -> dict | None:
        """Verify and decode a JWT token."""
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            return payload
        except JWTError:
            return None
