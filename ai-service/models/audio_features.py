"""
Audio Feature Extraction Module using Librosa and NumPy
Extracts: Tempo (BPM), RMS Energy, Spectral Centroid, Zero Crossing Rate, MFCC, Chroma
"""

import numpy as np

try:
    import librosa
    LIBROSA_AVAILABLE = True
except ImportError:
    LIBROSA_AVAILABLE = False


def extract_features_from_audio(file_path_or_buffer, duration=30, sr=22050):
    """
    Loads audio file (or buffer) and extracts acoustic features using librosa.
    Returns a dictionary of features and an MFCC vector.
    """
    if not LIBROSA_AVAILABLE:
        # Fallback simulation if librosa is not yet installed in host environment
        return generate_synthetic_features()

    try:
        # Load up to 30 seconds of audio for fast feature extraction
        y, sr = librosa.load(file_path_or_buffer, sr=sr, duration=duration, mono=True)

        if len(y) == 0:
            return generate_synthetic_features()

        # 1. Tempo & Beat
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo, _ = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr)
        tempo_val = float(tempo[0] if isinstance(tempo, (np.ndarray, list)) else tempo)

        # 2. RMS Energy
        rms = librosa.feature.rms(y=y)
        energy_val = float(np.mean(rms))
        normalized_energy = float(np.clip(energy_val * 4.0, 0.05, 1.0))

        # 3. Spectral Centroid
        cent = librosa.feature.spectral_centroid(y=y, sr=sr)
        spectral_centroid_val = float(np.mean(cent))

        # 4. Zero Crossing Rate
        zcr = librosa.feature.zero_crossing_rate(y=y)
        zcr_val = float(np.mean(zcr))

        # 5. MFCCs (13 coefficients)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_mean = [float(round(v, 3)) for v in np.mean(mfccs, axis=1)]

        # 6. Chroma STFT
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        chroma_mean = float(np.mean(chroma))

        # 7. Derived Valence & Danceability estimation
        # Higher spectral centroid & tempo often correlate with higher positive valence
        valence_estimate = float(np.clip(0.3 + (spectral_centroid_val / 4000.0) * 0.4 + (tempo_val / 180.0) * 0.3, 0.1, 0.95))
        danceability_estimate = float(np.clip(0.3 + (zcr_val * 3.0) + (normalized_energy * 0.4), 0.1, 0.95))
        acousticness_estimate = float(np.clip(1.0 - normalized_energy * 0.8, 0.05, 0.95))

        return {
            "tempo": round(tempo_val, 1),
            "energy": round(normalized_energy, 3),
            "valence": round(valence_estimate, 3),
            "danceability": round(danceability_estimate, 3),
            "acousticness": round(acousticness_estimate, 3),
            "spectralCentroid": round(spectral_centroid_val, 1),
            "zeroCrossingRate": round(zcr_val, 4),
            "chromaMean": round(chroma_mean, 3),
            "mfcc": mfcc_mean,
            "engine": "Librosa v" + (librosa.__version__ if LIBROSA_AVAILABLE else "fallback"),
        }
    except Exception as e:
        print(f"[AudioFeatures] Librosa extraction failed ({str(e)}). Using fallback features.")
        return generate_synthetic_features()


def generate_synthetic_features():
    """Generates a realistic feature dictionary for testing or fallback"""
    return {
        "tempo": 120.0,
        "energy": 0.65,
        "valence": 0.58,
        "danceability": 0.62,
        "acousticness": 0.35,
        "spectralCentroid": 2240.0,
        "zeroCrossingRate": 0.075,
        "chromaMean": 0.41,
        "mfcc": [14.5, -5.2, 8.4, -2.8, 4.2, -1.5, 2.8, 0.9, -1.2, 1.0, -0.8, 0.5, -0.3],
        "engine": "Synthetic Audio Feature Profiler (Simulation Mode)",
    }
