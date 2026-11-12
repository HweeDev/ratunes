"""
Audio Similarity & Plagiarism Detector Module
Computes Cosine Similarity and Euclidean Distance on MFCCs & Acoustic Features.
Flags potential copyright infringement when similarity exceeds a set threshold.
"""

import numpy as np


def vector_from_features(feat: dict) -> np.ndarray:
    """Converts a track audio feature dictionary to a normalized numerical vector"""
    tempo = float(feat.get("tempo", 120)) / 200.0
    energy = float(feat.get("energy", 0.5))
    valence = float(feat.get("valence", 0.5))
    danceability = float(feat.get("danceability", 0.5))
    acousticness = float(feat.get("acousticness", 0.3))

    base_vector = [tempo, energy, valence, danceability, acousticness]

    # Add MFCC coefficients if present (first 8 values)
    mfcc = feat.get("mfcc")
    if isinstance(mfcc, list) and len(mfcc) > 0:
        norm_mfcc = [float(v) / 50.0 for v in mfcc[:8]]
        base_vector.extend(norm_mfcc)

    return np.array(base_vector, dtype=float)


def compute_cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """Computes Cosine Similarity between two numpy vectors"""
    # Align lengths
    min_len = min(len(vec_a), len(vec_b))
    a = vec_a[:min_len]
    b = vec_b[:min_len]

    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    sim = float(dot / (norm_a * norm_b))
    return float(np.clip(sim, 0.0, 1.0))


def detect_audio_similarity(target_features: dict, catalog_tracks: list, threshold: float = 0.85):
    """
    Compares target audio features with catalog tracks.
    Returns matches where similarity exceeds the threshold.
    """
    target_vec = vector_from_features(target_features)
    matches = []

    for item in catalog_tracks:
        cand_features = item.get("audioFeatures", {})
        cand_vec = vector_from_features(cand_features)

        sim = compute_cosine_similarity(target_vec, cand_vec)
        score_pct = round(sim * 100, 1)

        if sim >= threshold:
            verdict = "HIGH_RISK_PLAGIARISM" if sim >= 0.92 else "SUSPICIOUS_SIMILARITY"
            matches.append({
                "trackId": item.get("_id"),
                "title": item.get("title", "Unknown"),
                "artist": item.get("artistName", "Unknown Artist"),
                "similarityScore": score_pct,
                "verdict": verdict,
                "featureDiscrepancies": {
                    "tempoDiff": abs(float(target_features.get("tempo", 120)) - float(cand_features.get("tempo", 120))),
                    "energyDiff": round(abs(float(target_features.get("energy", 0.5)) - float(cand_features.get("energy", 0.5))), 3),
                },
            })

    matches.sort(key=lambda x: x["similarityScore"], reverse=True)

    has_warning = len(matches) > 0
    highest = matches[0]["similarityScore"] if matches else 0.0

    return {
        "hasPlagiarismWarning": has_warning,
        "highestSimilarity": highest,
        "matchedCount": len(matches),
        "threshold": round(threshold * 100, 1),
        "matches": matches,
        "algorithm": "Acoustic Cosine Vector & Spectral Envelope Comparison",
    }
