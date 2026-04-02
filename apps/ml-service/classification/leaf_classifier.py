"""
Leaf Classifier — EfficientNet-B0 based crop disease classification
Falls back to Gemini Vision for real-time AI analysis when no trained model is available.
"""
import os
import base64
import json
import numpy as np
from PIL import Image
import io

from classification.disease_labels import DISEASE_LABELS, format_label, get_disease_details

# Try to import torch — fallback to Gemini if unavailable
try:
    import torch
    import torchvision.transforms as transforms
    import torchvision.models as models
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("⚠️ PyTorch not available — will use Gemini Vision")

# Try to import Gemini
try:
    import google.generativeai as genai
    GEMINI_API_KEY = os.environ.get("GOOGLE_API_KEY", "")
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        GEMINI_AVAILABLE = True
        print(f"✅ Gemini Vision available for real-time crop analysis")
    else:
        GEMINI_AVAILABLE = False
        print("⚠️ GOOGLE_API_KEY not set — Gemini Vision unavailable")
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠️ google-generativeai not installed — Gemini Vision unavailable")


MODEL_PATH = os.environ.get("LEAF_MODEL_PATH", "../../storage/models/leaf_classifier.pt")

GEMINI_CROP_PROMPT = """You are an expert agricultural plant pathologist with deep knowledge of crop diseases.

Analyze this plant/leaf/field image and provide a detailed disease diagnosis.

Respond ONLY with a valid JSON object in exactly this format (no markdown, no explanation):
{
  "disease_name": "exact disease name (e.g. 'Tomato Late Blight', 'Rice Brown Spot', 'Healthy') — be specific",
  "crop": "crop/plant type detected (e.g. 'Tomato', 'Rice', 'Wheat', 'Corn', 'Unknown')",
  "is_healthy": true or false,
  "confidence": 0.XX (a float between 0.0 and 1.0 representing your confidence),
  "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "causes": ["cause 1", "cause 2"],
  "treatment": ["treatment recommendation 1", "treatment recommendation 2"],
  "severity": "none" or "low" or "medium" or "high"
}

Be accurate — analyze the actual colors, patterns, spots, lesions, and textures you see.
If this is not a plant image, set crop to "Unknown" and disease_name to "Not a plant image".
If the plant appears healthy, set is_healthy to true and disease_name to "Healthy".
"""


class LeafClassifier:
    """EfficientNet-B0 based leaf disease classifier with Gemini Vision fallback."""

    def __init__(self):
        self.model = None
        self.transform = None
        self.device = None
        self.demo_mode = True

        if TORCH_AVAILABLE:
            self._setup_transforms()
            self._load_model()

    def _setup_transforms(self):
        """Set up image preprocessing transforms."""
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ])

    def _load_model(self):
        """Load the trained model or set up Gemini/demo mode."""
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        if os.path.exists(MODEL_PATH):
            try:
                self.model = models.efficientnet_b0(weights=None)
                num_classes = len(DISEASE_LABELS)
                self.model.classifier[1] = torch.nn.Linear(
                    self.model.classifier[1].in_features, num_classes
                )
                self.model.load_state_dict(torch.load(MODEL_PATH, map_location=self.device))
                self.model.to(self.device)
                self.model.eval()
                self.demo_mode = False
                print(f"✅ Leaf classifier model loaded from {MODEL_PATH}")
            except Exception as e:
                print(f"⚠️ Error loading model: {e} — using Gemini Vision")
                self.demo_mode = True
        else:
            print(f"⚠️ No trained model at {MODEL_PATH} — using Gemini Vision for real-time analysis")
            self.demo_mode = True

    async def predict(self, image_bytes: bytes) -> dict:
        """Predict disease from leaf image bytes."""
        # Priority: trained model > Gemini Vision > demo fallback
        if not self.demo_mode and self.model is not None:
            return await self._torch_predict(image_bytes)

        if GEMINI_AVAILABLE:
            return await self._gemini_predict(image_bytes)

        return self._static_demo_predict()

    async def _torch_predict(self, image_bytes: bytes) -> dict:
        """Run inference using the trained PyTorch model."""
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            input_tensor = self.transform(image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                outputs = self.model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                confidence, predicted = torch.max(probabilities, 1)

            label_idx = predicted.item()
            conf = confidence.item()

            raw_label = DISEASE_LABELS[label_idx]
            label_info = format_label(raw_label)
            disease_details = get_disease_details(label_info["disease_name"])

            return {
                "disease_name": label_info["disease_name"],
                "crop": label_info["crop"],
                "is_healthy": label_info["is_healthy"],
                "confidence": round(conf, 4),
                "symptoms": disease_details["symptoms"],
                "causes": disease_details["causes"],
                "model_version": "efficientnet_b0_v1",
                "analysis_mode": "trained_model",
            }
        except Exception as e:
            print(f"❌ PyTorch prediction error: {e} — falling back to Gemini")
            if GEMINI_AVAILABLE:
                return await self._gemini_predict(image_bytes)
            return self._static_demo_predict()

    async def _gemini_predict(self, image_bytes: bytes) -> dict:
        """Use Gemini Vision API to analyze the actual crop image in real-time."""
        try:
            model_name = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
            gemini_model = genai.GenerativeModel(model_name)

            # Prepare the image for Gemini
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            # Resize if too large to save API bandwidth
            max_size = 1024
            if max(image.size) > max_size:
                image.thumbnail((max_size, max_size), Image.LANCZOS)

            img_buffer = io.BytesIO()
            image.save(img_buffer, format="JPEG", quality=85)
            img_bytes = img_buffer.getvalue()

            # Call Gemini Vision
            response = gemini_model.generate_content([
                GEMINI_CROP_PROMPT,
                {"mime_type": "image/jpeg", "data": img_bytes}
            ])

            text = response.text.strip()
            # Strip markdown code fences if present
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            text = text.strip()

            result = json.loads(text)

            # Normalize and validate the response
            return {
                "disease_name": result.get("disease_name", "Unknown"),
                "crop": result.get("crop", "Unknown"),
                "is_healthy": result.get("is_healthy", False),
                "confidence": float(result.get("confidence", 0.85)),
                "symptoms": result.get("symptoms", []),
                "causes": result.get("causes", []),
                "treatment": result.get("treatment", []),
                "severity": result.get("severity", "medium"),
                "model_version": f"gemini-vision-{model_name}",
                "analysis_mode": "gemini_vision",
            }

        except json.JSONDecodeError as e:
            print(f"⚠️ Gemini returned invalid JSON: {e}")
            return self._static_demo_predict()
        except Exception as e:
            print(f"❌ Gemini Vision error: {e}")
            return self._static_demo_predict()

    def _static_demo_predict(self) -> dict:
        """Last-resort static fallback — clearly marked as demo."""
        return {
            "disease_name": "Analysis Unavailable",
            "crop": "Unknown",
            "is_healthy": False,
            "confidence": 0.0,
            "symptoms": ["Unable to analyze image at this time"],
            "causes": ["AI service temporarily unavailable"],
            "treatment": ["Please try again or consult a local agronomist"],
            "severity": "unknown",
            "model_version": "fallback_v1",
            "analysis_mode": "demo_fallback",
        }


# Singleton instance
classifier = LeafClassifier()
