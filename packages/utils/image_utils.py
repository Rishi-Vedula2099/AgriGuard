"""
Shared utility functions for AgriGuard services.
"""
import os
from PIL import Image
import io


def validate_image(image_bytes: bytes, max_size_mb: int = 10) -> bool:
    """Validate that the bytes represent a valid image within size limits."""
    if len(image_bytes) > max_size_mb * 1024 * 1024:
        return False
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
        return True
    except Exception:
        return False


def resize_image(image_bytes: bytes, max_dim: int = 1024) -> bytes:
    """Resize image to fit within max dimensions while maintaining aspect ratio."""
    img = Image.open(io.BytesIO(image_bytes))
    img.thumbnail((max_dim, max_dim), Image.LANCZOS)
    output = io.BytesIO()
    img.save(output, format=img.format or "JPEG", quality=90)
    return output.getvalue()


def ensure_dir(path: str) -> str:
    """Ensure directory exists, create if needed, return path."""
    os.makedirs(path, exist_ok=True)
    return path
