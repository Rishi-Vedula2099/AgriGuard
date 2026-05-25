from fastapi import APIRouter
from .crop_intelligence import router as crop_intel_router
from .climate import router as climate_router
from .irrigation import router as irrigation_router

router = APIRouter()

router.include_router(crop_intel_router, prefix="/crop-intelligence", tags=["Crop Intelligence"])
router.include_router(climate_router, prefix="/climate", tags=["Climate"])
router.include_router(irrigation_router, prefix="/irrigation", tags=["Irrigation"])
