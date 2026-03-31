"""
Recommendation Service — generates treatment and prevention advice
"""


# Disease knowledge base — practical, farmer-friendly recommendations
DISEASE_DB = {
    "Tomato Late Blight": {
        "organic": [
            "Spray neem oil solution (5ml per liter of water) every 7 days",
            "Use copper-based organic fungicide (Bordeaux mixture)",
            "Remove and destroy infected plant parts immediately",
            "Improve air circulation between plants by proper spacing",
        ],
        "chemical": [
            "Apply Mancozeb 75% WP (2g per liter water) — spray every 10 days",
            "Metalaxyl + Mancozeb combination for severe cases",
            "⚠️ Always wear gloves and mask while spraying",
            "⚠️ Wait 7 days after spraying before harvesting",
        ],
        "prevention": [
            "Use disease-resistant tomato varieties",
            "Avoid overhead irrigation — use drip irrigation",
            "Maintain proper spacing (60cm between plants)",
            "Rotate crops — don't plant tomatoes in same spot for 2 years",
            "Remove plant debris after harvest",
        ],
        "spread_control": [
            "Isolate infected plants immediately",
            "Do not compost infected plant material — burn it",
            "Clean tools after working with infected plants",
            "Monitor nearby plants daily for symptoms",
        ],
    },
    "Tomato Early Blight": {
        "organic": [
            "Apply neem oil spray (3-5ml per liter water)",
            "Use baking soda spray (1 tablespoon per liter water)",
            "Mulch around plant base to prevent soil splash",
        ],
        "chemical": [
            "Chlorothalonil 75% WP (2g per liter water)",
            "⚠️ Wear protective equipment during application",
        ],
        "prevention": [
            "Stake tomato plants to improve air flow",
            "Water at base of plant, avoid wetting leaves",
            "Remove lower leaves touching the soil",
        ],
        "spread_control": [
            "Prune infected leaves immediately",
            "Avoid working with plants when wet",
        ],
    },
    "Leaf Blight": {
        "organic": [
            "Neem oil spray (5ml per liter water) weekly",
            "Trichoderma-based bio-fungicide application",
            "Remove infected leaves and destroy them",
        ],
        "chemical": [
            "Mancozeb 75% WP (2.5g per liter water)",
            "⚠️ Follow recommended dosage strictly",
        ],
        "prevention": [
            "Ensure proper drainage in the field",
            "Avoid overcrowding of plants",
            "Use certified disease-free seeds",
        ],
        "spread_control": [
            "Isolate affected area",
            "Reduce irrigation in infected zones",
        ],
    },
}

# Default recommendations for unknown diseases
DEFAULT_RECOMMENDATIONS = {
    "organic": [
        "Apply neem oil solution (5ml per liter water) as general fungicide",
        "Use Trichoderma viride bio-fungicide (5g per liter water)",
        "Remove visibly damaged or infected plant parts",
        "Improve drainage and air circulation",
    ],
    "chemical": [
        "Consult a local agricultural extension officer for specific treatment",
        "⚠️ Do not use chemicals without proper identification of disease",
    ],
    "prevention": [
        "Use disease-resistant varieties for your region",
        "Practice crop rotation every season",
        "Maintain proper spacing between plants",
        "Avoid waterlogging in fields",
        "Remove crop residue after harvest",
    ],
    "spread_control": [
        "Isolate infected plants from healthy ones",
        "Clean farming tools regularly",
        "Monitor surrounding plants for symptoms",
    ],
}


class RecommendationService:
    """Generates treatment and prevention recommendations based on disease and severity."""

    @staticmethod
    def get_recommendations(disease_name: str, severity: str = "medium", scan_type: str = "leaf") -> dict:
        """Get comprehensive recommendations for a detected disease."""
        db_entry = DISEASE_DB.get(disease_name, DEFAULT_RECOMMENDATIONS)

        recommendations = {
            "organic_solutions": db_entry.get("organic", DEFAULT_RECOMMENDATIONS["organic"]),
            "chemical_treatments": db_entry.get("chemical", DEFAULT_RECOMMENDATIONS["chemical"]),
            "preventive_measures": db_entry.get("prevention", DEFAULT_RECOMMENDATIONS["prevention"]),
            "spread_control": db_entry.get("spread_control", DEFAULT_RECOMMENDATIONS["spread_control"]),
        }

        # Add severity-specific advice
        if severity == "high":
            recommendations["urgency"] = "🚨 HIGH SEVERITY — Take immediate action"
            recommendations["additional_advice"] = [
                "Consider consulting an agriculture expert in your area",
                "Chemical treatment may be necessary for severe infection",
                "Monitor field daily for the next 2 weeks",
            ]
        elif severity == "medium":
            recommendations["urgency"] = "⚠️ MEDIUM SEVERITY — Act within 2-3 days"
            recommendations["additional_advice"] = [
                "Start with organic solutions first",
                "Use chemical treatment only if organic methods fail after 1 week",
            ]
        else:
            recommendations["urgency"] = "✅ LOW SEVERITY — Preventive action recommended"
            recommendations["additional_advice"] = [
                "Focus on preventive measures",
                "Regular monitoring will help catch issues early",
            ]

        # Add field-specific recommendations
        if scan_type == "field":
            recommendations["field_specific"] = [
                "Mark infected zones with stakes for targeted treatment",
                "Adjust irrigation to reduce water in infected areas",
                "Consider soil treatment in heavily infected zones",
                "Plan crop rotation for next season",
            ]

        # Add irrigation & fertilizer advice
        recommendations["irrigation_advice"] = [
            "Use drip irrigation instead of flood irrigation",
            "Water early morning to allow leaves to dry during day",
            "Reduce watering frequency during infection period",
        ]
        recommendations["fertilizer_advice"] = [
            "Reduce nitrogen fertilizer — excess nitrogen promotes disease",
            "Apply potassium-rich fertilizer to boost plant immunity",
            "Use organic compost for long-term soil health",
        ]

        return recommendations
