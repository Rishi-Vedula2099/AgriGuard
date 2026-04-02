"""
AgriGuard — Dataset Download & Preparation Script
Downloads agricultural datasets for model training.

Datasets:
1. PlantVillage (leaf disease classification) — 38 classes, 54,306 images
2. PlantDoc (alternative) — real-world conditions
3. Rice Diseases (from Kaggle)

Usage:
    python scripts/download_datasets.py --dataset plantvillage --output storage/dataset/
"""
import os
import sys
import argparse
import urllib.request
import zipfile
import shutil


DATASETS = {
    "plantvillage": {
        "name": "PlantVillage Dataset",
        "description": "54,306 images of 38 disease classes across 14 crop species",
        "url": "https://data.mendeley.com/datasets/tywbtsjrjv/1",
        "kaggle": "emmarex/plantdisease",
        "classes": 38,
        "images": 54306,
        "size_gb": 2.3,
        "format": "ImageFolder (class_name/images)",
        "crops": ["Apple", "Blueberry", "Cherry", "Corn", "Grape", "Orange", 
                  "Peach", "Pepper", "Potato", "Raspberry", "Rice", "Soybean",
                  "Squash", "Strawberry", "Tomato", "Wheat"],
    },
    "plantdoc": {
        "name": "PlantDoc Dataset",
        "description": "2,598 real-world plant disease images from internet",
        "url": "https://github.com/pratikkayal/PlantDoc-Dataset",
        "classes": 27,
        "images": 2598,
        "size_gb": 0.3,
        "format": "ImageFolder",
    },
    "rice_diseases": {
        "name": "Rice Disease Dataset",
        "description": "Rice leaf disease detection (Brown Spot, Blast, Bacterial Leaf Blight)",
        "kaggle": "vbookshelf/rice-leaf-diseases",
        "classes": 4,
        "images": 5932,
        "size_gb": 0.1,
    },
    "indian_crops": {
        "name": "Indian Plant Disease Dataset",
        "description": "Disease images from Indian farming conditions",
        "kaggle": "rashikrahmanpritom/plant-disease-recognition-dataset",
        "classes": 38,
        "images": 87000,
        "size_gb": 3.5,
    },
}


def print_dataset_info():
    """Print information about available datasets."""
    print("\n📊 Available Agricultural Datasets for AgriGuard\n")
    print("=" * 70)
    for key, ds in DATASETS.items():
        print(f"\n  📁 {ds['name']} ({key})")
        print(f"     {ds['description']}")
        print(f"     Classes: {ds['classes']} | Images: {ds['images']:,} | Size: {ds['size_gb']} GB")
        if "kaggle" in ds:
            print(f"     Kaggle: kaggle datasets download -d {ds['kaggle']}")
        if "url" in ds:
            print(f"     URL: {ds['url']}")
    print("\n" + "=" * 70)


def setup_kaggle():
    """Check Kaggle API setup."""
    try:
        import kaggle
        print("✅ Kaggle API configured")
        return True
    except ImportError:
        print("⚠️ kaggle package not installed. Install with: pip install kaggle")
        return False
    except Exception as e:
        print(f"⚠️ Kaggle API not configured: {e}")
        print("  1. Go to kaggle.com → Account → API → Create New Token")
        print("  2. Place kaggle.json in ~/.kaggle/ (Linux/Mac) or C:/Users/<you>/.kaggle/ (Windows)")
        return False


def download_kaggle_dataset(dataset_id: str, output_dir: str):
    """Download dataset from Kaggle."""
    try:
        import kaggle
        print(f"📥 Downloading {dataset_id} from Kaggle...")
        os.makedirs(output_dir, exist_ok=True)
        kaggle.api.dataset_download_files(dataset_id, path=output_dir, unzip=True)
        print(f"✅ Downloaded to {output_dir}")
        return True
    except Exception as e:
        print(f"❌ Download failed: {e}")
        return False


def create_dataset_structure(output_dir: str):
    """Create the expected dataset directory structure."""
    dirs = [
        os.path.join(output_dir, "plantvillage"),
        os.path.join(output_dir, "plantvillage", "train"),
        os.path.join(output_dir, "plantvillage", "val"),
        os.path.join(output_dir, "plantvillage", "test"),
        os.path.join(output_dir, "field_segmentation"),
        os.path.join(output_dir, "field_segmentation", "images"),
        os.path.join(output_dir, "field_segmentation", "masks"),
        os.path.join(output_dir, "rice_diseases"),
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)
    print(f"✅ Dataset directory structure created at {output_dir}")


def main():
    parser = argparse.ArgumentParser(description="AgriGuard Dataset Manager")
    parser.add_argument("--dataset", type=str, choices=list(DATASETS.keys()) + ["all", "info"],
                        default="info", help="Dataset to download")
    parser.add_argument("--output", type=str, default="storage/dataset/",
                        help="Output directory")
    args = parser.parse_args()

    if args.dataset == "info":
        print_dataset_info()
        print("\n📋 Manual Download Instructions:")
        print("  1. Install: pip install kaggle")
        print("  2. Configure: Place kaggle.json in user .kaggle directory")
        print("  3. Run: python scripts/download_datasets.py --dataset plantvillage")
        print("\n  Or download manually from URLs above and place in storage/dataset/")
        return

    # Create structure
    create_dataset_structure(args.output)

    if args.dataset == "all":
        has_kaggle = setup_kaggle()
        for key, ds in DATASETS.items():
            if has_kaggle and "kaggle" in ds:
                download_kaggle_dataset(ds["kaggle"], os.path.join(args.output, key))
    else:
        ds = DATASETS[args.dataset]
        if "kaggle" in ds:
            if setup_kaggle():
                download_kaggle_dataset(ds["kaggle"], os.path.join(args.output, args.dataset))
            else:
                print(f"\n📥 Manual download: kaggle datasets download -d {ds['kaggle']}")
        elif "url" in ds:
            print(f"📥 Please manually download from: {ds['url']}")
            print(f"   and extract to: {os.path.join(args.output, args.dataset)}")


if __name__ == "__main__":
    main()
