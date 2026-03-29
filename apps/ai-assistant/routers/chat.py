"""
Chat Router — AgroBuddy conversation endpoints
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone

from rag.chain import chat_chain

router = APIRouter(prefix="/api/v1", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    history: list[dict] | None = None


class ChatResponse(BaseModel):
    response: str
    session_id: str | None = None
    timestamp: str


# In-memory session store (for demo — backend DB handles persistence in production)
_sessions: dict[str, list[dict]] = {}


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message to AgroBuddy and get a response."""
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Get or create session history
    session_id = request.session_id or "default"
    if session_id not in _sessions:
        _sessions[session_id] = []

    history = request.history or _sessions.get(session_id, [])

    # Get response from chat chain
    response = await chat_chain.chat(
        message=request.message.strip(),
        history=history,
    )

    # Store in session
    timestamp = datetime.now(timezone.utc).isoformat()
    _sessions[session_id].append({"role": "user", "content": request.message, "timestamp": timestamp})
    _sessions[session_id].append({"role": "assistant", "content": response, "timestamp": timestamp})

    # Keep only last 50 messages per session
    if len(_sessions[session_id]) > 50:
        _sessions[session_id] = _sessions[session_id][-50:]

    return ChatResponse(
        response=response,
        session_id=session_id,
        timestamp=timestamp,
    )


@router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    """Get conversation history for a session."""
    history = _sessions.get(session_id, [])
    return {"session_id": session_id, "messages": history}


@router.delete("/chat/history/{session_id}")
async def clear_chat_history(session_id: str):
    """Clear conversation history for a session."""
    if session_id in _sessions:
        del _sessions[session_id]
    return {"message": "Chat history cleared"}


@router.get("/chat/suggestions")
async def get_suggestions():
    """Get quick prompt suggestions for AgroBuddy."""
    return {
        "suggestions": [
            {"text": "How to treat leaf blight?", "icon": "🦠"},
            {"text": "Best fertilizer for wheat?", "icon": "🧪"},
            {"text": "When to plant rice?", "icon": "🌾"},
            {"text": "How to improve soil health?", "icon": "🌍"},
            {"text": "Organic pest control methods", "icon": "🐛"},
            {"text": "Drip irrigation setup guide", "icon": "💧"},
            {"text": "Monsoon crop planning", "icon": "🌧️"},
            {"text": "How to increase tomato yield?", "icon": "🍅"},
        ]
    }
