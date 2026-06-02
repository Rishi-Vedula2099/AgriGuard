import json
import logging
from typing import Any, Optional
try:
    from config import get_settings
except ImportError:
    from apps.backend.config import get_settings

settings = get_settings()
logger = logging.getLogger("uvicorn.error")

# Try to import redis
try:
    import redis
    # Parse connection details from REDIS_URL
    # REDIS_URL format: redis://[:password]@host:port/db
    _client = redis.from_url(settings.REDIS_URL, socket_timeout=2.0, decode_responses=True)
    _client.ping()
    REDIS_AVAILABLE = True
    print("[CACHE] Redis connection established.")
except Exception as e:
    logger.warning(f"[CACHE] Redis not available: {e} — falling back to DB/computation.")
    _client = None
    REDIS_AVAILABLE = False


class RedisCacheService:
    """Cache-aside helper with automatic graceful fallback on Redis outage."""
    
    @staticmethod
    def get(key: str) -> Optional[Any]:
        """Retrieve key value from cache."""
        if not REDIS_AVAILABLE or _client is None:
            return None
        try:
            val = _client.get(key)
            if val:
                return json.loads(val)
        except Exception as e:
            logger.warning(f"[CACHE] Redis get failed: {e}")
        return None

    @staticmethod
    def set(key: str, value: Any, expire_seconds: int = 300) -> bool:
        """Store value in cache with expiration."""
        if not REDIS_AVAILABLE or _client is None:
            return False
        try:
            _client.set(key, json.dumps(value), ex=expire_seconds)
            return True
        except Exception as e:
            logger.warning(f"[CACHE] Redis set failed: {e}")
        return False

    @staticmethod
    def delete(key: str) -> bool:
        """Delete key from cache."""
        if not REDIS_AVAILABLE or _client is None:
            return False
        try:
            _client.delete(key)
            return True
        except Exception as e:
            logger.warning(f"[CACHE] Redis delete failed: {e}")
        return False

    @staticmethod
    def delete_pattern(pattern: str) -> bool:
        """Delete all keys matching pattern."""
        if not REDIS_AVAILABLE or _client is None:
            return False
        try:
            keys = _client.keys(pattern)
            if keys:
                _client.delete(*keys)
            return True
        except Exception as e:
            logger.warning(f"[CACHE] Redis delete pattern failed: {e}")
        return False

    # Cache-Aside helpers for scan history
    @staticmethod
    def get_history_cache(user_id: str, page: int, limit: int, scan_type: str | None) -> Optional[dict]:
        key = f"user:{user_id}:history:page:{page}:limit:{limit}:type:{scan_type or 'all'}"
        return RedisCacheService.get(key)

    @staticmethod
    def set_history_cache(user_id: str, page: int, limit: int, scan_type: str | None, data: dict):
        key = f"user:{user_id}:history:page:{page}:limit:{limit}:type:{scan_type or 'all'}"
        # Cache history for 2 minutes (120 seconds)
        RedisCacheService.set(key, data, expire_seconds=120)

    @staticmethod
    def invalidate_history_cache(user_id: str):
        """Invalidates all scan history cache for the user."""
        pattern = f"user:{user_id}:history:*"
        RedisCacheService.delete_pattern(pattern)
