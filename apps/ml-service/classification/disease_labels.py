"""
Disease label mapping for PlantVillage dataset (38 classes)
"""

DISEASE_LABELS = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot_Gray_leaf_spot",
    "Corn_(maize)___Common_rust",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper_bell___Bacterial_spot",
    "Pepper_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Rice___Brown_spot",
    "Rice___Leaf_blast",
    "Rice___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
    "Wheat___Brown_rust",
    "Wheat___Yellow_rust",
    "Wheat___healthy",
]


def format_label(raw_label: str) -> dict:
    """Convert raw label to structured disease info."""
    parts = raw_label.split("___")
    crop = parts[0].replace("_", " ").replace("(", "").replace(")", "").strip()
    disease = parts[1].replace("_", " ").strip() if len(parts) > 1 else "Unknown"
    is_healthy = disease.lower() == "healthy"

    return {
        "crop": crop,
        "disease_name": "Healthy" if is_healthy else disease,
        "is_healthy": is_healthy,
        "full_label": raw_label,
    }


# Disease symptom and cause descriptions
DISEASE_INFO = {
    "Tomato Late blight": {
        "symptoms": [
            "Dark brown to black spots on leaves",
            "White fuzzy growth on underside of leaves in humid conditions",
            "Leaves turn yellow, then brown, and wilt",
            "Dark lesions on stems",
        ],
        "causes": [
            "Caused by Phytophthora infestans (water mold)",
            "Thrives in cool (15-22°C), wet weather",
            "Spreads through wind-blown spores",
            "Can survive in infected plant debris and tubers",
        ],
    },
    "Tomato Early blight": {
        "symptoms": [
            "Dark concentric rings on lower leaves (target-like pattern)",
            "Yellowing around the spots",
            "Lower leaves affected first, progresses upward",
        ],
        "causes": [
            "Caused by Alternaria solani fungus",
            "Favored by warm, humid weather",
            "Survives in soil and plant debris",
        ],
    },
    "Tomato Bacterial spot": {
        "symptoms": [
            "Small, dark, water-soaked spots on leaves",
            "Spots may have yellow halos",
            "Raised scabby spots on fruits",
        ],
        "causes": [
            "Caused by Xanthomonas bacteria",
            "Spread by rain splash and contaminated tools",
            "Enters through natural openings or wounds",
        ],
    },
    "Rice Brown spot": {
        "symptoms": [
            "Brown oval spots on leaves",
            "Spots have gray centers with brown margins",
            "Severe cases cause leaf drying",
        ],
        "causes": [
            "Caused by Bipolaris oryzae fungus",
            "Associated with nutrient-deficient soils",
            "Spread through infected seeds",
        ],
    },
    "Rice Leaf blast": {
        "symptoms": [
            "Diamond-shaped lesions on leaves",
            "Gray-green or white centers with brown borders",
            "Leaves may completely wither in severe cases",
        ],
        "causes": [
            "Caused by Magnaporthe oryzae fungus",
            "Favored by high nitrogen and humid conditions",
            "Spores spread by wind",
        ],
    },
    "Potato Late blight": {
        "symptoms": [
            "Dark, water-soaked spots on leaf edges",
            "White mold on leaf undersides",
            "Brown rot of tubers",
        ],
        "causes": [
            "Caused by Phytophthora infestans",
            "Same pathogen as tomato late blight",
            "Spreads rapidly in cool, wet weather",
        ],
    },
    "Wheat Brown rust": {
        "symptoms": [
            "Small, round, brown-orange pustules on leaves",
            "Random distribution on leaf surface",
            "Leaves may yellow and dry prematurely",
        ],
        "causes": [
            "Caused by Puccinia triticina fungus",
            "Spread by wind-borne spores",
            "Favored by moderate temperatures and moisture",
        ],
    },
}


def get_disease_details(disease_name: str) -> dict:
    """Get symptom and cause information for a disease."""
    info = DISEASE_INFO.get(disease_name, {})
    return {
        "symptoms": info.get("symptoms", [
            "Visible discoloration or spots on leaves",
            "Possible wilting or leaf curling",
            "Check closely for fungal growth or lesions",
        ]),
        "causes": info.get("causes", [
            "May be caused by fungal, bacterial, or viral pathogens",
            "Environmental stress may contribute",
            "Consult a local agricultural expert for confirmation",
        ]),
    }
