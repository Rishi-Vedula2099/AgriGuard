# TODO: Deprecated after v2.1 migration. Legacy learning modules.
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import razorpay

from database import get_db
from middleware.auth_middleware import get_current_user, require_role
from models.user import User, RoleEnum
from models.learning import Booking, BookingStatus, Payment, Session as LearningSession
from config import get_settings

settings = get_settings()

router = APIRouter(prefix="/api/v1/payments", tags=["Learn Payments"])

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

def calculate_split(amount: float):
    # Retrieve config from DB in production
    farmer_percentage = 0.25
    platform_percentage = 0.75
    farmer_share = amount * farmer_percentage
    platform_share = amount * platform_percentage
    return farmer_share, platform_share

# --- Schemas ---
class CreateOrderRequest(BaseModel):
    booking_id: str

class VerifyPaymentRequest(BaseModel):
    booking_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

# --- Endpoints ---
@router.post("/create-order")
def create_order(
    data: CreateOrderRequest,
    user: User = Depends(require_role(RoleEnum.STUDENT)),
    db: Session = Depends(get_db)
):
    """Create a Razorpay order from a pending booking."""
    booking = db.query(Booking).filter(Booking.id == data.booking_id, Booking.student_id == user.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status != BookingStatus.PENDING:
        raise HTTPException(status_code=400, detail="Booking is not in correct status to be ordered")

    session = booking.session
    if not session:
        raise HTTPException(status_code=400, detail="Session invalid")

    try:
        order = client.order.create({
            "amount": int(session.price * 100), # Amount in paise
            "currency": "INR",
            "payment_capture": 1
        })
        
        # Stash order mapping onto the DB (optionally as pending payment table)
        # We'll just return order data and verify down the line in MVP.
        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")


@router.post("/verify")
def verify_payment(
    data: VerifyPaymentRequest,
    user: User = Depends(require_role(RoleEnum.STUDENT)),
    db: Session = Depends(get_db)
):
    """Verify Razorpay signature and settle the split payment."""
    booking = db.query(Booking).filter(Booking.id == data.booking_id, Booking.student_id == user.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    try:
        client.utility.verify_payment_signature({
            'razorpay_order_id': data.razorpay_order_id,
            'razorpay_payment_id': data.razorpay_payment_id,
            'razorpay_signature': data.razorpay_signature
        })
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid Razorpay Signature")
    
    # Confirm the booking
    booking.status = BookingStatus.CONFIRMED

    # Create Payment split details
    session = booking.session
    f_share, p_share = calculate_split(session.price)
    
    new_payment = Payment(
        booking_id=booking.id,
        razorpay_order_id=data.razorpay_order_id,
        razorpay_payment_id=data.razorpay_payment_id,
        total_amount=session.price,
        farmer_share=f_share,
        platform_share=p_share
    )
    db.add(new_payment)
    db.commit()

    return {"message": "Payment verified and booking confirmed"}
