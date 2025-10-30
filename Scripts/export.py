from ultralytics import YOLO
model = YOLO(r"D:\Skope\Models\best1.pt")
model.export(format="onnx")

