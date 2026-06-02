from fastapi import APIRouter, UploadFile, File, HTTPException
from classification.leaf_classifier import classifier
from .schemas import ClassificationResponse, DetectionResult

router = APIRouter(prefix="/v1", tags=["ML Intelligence"])

@router.post("/classify", response_model=ClassificationResponse)
async def classify_leaf(file: UploadFile = File(...)):
    """Classify crop disease with industrial schema support."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    raw_result = await classifier.predict(image_bytes)
    
    # Transform raw result to industrial schema
    disease_name = raw_result.get("disease_name", "Unknown")
    confidence = raw_result.get("confidence", 0.0)
    
    detections = [
        DetectionResult(
            label=disease_name,
            confidence=confidence
        )
    ]
    
    return ClassificationResponse(
        status="success",
        model_version=raw_result.get("model_version", "v1.0.0"),
        detections=detections,
        summary=f"Detected {disease_name} with {confidence:.1%} confidence.",
        disease_name=disease_name,
        crop=raw_result.get("crop", "Unknown"),
        is_healthy=raw_result.get("is_healthy", False),
        confidence=confidence,
        symptoms=raw_result.get("symptoms", []),
        causes=raw_result.get("causes", []),
        treatment=raw_result.get("treatment", []),
        severity=raw_result.get("severity", "medium"),
        analysis_mode=raw_result.get("analysis_mode", "unknown")
    )
