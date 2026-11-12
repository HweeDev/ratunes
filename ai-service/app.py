"""
AI & Audio Processing Microservice
FastAPI backend for Librosa Feature Extraction, Genre Classification,
PhoBERT-based Vietnamese Emotion NLP, and Audio Plagiarism Detection.
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import shutil
import os
import tempfile

from models.audio_features import extract_features_from_audio, generate_synthetic_features
from models.genre_classifier import classify_genre_from_features
from models.emotion_nlp import analyze_vietnamese_emotion
from models.similarity_detector import detect_audio_similarity, vector_from_features, compute_cosine_similarity

app = FastAPI(
    title="AI Music & GIS Analytics Microservice",
    description="Provides audio feature extraction (Librosa), genre classification, Vietnamese emotion NLP, and plagiarism detection.",
    version="1.0.0",
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request schemas
class EmotionRequest(BaseModel):
    text: str


class GenreRequest(BaseModel):
    features: Dict[str, Any]


class SimilarityRequest(BaseModel):
    targetFeatures: Dict[str, Any]
    catalog: Optional[List[Dict[str, Any]]] = []
    threshold: Optional[float] = 0.85


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AI & Audio Processing Microservice",
        "framework": "FastAPI + Librosa + Scikit-Learn + NLP",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "music-ai-microservice"}


@app.post("/extract-features")
async def extract_features(file: UploadFile = File(...)):
    """
    Extracts acoustic features from uploaded audio file using Librosa.
    """
    try:
        suffix = os.path.splitext(file.filename)[1] or ".mp3"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        features = extract_features_from_audio(tmp_path)

        # Cleanup temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

        # Also predict genre automatically
        genre_prediction = classify_genre_from_features(features)

        return {
            "success": True,
            "filename": file.filename,
            "features": features,
            "genrePrediction": genre_prediction,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio processing error: {str(e)}")


@app.post("/classify-genre")
def classify_genre(req: GenreRequest):
    """
    Classifies genre from provided feature dictionary.
    """
    prediction = classify_genre_from_features(req.features)
    return {"success": True, "data": prediction}


@app.post("/analyze-emotion")
def analyze_emotion(req: EmotionRequest):
    """
    Analyzes Vietnamese natural language text and returns detected emotion & acoustic targets.
    """
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text prompt cannot be empty")

    analysis = analyze_vietnamese_emotion(req.text)
    return {"success": True, "data": analysis}


@app.post("/detect-similarity")
def detect_similarity(req: SimilarityRequest):
    """
    Checks audio similarity between target track and catalog to flag copyright risks.
    """
    result = detect_audio_similarity(
        req.targetFeatures,
        req.catalog or [],
        req.threshold or 0.85,
    )
    return {"success": True, "data": result}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
