"""
Leaf Classifier — EfficientNet-B0 based crop disease classification
Uses demo mode when no trained model is available.
"""
import os
import random
import numpy as np
from PIL import Image
import io

from classification.disease_labels import DISEASE_LABELS, format_label, get_disease_details

# Try to import torch — fallback to demo mode if unavailable
try:
    import torch
    import torchvision.transforms as transforms
    import torchvision.models as models
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("⚠️ PyTorch not available — running in demo mode")


MODEL_PATH = os.environ.get("LEAF_MODEL_PATH", "../../storage/models/leaf_classifier.pt")


class LeafClassifier:
    """EfficientNet-B0 based leaf disease classifier."""

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
        """Load the trained model or set up demo mode."""
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        if os.path.exists(MODEL_PATH):
            try:
                # Load EfficientNet-B0 with custom classifier head
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
                print(f"⚠️ Error loading model: {e} — using demo mode")
                self.demo_mode = True
        else:
            print(f"⚠️ No model found at {MODEL_PATH} — using demo mode")
            self.demo_mode = True

    async def predict(self, image_bytes: bytes) -> dict:
        """Predict disease from leaf image bytes."""
        if self.demo_mode:
            return self._demo_predict()

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
            }
        except Exception as e:
            print(f"❌ Prediction error: {e}")
            return self._demo_predict()

    def _demo_predict(self) -> dict:
        """Generate a realistic demo prediction."""
        demo_diseases = [
            {
                "disease_name": "Tomato Late Blight",
                "crop": "Tomato",
                "is_healthy": False,
                "confidence": round(random.uniform(0.78, 0.95), 4),
                "symptoms": [
                    "Dark brown spots on leaves",
                    "White fuzzy growth on leaf underside",
                    "Leaves turning yellow and wilting",
                    "Dark lesions on stems",
                ],
                "causes": [
                    "Caused by Phytophthora infestans",
                    "Spreads rapidly in cool, wet conditions",
                    "Can survive in infected plant debris",
                ],
            },
            {
                "disease_name": "Rice Brown Spot",
                "crop": "Rice",
                "is_healthy": False,
                "confidence": round(random.uniform(0.72, 0.92), 4),
                "symptoms": [
                    "Brown oval spots on leaves",
                    "Gray centers with brown margins",
                    "Severe leaf drying in advanced stages",
                ],
                "causes": [
                    "Caused by Bipolaris oryzae fungus",
                    "Associated with nutrient-deficient soils",
                    "Spread through infected seeds",
                ],
            },
            {
                "disease_name": "Wheat Brown Rust",
                "crop": "Wheat",
                "is_healthy": False,
                "confidence": round(random.uniform(0.80, 0.94), 4),
                "symptoms": [
                    "Small round brown-orange pustules on leaves",
                    "Random distribution on leaf surface",
                    "Premature yellowing and drying of leaves",
                ],
                "causes": [
                    "Caused by Puccinia triticina fungus",
                    "Spread by wind-borne spores",
                    "Favored by moderate temperatures and moisture",
                ],
            },
            {
                "disease_name": "Healthy",
                "crop": "Tomato",
                "is_healthy": True,
                "confidence": round(random.uniform(0.90, 0.99), 4),
                "symptoms": [],
                "causes": [],
            },
        ]

        result = random.choice(demo_diseases)
        result["model_version"] = "demo_v1"
        return result


# Singleton instance
classifier = LeafClassifier()
