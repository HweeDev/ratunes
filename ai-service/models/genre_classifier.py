"""
Music Genre Classifier Module
Uses acoustic features (Tempo, Energy, MFCC, Acousticness, Danceability) to classify music genres.
"""

import numpy as np

GENRES = ["V-Pop", "Rap/Hip-hop", "Indie", "Ballad", "EDM", "R&B", "Rock", "Acoustic"]

# Genre profile prototypes based on acoustic musicology
GENRE_PROFILES = {
    "EDM": {"tempo": 128, "energy": 0.88, "valence": 0.70, "danceability": 0.85, "acousticness": 0.10},
    "Rap/Hip-hop": {"tempo": 95, "energy": 0.75, "valence": 0.65, "danceability": 0.82, "acousticness": 0.15},
    "Rock": {"tempo": 135, "energy": 0.90, "valence": 0.55, "danceability": 0.50, "acousticness": 0.08},
    "V-Pop": {"tempo": 115, "energy": 0.65, "valence": 0.60, "danceability": 0.68, "acousticness": 0.35},
    "R&B": {"tempo": 90, "energy": 0.58, "valence": 0.62, "danceability": 0.70, "acousticness": 0.40},
    "Indie": {"tempo": 85, "energy": 0.45, "valence": 0.45, "danceability": 0.52, "acousticness": 0.65},
    "Ballad": {"tempo": 75, "energy": 0.38, "valence": 0.32, "danceability": 0.42, "acousticness": 0.78},
    "Acoustic": {"tempo": 80, "energy": 0.30, "valence": 0.50, "danceability": 0.45, "acousticness": 0.88},
}


def classify_genre_from_features(features: dict):
    """
    Classifies musical genre given acoustic features dictionary.
    Calculates weighted Euclidean distance to known genre prototypes.
    """
    tempo = float(features.get("tempo", 120))
    energy = float(features.get("energy", 0.5))
    valence = float(features.get("valence", 0.5))
    danceability = float(features.get("danceability", 0.5))
    acousticness = float(features.get("acousticness", 0.5))

    input_vec = np.array([tempo / 150.0, energy, valence, danceability, acousticness])

    best_genre = "V-Pop"
    best_dist = float("inf")
    genre_probabilities = {}

    for genre, prof in GENRE_PROFILES.items():
        prof_vec = np.array([
            prof["tempo"] / 150.0,
            prof["energy"],
            prof["valence"],
            prof["danceability"],
            prof["acousticness"],
        ])
        dist = float(np.linalg.norm(input_vec - prof_vec))
        sim = 1.0 / (1.0 + dist)
        genre_probabilities[genre] = round(sim, 3)

        if dist < best_dist:
            best_dist = dist
            best_genre = genre

    # Normalize probabilities to sum to 1.0
    total_sim = sum(genre_probabilities.values())
    probs = {k: round(v / total_sim, 3) for k, v in genre_probabilities.items()}

    sorted_probs = sorted(probs.items(), key=lambda x: x[1], reverse=True)

    confidence = sorted_probs[0][1]

    return {
        "predictedGenre": best_genre,
        "confidence": confidence,
        "allProbabilities": dict(sorted_probs),
        "featuresUsed": {
            "tempo": tempo,
            "energy": energy,
            "danceability": danceability,
            "acousticness": acousticness,
            "valence": valence,
        },
    }
