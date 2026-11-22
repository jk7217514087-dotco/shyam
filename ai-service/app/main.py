import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from app.schemas import WasteClassificationResponse, HealthResponse
from app.classifier import classifier_instance, WASTE_METADATA

app = FastAPI(
    title="SmartBin AI - Waste Classification Microservice",
    description="Intelligent computer-vision service for classifying municipal and citizen solid waste photographs.",
    version="1.0.0"
)

# Enable CORS for frontend and backend microservices
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
def root():
    return {
        "service": "SmartBin AI Vision Service",
        "tagline": "Report Smartly. Collect Efficiently. Keep Cities Clean.",
        "status": "operational",
        "docs_url": "/docs"
    }

@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        model_name="SmartBin-CV-FeatureClassifier-v1",
        classes_supported=classifier_instance.categories
    )

@app.get("/categories", tags=["Waste Information"])
def list_categories():
    return {
        "status": "success",
        "count": len(WASTE_METADATA),
        "categories": WASTE_METADATA
    }

@app.post("/classify", response_model=WasteClassificationResponse, tags=["Classification"])
async def classify_waste(
    file: UploadFile = File(...),
    filename_hint: Optional[str] = Form(None)
):
    # Validate content type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/octet-stream"]
    if file.content_type not in allowed_types and not file.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Please upload a valid JPG, PNG, or WEBP image."
        )

    try:
        contents = await file.read()
        if len(contents) > 15 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image size exceeds 15MB limit.")
        
        result = classifier_instance.classify_image(
            image_bytes=contents,
            filename_hint=filename_hint or file.filename
        )
        return WasteClassificationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image classification error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
