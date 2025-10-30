import os
import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO


app = FastAPI(title="Skope API")

# Allow mobile access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Models", "best1.pt")

model = YOLO(model_path)
@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    contents = await file.read()
    img = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)

    results = model(img)
    detections = []
    for box in results[0].boxes:
        cls = int(box.cls[0])
        conf = float(box.conf[0])
        x1, y1, x2, y2 = map(float, box.xyxy[0])
        detections.append({
            "class": model.names[cls],
            "confidence": round(conf, 3),
            "bbox": [x1, y1, x2, y2]
        })

    return JSONResponse(content={"detections": detections})


@app.get("/")
def root():
    return {"message": "Skope is running"}
