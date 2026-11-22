from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SecondaryPrediction(BaseModel):
    category: str
    label: str
    confidence: float

class WasteClassificationResponse(BaseModel):
    status: str = "success"
    category: str
    display_name: str
    confidence: float
    recyclable: bool
    urgency_level: str
    hazard_score: int = Field(ge=1, le=10)
    disposal_recommendation: str
    environmental_impact: str
    features_detected: List[str]
    secondary_predictions: List[SecondaryPrediction]
    color_metrics: Optional[Dict[str, Any]] = None
    processing_time_ms: float

class HealthResponse(BaseModel):
    status: str
    version: str
    model_name: str
    classes_supported: List[str]
