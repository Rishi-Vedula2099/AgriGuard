"""
Field Segmenter — U-Net based field disease segmentation
Uses demo mode when no trained model is available.
"""
import os
import random
import numpy as np
from PIL import Image
import io

try:
    import torch
    import torch.nn as nn
    import torchvision.transforms as transforms
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

MODEL_PATH = os.environ.get("SEGMENT_MODEL_PATH", "../../storage/models/field_segmenter.pt")


class UNetBlock(nn.Module):
    """Double convolution block for U-Net."""
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.conv(x)


class UNet(nn.Module):
    """Simple U-Net for binary disease segmentation."""
    def __init__(self, in_channels=3, out_channels=1):
        super().__init__()
        # Encoder
        self.enc1 = UNetBlock(in_channels, 64)
        self.enc2 = UNetBlock(64, 128)
        self.enc3 = UNetBlock(128, 256)
        self.enc4 = UNetBlock(256, 512)
        
        self.pool = nn.MaxPool2d(2)
        
        # Bottleneck
        self.bottleneck = UNetBlock(512, 1024)
        
        # Decoder
        self.up4 = nn.ConvTranspose2d(1024, 512, 2, stride=2)
        self.dec4 = UNetBlock(1024, 512)
        self.up3 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.dec3 = UNetBlock(512, 256)
        self.up2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.dec2 = UNetBlock(256, 128)
        self.up1 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.dec1 = UNetBlock(128, 64)
        
        # Output
        self.out_conv = nn.Conv2d(64, out_channels, 1)

    def forward(self, x):
        # Encoder
        e1 = self.enc1(x)
        e2 = self.enc2(self.pool(e1))
        e3 = self.enc3(self.pool(e2))
        e4 = self.enc4(self.pool(e3))
        
        # Bottleneck
        b = self.bottleneck(self.pool(e4))
        
        # Decoder
        d4 = self.dec4(torch.cat([self.up4(b), e4], dim=1))
        d3 = self.dec3(torch.cat([self.up3(d4), e3], dim=1))
        d2 = self.dec2(torch.cat([self.up2(d3), e2], dim=1))
        d1 = self.dec1(torch.cat([self.up1(d2), e1], dim=1))
        
        return torch.sigmoid(self.out_conv(d1))


class FieldSegmenter:
    """U-Net based field disease segmentation with OpenCV post-processing."""

    def __init__(self):
        self.model = None
        self.transform = None
        self.device = None
        self.demo_mode = True

        if TORCH_AVAILABLE:
            self._setup_transforms()
            self._load_model()

    def _setup_transforms(self):
        self.transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ])

    def _load_model(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        if os.path.exists(MODEL_PATH):
            try:
                self.model = UNet(in_channels=3, out_channels=1)
                self.model.load_state_dict(torch.load(MODEL_PATH, map_location=self.device))
                self.model.to(self.device)
                self.model.eval()
                self.demo_mode = False
                print(f"✅ Field segmenter model loaded from {MODEL_PATH}")
            except Exception as e:
                print(f"⚠️ Error loading segmentation model: {e} — using demo mode")
        else:
            print(f"⚠️ No segmentation model found at {MODEL_PATH} — using demo mode")

    async def predict(self, image_bytes: bytes) -> dict:
        """Segment field image and analyze disease spread."""
        if self.demo_mode:
            return self._demo_predict(image_bytes)

        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            input_tensor = self.transform(image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                mask = self.model(input_tensor)

            mask_np = mask.squeeze().cpu().numpy()
            binary_mask = (mask_np > 0.5).astype(np.uint8)

            return self._analyze_mask(binary_mask, image_bytes)
        except Exception as e:
            print(f"❌ Segmentation error: {e}")
            return self._demo_predict(image_bytes)

    def _analyze_mask(self, binary_mask: np.ndarray, original_bytes: bytes) -> dict:
        """Analyze the segmentation mask to extract disease metrics."""
        total_pixels = binary_mask.size
        infected_pixels = np.sum(binary_mask)
        infected_pct = round((infected_pixels / total_pixels) * 100, 1)

        # Determine severity
        if infected_pct < 25:
            severity = "low"
        elif infected_pct < 60:
            severity = "medium"
        else:
            severity = "high"

        # Analyze spread pattern using OpenCV
        spread_pattern = "scattered"
        if CV2_AVAILABLE:
            contours, _ = cv2.findContours(
                binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            num_clusters = len(contours)
            if num_clusters <= 2:
                spread_pattern = "localized"
            elif num_clusters <= 5:
                spread_pattern = "clustered"
            else:
                spread_pattern = "widespread"

        # Risk assessment
        if severity == "high" and spread_pattern == "widespread":
            risk_level = "critical"
        elif severity == "high" or spread_pattern == "widespread":
            risk_level = "high"
        elif severity == "medium":
            risk_level = "moderate"
        else:
            risk_level = "low"

        return {
            "infected_area_pct": infected_pct,
            "severity": severity,
            "disease_name": "Leaf Blight",
            "spread_pattern": spread_pattern,
            "risk_level": risk_level,
            "num_infected_zones": num_clusters if CV2_AVAILABLE else 0,
            "heatmap_path": None,
            "insights": self._generate_insights(infected_pct, severity, spread_pattern, risk_level),
            "model_version": "unet_v1",
        }

    def _generate_insights(self, infected_pct, severity, spread_pattern, risk_level) -> list[str]:
        """Generate human-readable insights from segmentation analysis."""
        insights = []

        if severity == "low":
            insights.append(f"Only {infected_pct}% of the field shows signs of infection — caught early!")
        elif severity == "medium":
            insights.append(f"{infected_pct}% of the field is infected — action recommended within 2-3 days")
        else:
            insights.append(f"⚠️ {infected_pct}% of the field is severely infected — immediate action required")

        if spread_pattern == "localized":
            insights.append("Infection is concentrated in one area — isolate and treat the zone")
        elif spread_pattern == "clustered":
            insights.append("Multiple infected clusters detected — targeted treatment needed")
        else:
            insights.append("Infection is widespread across the field — full-field treatment necessary")

        if risk_level in ("high", "critical"):
            insights.append("High risk of further spread — monitor daily and act immediately")
        else:
            insights.append("Risk of spread is manageable with timely treatment")

        return insights

    def _demo_predict(self, image_bytes: bytes = None) -> dict:
        """Generate a realistic demo segmentation result."""
        infected_pct = round(random.uniform(5, 75), 1)

        if infected_pct < 25:
            severity = "low"
        elif infected_pct < 60:
            severity = "medium"
        else:
            severity = "high"

        spread_patterns = ["localized", "clustered", "widespread"]
        spread = random.choice(spread_patterns)

        if severity == "high" and spread == "widespread":
            risk = "critical"
        elif severity == "high" or spread == "widespread":
            risk = "high"
        elif severity == "medium":
            risk = "moderate"
        else:
            risk = "low"

        return {
            "infected_area_pct": infected_pct,
            "severity": severity,
            "disease_name": random.choice(["Leaf Blight", "Late Blight", "Brown Spot", "Rust"]),
            "spread_pattern": spread,
            "risk_level": risk,
            "num_infected_zones": random.randint(1, 8),
            "heatmap_path": None,
            "insights": self._generate_insights(infected_pct, severity, spread, risk),
            "model_version": "demo_v1",
        }


# Singleton instance
segmenter = FieldSegmenter()
