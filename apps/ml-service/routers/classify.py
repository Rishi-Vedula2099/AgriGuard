"""
Classify Router — leaf disease classification endpoint
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from classification.leaf_classifier import classifier

router = APIRouter(prefix="/api/v1", tags=["Classification"])


@router.post("/classify")
async def classify_leaf(file: UploadFile = File(...)):
    """Classify crop disease from a leaf image."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    result = await classifier.predict(image_bytes)
    return result
