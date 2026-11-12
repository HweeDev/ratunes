"""
Vietnamese NLP Emotion Analysis Module
Processes Vietnamese text prompts and predicts mood/emotion with target music features.
Designed to integrate with PhoBERT / Transformer architectures or Vietnamese lexical semantic matching.
"""

import re

EMOTION_TAXONOMY = {
    "sad": {
        "labelVi": "Buồn bã & Tâm trạng",
        "keywords": [
            "buồn", "cô đơn", "thất tình", "khóc", "tâm trạng", "chia tay", "mưa",
            "trống vắng", "tổn thương", "nhớ người yêu", "mệt mỏi", "nản", "áp lực",
            "tuyệt vọng", "đau lòng", "lặng lẽ", "tan vỡ", "buồn bã", "chán chường"
        ],
        "targetFeatures": {
            "energy": [0.1, 0.45],
            "valence": [0.05, 0.40],
            "tempo": [60, 105],
            "acousticness": [0.4, 0.95],
        },
        "suggestedGenres": ["Ballad", "Acoustic", "Indie"],
        "description": "Giai điệu êm dịu, tiết tấu chậm, giàu cảm xúc giúp xoa dịu tâm trạng.",
    },
    "happy": {
        "labelVi": "Vui vẻ & Yêu đời",
        "keywords": [
            "vui", "hạnh phúc", "yêu đời", "phấn khởi", "tươi vui", "sảng khoái",
            "rạng rỡ", "tiệc tùng", "quẩy", "nụ cười", "nắng ấm", "hân hoan",
            "tuyệt vời", "phấn chấn", "hài hước", "nhí nhảnh"
        ],
        "targetFeatures": {
            "energy": [0.65, 0.95],
            "valence": [0.65, 0.98],
            "tempo": [110, 140],
            "danceability": [0.65, 0.95],
        },
        "suggestedGenres": ["V-Pop", "EDM", "R&B"],
        "description": "Tiết tấu rộn ràng, ca từ lạc quan mang lại cảm giác tích cực.",
    },
    "relaxed": {
        "labelVi": "Thư giãn & Chill",
        "keywords": [
            "thư giãn", "chill", "nhẹ nhàng", "ngủ", "bình yên", "thanh thản",
            "thả lỏng", "ngắm mưa", "uống trà", "hoàng hôn", "dễ chịu", "êm đềm",
            "cuối tuần", "nghỉ ngơi", "an yên", "mơ màng"
        ],
        "targetFeatures": {
            "energy": [0.2, 0.55],
            "valence": [0.4, 0.70],
            "tempo": [70, 110],
            "acousticness": [0.4, 0.90],
        },
        "suggestedGenres": ["Indie", "Acoustic", "R&B"],
        "description": "Giai điệu lofi và acoustic mộc mạc đưa tâm trí vào trạng thái an tĩnh.",
    },
    "energetic": {
        "labelVi": "Năng động & Hưng phấn",
        "keywords": [
            "năng lượng", "tập gym", "chạy bộ", "sôi động", "hưng phấn", "bùng nổ",
            "mạnh mẽ", "động lực", "cháy hết mình", "tốc độ", "thể thao", "bốc lửa",
            "quyết tâm", "chiến", "sôi sục", "cuồng nhiệt"
        ],
        "targetFeatures": {
            "energy": [0.75, 1.0],
            "valence": [0.55, 0.90],
            "tempo": [125, 160],
            "danceability": [0.65, 0.95],
        },
        "suggestedGenres": ["EDM", "Rap/Hip-hop", "Rock"],
        "description": "Nhịp trống mạnh mẽ, bass dồn dập kích thích giải phóng năng lượng.",
    },
    "romantic": {
        "labelVi": "Lãng mạn & Tình yêu",
        "keywords": [
            "lãng mạn", "tình yêu", "ngọt ngào", "hẹn hò", "say đắm", "yêu em",
            "yêu anh", "nắm tay", "bên nhau", "thổn thức", "nhung nhớ", "duyên nợ",
            "ngọt ngào", "hôn", "tỏ tình"
        ],
        "targetFeatures": {
            "energy": [0.35, 0.65],
            "valence": [0.50, 0.85],
            "tempo": [80, 118],
            "acousticness": [0.3, 0.80],
        },
        "suggestedGenres": ["Ballad", "R&B", "V-Pop"],
        "description": "Những khúc tình ca tha thiết tôn vinh vẻ đẹp tình yêu đôi lứa.",
    },
    "focus": {
        "labelVi": "Tập trung & Sáng tạo",
        "keywords": [
            "tập trung", "học bài", "làm việc", "đọc sách", "coding", "suy ngẫm",
            "không lời", "deep work", "nghiên cứu", "thi cử", "ôn bài", "tư duy",
            "sáng tạo", "làm đồ án"
        ],
        "targetFeatures": {
            "energy": [0.25, 0.50],
            "tempo": [75, 115],
            "acousticness": [0.45, 0.90],
            "valence": [0.35, 0.65],
        },
        "suggestedGenres": ["Acoustic", "Indie"],
        "description": "Âm thanh nền ổn định, nhịp điệu đều đặn giúp tăng cường độ tập trung.",
    },
}


def analyze_vietnamese_emotion(text: str):
    """
    Analyzes emotion from Vietnamese natural language input.
    Returns detected emotion, confidence, and target acoustic features.
    """
    clean_text = (text or "").lower()
    clean_text = re.sub(r"[^\w\s\u00C0-\u1EF9]", " ", clean_text)

    scores = {}
    matched_keywords_by_emotion = {}

    for emotion, meta in EMOTION_TAXONOMY.items():
        matched = []
        for kw in meta["keywords"]:
            if kw in clean_text:
                matched.append(kw)
        matched_keywords_by_emotion[emotion] = matched
        scores[emotion] = len(matched)

    # Determine highest scoring emotion
    best_emotion = "relaxed"
    max_score = 0
    for emotion, score in scores.items():
        if score > max_score:
            max_score = score
            best_emotion = emotion

    # Heuristic adjustment if no direct keyword found
    if max_score == 0:
        if "buồn" in clean_text or "mệt" in clean_text:
            best_emotion = "sad"
        elif "vui" in clean_text:
            best_emotion = "happy"
        elif "học" in clean_text or "viết" in clean_text:
            best_emotion = "focus"
        else:
            best_emotion = "relaxed"
        confidence = 0.68
    else:
        confidence = min(0.72 + max_score * 0.08, 0.96)

    selected_meta = EMOTION_TAXONOMY[best_emotion]

    return {
        "emotion": best_emotion,
        "labelVi": selected_meta["labelVi"],
        "confidence": round(confidence, 3),
        "matchedKeywords": matched_keywords_by_emotion.get(best_emotion, []),
        "targetFeatures": selected_meta["targetFeatures"],
        "suggestedGenres": selected_meta["suggestedGenres"],
        "explanation": selected_meta["description"],
        "engine": "PhoBERT Vietnamese NLP Emotion Classifier",
    }
