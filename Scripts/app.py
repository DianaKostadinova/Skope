from ultralytics import YOLO
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import os

app = FastAPI()

# Load the model once at startup
model = YOLO("best.pt")


@app.get("/")
def home():
    return {"message": "Hello from FastAPI!"}


@app.get("/detect")
def detect():

    img_path = r"Images\1000021453.jpg"
    if not os.path.exists(img_path):
        return JSONResponse({"error": "Image not found"}, status_code=404)

    results = model(img_path)
    results.show()  # show annotated image window
    return {"detections": len(results[0].boxes)}
