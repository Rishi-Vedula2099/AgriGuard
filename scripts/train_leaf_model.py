"""
AgriGuard — Leaf Disease Classification Model Training Script
Fine-tunes MobileNetV2 on PlantVillage dataset for rapid local training.

Usage:
    python scripts/train_leaf_model.py --data_dir storage/dataset/plantvillage --epochs 10
"""
import argparse
import os
import sys
import time

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torchvision import datasets, models, transforms
    from torch.utils.data import DataLoader
except ImportError:
    print("❌ PyTorch is required. Install with: pip install torch torchvision")
    sys.exit(1)


def train_model(model, dataloaders, criterion, optimizer, num_epochs, device, save_path):
    since = time.time()
    best_acc = 0.0

    for epoch in range(num_epochs):
        print(f"\nEpoch {epoch+1}/{num_epochs}")
        print("-" * 10)

        for phase in ['train', 'val']:
            if phase == 'train':
                model.train()
            else:
                model.eval()

            running_loss = 0.0
            running_corrects = 0

            # Iterate over data
            for inputs, labels in dataloaders[phase]:
                inputs = inputs.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()

                # Forward
                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    # Backward + optimize only if in training phase
                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                # Statistics
                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_loss = running_loss / len(dataloaders[phase].dataset)
            epoch_acc = running_corrects.double() / len(dataloaders[phase].dataset)

            print(f"{phase.capitalize()} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}")

            # Deep copy the model
            if phase == 'val' and epoch_acc > best_acc:
                best_acc = epoch_acc
                torch.save(model.state_dict(), save_path)
                print(f"⭐ Saved new best model to {save_path}")

    time_elapsed = time.time() - since
    print(f"\nTraining complete in {time_elapsed // 60:.0f}m {time_elapsed % 60:.0f}s")
    print(f"Best Val Acc: {best_acc:4f}")


def main():
    parser = argparse.ArgumentParser(description="Train leaf disease classifier")
    parser.add_argument("--data_dir", type=str, required=True, help="Path to PlantVillage dataset")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate")
    parser.add_argument("--output", type=str, default="storage/models/leaf_classifier.pt", help="Output model path")
    args = parser.parse_args()

    print(f"🌱 AgriGuard Leaf Classifier Training")
    
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"  Device: {device}")
    
    # 1. Setup Data Transformations
    data_transforms = {
        'train': transforms.Compose([
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
        'val': transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ]),
    }

    # 2. Load Datasets
    if not os.path.exists(os.path.join(args.data_dir, 'train')):
        print(f"⚠️ Warning: Dataset structure 'train' and 'val' not found at {args.data_dir}")
        print("  Proceeding with mock training for structural testing purposes.")
        # Create a mock dataset if real one isn't unpacked
        return mock_training(args.output)
        
    image_datasets = {
        x: datasets.ImageFolder(os.path.join(args.data_dir, x), data_transforms[x])
        for x in ['train', 'val']
    }
    dataloaders = {
        x: DataLoader(image_datasets[x], batch_size=args.batch_size, shuffle=(x=='train'), num_workers=4)
        for x in ['train', 'val']
    }
    
    class_names = image_datasets['train'].classes
    num_classes = len(class_names)
    print(f"  Classes detected: {num_classes}")

    # 3. Model Setup (MobileNetV2 for speed)
    model = models.mobilenet_v2(pretrained=True)
    
    # Freeze the base network (optional for faster fine-tuning)
    for param in model.parameters():
        param.requires_grad = False
        
    # Replace the classification head
    model.classifier[1] = nn.Linear(model.last_channel, num_classes)
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    # Optimize only the classifier parameters since we froze the base
    optimizer = optim.Adam(model.classifier.parameters(), lr=args.lr)

    # 4. Train
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    train_model(model, dataloaders, criterion, optimizer, args.epochs, device, args.output)

def mock_training(output_path):
    print("  Mock Training Execution: Generating dummy trained model dict to testing storage/models/")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    import torch; import torch.nn as nn; from torchvision import models
    model = models.mobilenet_v2(pretrained=False)
    model.classifier[1] = nn.Linear(model.last_channel, 38)
    torch.save(model.state_dict(), output_path)
    print(f"  ✅ Saved mock model weights to {output_path}")

if __name__ == "__main__":
    main()
