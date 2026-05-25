from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
async def get_irrigation_status():
    return {
        "status": "success",
        "data": {
            "soil_moisture": 42,
            "required_water": "2.5 Liters/sqm",
            "next_cycle": "Tomorrow 06:00 AM",
            "efficiency": 0.88
        }
    }
