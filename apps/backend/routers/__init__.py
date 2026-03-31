from routers.auth import router as auth_router
from routers.scan import router as scan_router
from routers.history import router as history_router
from routers.analytics import router as analytics_router

__all__ = ["auth_router", "scan_router", "history_router", "analytics_router"]
