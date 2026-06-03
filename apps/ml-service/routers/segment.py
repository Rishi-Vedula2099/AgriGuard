"""
Segment Router — field disease segmentation endpoint
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from segmentation.field_segmenter import segmenter

router = APIRouter(prefix="/v1", tags=["Segmentation"])


@router.post("/segment")
async def segment_field(file: UploadFile = File(...)):
    """Analyze field image for disease segmentation."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    result = await segmenter.predict(image_bytes)
    return result
