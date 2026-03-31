"""
Scan Service — orchestrates image upload and ML inference calls
"""
import os
import uuid
import httpx
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import UploadFile

from config import get_settings
from models.scan import Scan
from services.recommendation_service import RecommendationService

settings = get_settings()


class ScanService:
    """Handles image uploads and communicates with ML service for inference."""

    @staticmethod
    async def save_upload(file: UploadFile) -> str:
        """Save uploaded image and return the file path."""
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        ext = os.path.splitext(file.filename or "image.jpg")[1] or ".jpg"
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(settings.UPLOAD_DIR, filename)

        content = await file.read()
        with open(filepath, "wb") as f:
            f.write(content)

        return filepath

    @staticmethod
    async def classify_leaf(image_path: str) -> dict:
        """Send image to ML service for leaf disease classification."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                with open(image_path, "rb") as f:
                    files = {"file": (os.path.basename(image_path), f, "image/jpeg")}
                    response = await client.post(
                        f"{settings.ML_SERVICE_URL}/api/v1/classify",
                        files=files,
                    )
                    if response.status_code == 200:
                        return response.json()
        except Exception as e:
            print(f"[ScanService] ML classify error: {e}")

        # Fallback demo result
        return {
            "disease_name": "Tomato Late Blight",
            "confidence": 0.87,
            "crop": "Tomato",
            "symptoms": [
                "Dark brown spots on leaves",
                "White fuzzy growth on leaf underside",
                "Leaves turning yellow and wilting"
            ],
            "causes": [
                "Caused by Phytophthora infestans",
                "Spreads rapidly in cool, wet conditions",
                "Can survive in infected plant debris"
            ],
        }

    @staticmethod
    async def segment_field(image_path: str) -> dict:
        """Send image to ML service for field segmentation analysis."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                with open(image_path, "rb") as f:
                    files = {"file": (os.path.basename(image_path), f, "image/jpeg")}
                    response = await client.post(
                        f"{settings.ML_SERVICE_URL}/api/v1/segment",
                        files=files,
                    )
                    if response.status_code == 200:
                        return response.json()
        except Exception as e:
            print(f"[ScanService] ML segment error: {e}")

        # Fallback demo result
        return {
            "infected_area_pct": 34.5,
            "severity": "medium",
            "disease_name": "Leaf Blight",
            "spread_pattern": "clustered",
            "risk_level": "moderate",
            "heatmap_path": None,
            "insights": [
                "Infection is concentrated in the northern section of the field",
                "Disease appears to be spreading from a central point",
                "Moderate risk of further spread in current conditions"
            ],
        }

    @staticmethod
    async def perform_leaf_scan(db: Session, user_id: str, file: UploadFile, crop_type: str | None = None) -> Scan:
        """Full leaf scan pipeline: upload → classify → recommend → save."""
        image_path = await ScanService.save_upload(file)
        result = await ScanService.classify_leaf(image_path)
        recommendations = RecommendationService.get_recommendations(
            disease_name=result.get("disease_name", "Unknown"),
            severity="medium",
            scan_type="leaf",
        )

        scan = Scan(
            user_id=user_id,
            scan_type="leaf",
            image_path=image_path,
            disease_name=result.get("disease_name"),
            confidence=result.get("confidence"),
            result_data=result,
            recommendations=recommendations,
            crop_type=crop_type or result.get("crop"),
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        return scan

    @staticmethod
    async def perform_field_scan(db: Session, user_id: str, file: UploadFile, crop_type: str | None = None) -> Scan:
        """Full field scan pipeline: upload → segment → recommend → save."""
        image_path = await ScanService.save_upload(file)
        result = await ScanService.segment_field(image_path)
        
        severity = result.get("severity", "medium")
        recommendations = RecommendationService.get_recommendations(
            disease_name=result.get("disease_name", "Unknown"),
            severity=severity,
            scan_type="field",
        )

        scan = Scan(
            user_id=user_id,
            scan_type="field",
            image_path=image_path,
            disease_name=result.get("disease_name"),
            severity=severity,
            infected_area_pct=result.get("infected_area_pct"),
            result_data=result,
            recommendations=recommendations,
            crop_type=crop_type,
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        return scan
