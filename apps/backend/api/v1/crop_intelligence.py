from fastapi import APIRouter

router = APIRouter()

@router.get("/recommendations")
async def get_crop_recommendations():
    return {
        "status": "success",
        "data": [
            {"crop": "Tomato", "suitability": 0.95, "reason": "Optimal soil pH and humidity"},
            {"crop": "Potato", "suitability": 0.82, "reason": "Cooler temperatures expected next month"}
        ]
    }
