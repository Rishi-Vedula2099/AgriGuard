import sys
import os

# Add the apps/backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from database import SessionLocal, create_tables
import models # This will import everything from models/__init__.py
from models.learning import Crop
import uuid

def seed_crops():
    db = SessionLocal()
    try:
        # Initial crops to seed
        crops_to_seed = [
            "Wheat",
            "Rice",
            "Cotton",
            "Tomato",
            "Corn",
            "Sugarcane",
            "Potato",
            "Soybean",
            "Jute",
            "Tea",
            "Coffee"
        ]

        # Get existing crops
        existing_crops = {c.name for c in db.query(Crop).all()}

        # Seed only new crops
        for crop_name in crops_to_seed:
            if crop_name not in existing_crops:
                new_crop = Crop(id=str(uuid.uuid4()), name=crop_name)
                db.add(new_crop)
                print(f"🌱 Seeding crop: {crop_name}")

        db.commit()
        print("✅ Database seeding completed!")
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Ensure tables are created first
    create_tables()
    seed_crops()
