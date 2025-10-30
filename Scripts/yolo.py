from roboflow import Roboflow
from ultralytics import YOLO


model = YOLO('yolov8n.pt')  # Start with pretrained YOLOv8 nano (fastest)

# Train the model
results = model.train(
    data='D:/Work/Skope/Skope-2/data.yaml',  # Path to your data.yaml file
    epochs=50,  # You can adjust this (50-150 is typical)
    imgsz=416,   # Image size
    batch=16,    # Adjust based on your GPU memory (8, 16, or 32)
    patience=50, # Early stopping if no improvement
    device='cpu'     # Use GPU (0), or 'cpu' if no GPU
)

# After training, your weights will be in:
# runs/detect/train/weights/best.pt
# runs/detect/train/weights/last.pt

print("Training complete! Weights saved to runs/detect/train/weights/")