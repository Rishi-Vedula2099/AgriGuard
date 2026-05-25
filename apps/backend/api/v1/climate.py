from fastapi import APIRouter

router = APIRouter()

@router.get("/forecast")
async def get_climate_forecast():
    return {
        "status": "success",
        "data": {
            "temperature": 28.5,
            "humidity": 65,
            "rainfall_prob": 0.15,
            "advisory": "Maintain current irrigation schedule. Low risk of rain."
        }
    }
