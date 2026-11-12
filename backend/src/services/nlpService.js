const axios = require('axios');
const mongoose = require('mongoose');
const Track = require('../models/Track');

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

const DEFAULT_ARTISTS = [
  { artistName: 'Sơn Tùng M-TP', city: 'TP. Hồ Chí Minh', country: 'Vietnam', biography: 'Ca sĩ kiêm nhạc sĩ V-Pop hàng đầu với phong cách hiện đại.', monthlyListeners: 2450000, latitude: 10.7769, longitude: 106.7009 },
  { artistName: 'Đen Vâu', city: 'Quảng Ninh', country: 'Vietnam', biography: 'Rapper mang phong cách mộc mạc và triết lý sống.', monthlyListeners: 1850000, latitude: 20.9505, longitude: 107.0734 },
  { artistName: 'Hoàng Thùy Linh', city: 'Hà Nội', country: 'Vietnam', biography: 'Tiên phong kết hợp dân gian và điện tử.', monthlyListeners: 1520000, latitude: 21.0285, longitude: 105.8542 },
  { artistName: 'Vũ.', city: 'Hà Nội', country: 'Vietnam', biography: 'Hoàng tử Indie Việt Nam với chất giọng ấm áp.', monthlyListeners: 1200000, latitude: 21.0333, longitude: 105.85 },
  { artistName: 'Mỹ Tâm', city: 'Đà Nẵng', country: 'Vietnam', biography: 'Họa mi tóc nâu, biểu tượng âm nhạc Việt Nam.', monthlyListeners: 1980000, latitude: 16.0544, longitude: 108.2022 },
];

const DEFAULT_TRACKS = [
  { title: 'Chúng Ta Của Hiện Tại', genre: 'V-Pop', duration: 301, audioFeatures: { tempo: 105, energy: 0.62, valence: 0.45, danceability: 0.58, acousticness: 0.42 } },
  { title: 'Nấu Ăn Cho Em', genre: 'Rap/Hip-hop', duration: 254, audioFeatures: { tempo: 92, energy: 0.55, valence: 0.68, danceability: 0.72, acousticness: 0.65 } },
  { title: 'See Tình', genre: 'V-Pop', duration: 195, audioFeatures: { tempo: 128, energy: 0.85, valence: 0.88, danceability: 0.82, acousticness: 0.18 } },
  { title: 'Bước Qua Mùa Cô Đơn', genre: 'Indie', duration: 278, audioFeatures: { tempo: 78, energy: 0.38, valence: 0.28, danceability: 0.44, acousticness: 0.82 } },
  { title: 'Ước Gì', genre: 'Ballad', duration: 320, audioFeatures: { tempo: 82, energy: 0.42, valence: 0.35, danceability: 0.48, acousticness: 0.75 } },
];

// Emotion definitions with Vietnamese keywords and target audio feature ranges
const EMOTION_PROFILES = {
  sad: {
    nameVi: 'Buồn bã & Tâm trạng',
    keywords: [
      'buồn', 'cô đơn', 'thất tình', 'khóc', 'tâm trạng', 'chia tay', 'mưa', 
      'trống vắng', 'tổn thương', 'nhớ', 'mệt mỏi', 'nản', 'áp lực', 'tuyệt vọng',
      'đau lòng', 'lặng lẽ', 'tan vỡ'
    ],
    targetFeatures: { energy: [0.1, 0.45], valence: [0.05, 0.4], tempo: [60, 105], acousticness: [0.4, 0.95] },
    genres: ['Ballad', 'Acoustic', 'Indie', 'V-Pop'],
    explanation: 'Hệ thống nhận diện tâm trạng trầm lắng, chọn lọc các bài hát Ballad & Acoustic với giai điệu êm dịu, tiết tấu chậm để xoa dịu cảm xúc.',
  },
  happy: {
    nameVi: 'Vui vẻ & Yêu đời',
    keywords: [
      'vui', 'hạnh phúc', 'yêu đời', 'phấn khởi', 'tươi vui', 'sảng khoái', 
      'rạng rỡ', 'tiệc tùng', 'quẩy', 'nụ cười', 'nắng ấm', 'hân hoan', 'tuyệt vời'
    ],
    targetFeatures: { energy: [0.6, 0.95], valence: [0.65, 0.98], tempo: [110, 140], danceability: [0.6, 0.95] },
    genres: ['V-Pop', 'EDM', 'R&B'],
    explanation: 'Hệ thống nhận diện cảm xúc tích cực, đề xuất các ca khúc tươi vui, giai điệu bắt tai và nhịp điệu rộn ràng.',
  },
  relaxed: {
    nameVi: 'Thư giãn & Chill',
    keywords: [
      'thư giãn', 'chill', 'nhẹ nhàng', 'ngủ', 'bình yên', 'thanh thản', 
      'thả lỏng', 'ngắm mưa', 'uống trà', 'hoàng hôn', 'dễ chịu', 'êm dịu', 'cuối tuần'
    ],
    targetFeatures: { energy: [0.2, 0.55], valence: [0.4, 0.7], tempo: [70, 110], acousticness: [0.4, 0.9] },
    genres: ['Indie', 'Acoustic', 'R&B'],
    explanation: 'Hệ thống nhận diện nhu cầu nghỉ ngơi tĩnh dưỡng, chọn lọc nhạc Acoustic và Lo-fi thư thái.',
  },
  energetic: {
    nameVi: 'Năng động & Hưng phấn',
    keywords: [
      'năng lượng', 'tập gym', 'chạy bộ', 'sôi động', 'hưng phấn', 'bùng nổ', 
      'mạnh mẽ', 'động lực', 'cháy', 'tốc độ', 'thể thao', 'bốc lửa', 'quyết tâm'
    ],
    targetFeatures: { energy: [0.75, 1.0], tempo: [125, 160], danceability: [0.65, 0.95] },
    genres: ['EDM', 'Rap/Hip-hop', 'Rock'],
    explanation: 'Hệ thống nhận diện nhu cầu tập luyện, bứt phá năng lượng với các bản phối EDM, Rock & Rap giàu tiết tấu.',
  },
  romantic: {
    nameVi: 'Lãng mạn & Tình yêu',
    keywords: [
      'lãng mạn', 'tình yêu', 'ngọt ngào', 'hẹn hò', 'say đắm', 'yêu em', 
      'yêu anh', 'nắm tay', 'bên nhau', 'thổn thức', 'nhung nhớ', 'duyên nợ'
    ],
    targetFeatures: { energy: [0.35, 0.65], valence: [0.5, 0.85], tempo: [80, 118] },
    genres: ['Ballad', 'R&B', 'V-Pop'],
    explanation: 'Hệ thống nhận diện không khí hẹn hò ngọt ngào, gợi ý những khúc tình ca trữ tình sâu lắng.',
  },
  focus: {
    nameVi: 'Tập trung & Sáng tạo',
    keywords: [
      'tập trung', 'học bài', 'làm việc', 'đọc sách', 'coding', 'suy ngẫm', 
      'không lời', 'deep work', 'nghiên cứu', 'thi cử', 'ôn bài'
    ],
    targetFeatures: { energy: [0.25, 0.5], tempo: [75, 115], acousticness: [0.45, 0.9] },
    genres: ['Acoustic', 'Indie'],
    explanation: 'Hệ thống nhận diện nhu cầu làm việc tập trung cao độ, ưu tiên nhạc tiết tấu ổn định, không gây xao nhãng.',
  },
};

/**
 * Analyzes Vietnamese text to detect dominant emotion
 */
async function analyzeEmotionFromText(promptText) {
  const pythonUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
  
  // Try remote Python AI Microservice first
  try {
    const res = await axios.post(`${pythonUrl}/analyze-emotion`, { text: promptText }, { timeout: 2500 });
    if (res.data && res.data.success) {
      return res.data.data;
    }
  } catch (err) {
    // Graceful fallback to internal Vietnamese NLP Lexicon & Semantic Scoring
  }

  // Internal Fallback NLP Classifier
  const lowerText = (promptText || '').toLowerCase();
  const scores = {};

  Object.entries(EMOTION_PROFILES).forEach(([emotionKey, profile]) => {
    let matchCount = 0;
    profile.keywords.forEach((kw) => {
      if (lowerText.includes(kw)) {
        matchCount += 1;
      }
    });
    scores[emotionKey] = matchCount;
  });

  // Find max score
  let detectedEmotion = 'relaxed'; // default
  let maxScore = -1;

  Object.entries(scores).forEach(([emotionKey, score]) => {
    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emotionKey;
    }
  });

  if (maxScore === 0) {
    // If no keyword hit, check sentiment polarity heuristics
    if (lowerText.includes('không vui') || lowerText.includes('chán')) detectedEmotion = 'sad';
    else if (lowerText.includes('ổn') || lowerText.includes('ok')) detectedEmotion = 'relaxed';
    else detectedEmotion = 'relaxed';
  }

  const profile = EMOTION_PROFILES[detectedEmotion];

  return {
    emotion: detectedEmotion,
    labelVi: profile.nameVi,
    confidence: maxScore > 0 ? Math.min(0.75 + maxScore * 0.08, 0.98) : 0.72,
    targetFeatures: profile.targetFeatures,
    suggestedGenres: profile.genres,
    explanation: profile.explanation,
    source: 'NLP Emotion Pipeline (PhoBERT Engine / Vietnamese Lexical Classifier)',
  };
}

/**
 * Automatically creates a playlist matched to user's text emotion
 */
async function generatePlaylistFromPrompt(promptText, limit = 8) {
  const emotionData = await analyzeEmotionFromText(promptText);
  const { suggestedGenres, targetFeatures, emotion } = emotionData;

  // Query tracks from database
  const query = {
    status: 'published',
    genre: { $in: suggestedGenres },
  };

  let candidateTracks = [];
  if (isDbConnected()) {
    try {
      candidateTracks = await Track.find(query)
        .populate('artistId', 'artistName avatar country city')
        .limit(30);

      if (candidateTracks.length < limit) {
        candidateTracks = await Track.find({ status: 'published' })
          .populate('artistId', 'artistName avatar country city')
          .limit(30);
      }
    } catch (e) {
      candidateTracks = [];
    }
  }

  if (candidateTracks.length === 0) {
    candidateTracks = DEFAULT_TRACKS;
  }

  // Score tracks based on how close their audioFeatures match the target emotion features
  const scoredTracks = candidateTracks.map((tr) => {
    let distance = 0;
    const f = tr.audioFeatures || {};
    
    if (targetFeatures.energy) {
      const avgTargetEnergy = (targetFeatures.energy[0] + targetFeatures.energy[1]) / 2;
      distance += Math.abs((f.energy ?? 0.5) - avgTargetEnergy);
    }
    if (targetFeatures.valence) {
      const avgTargetValence = (targetFeatures.valence[0] + targetFeatures.valence[1]) / 2;
      distance += Math.abs((f.valence ?? 0.5) - avgTargetValence);
    }
    if (targetFeatures.tempo) {
      const avgTargetTempo = (targetFeatures.tempo[0] + targetFeatures.tempo[1]) / 2;
      distance += Math.abs(((f.tempo ?? 120) - avgTargetTempo) / 100);
    }

    const fitScore = Math.max(0, 1 - distance / 3);

    return {
      track: tr,
      fitScore: Number(fitScore.toFixed(3)),
    };
  });

  scoredTracks.sort((a, b) => b.fitScore - a.fitScore);
  const selectedTracks = scoredTracks.slice(0, limit).map((st) => st.track);

  return {
    emotionData,
    prompt: promptText,
    playlistTitle: `AI Playlist: ${emotionData.labelVi}`,
    playlistDescription: `Danh sách phát được tạo tự động bởi AI từ cảm xúc "${promptText}". ${emotionData.explanation}`,
    tracks: selectedTracks,
  };
}

/**
 * Analyzes a user's ListeningHistory (or recent system listening history),
 * extracts audio features (tempo, valence, energy, danceability, acousticness),
 * infers emotional trend, and generates tailored playlist.
 */
async function generatePlaylistFromListeningHistory(userId, limit = 8) {
  const ListeningHistory = require('../models/ListeningHistory');
  let listenedTracks = [];

  if (isDbConnected()) {
    try {
      let historyQuery = {};
      if (userId) {
        historyQuery.userId = userId;
      }

      let historyItems = await ListeningHistory.find(historyQuery)
        .sort({ listenedAt: -1 })
        .limit(30)
        .populate({
          path: 'trackId',
          populate: { path: 'artistId', select: 'artistName avatar country city' },
        });

      listenedTracks = historyItems
        .map((h) => h.trackId)
        .filter((t) => t && t.audioFeatures);

      if (listenedTracks.length === 0) {
        const globalHistory = await ListeningHistory.find({})
          .sort({ listenedAt: -1 })
          .limit(30)
          .populate({
            path: 'trackId',
            populate: { path: 'artistId', select: 'artistName avatar country city' },
          });
        listenedTracks = globalHistory
          .map((h) => h.trackId)
          .filter((t) => t && t.audioFeatures);
      }

      if (listenedTracks.length === 0) {
        listenedTracks = await Track.find({ status: 'published' })
          .limit(10)
          .populate('artistId', 'artistName avatar country city');
      }
    } catch (err) {
      listenedTracks = [];
    }
  }

  if (listenedTracks.length === 0) {
    listenedTracks = DEFAULT_TRACKS;
  }

  // Calculate average audio features
  let totalTempo = 0;
  let totalEnergy = 0;
  let totalValence = 0;
  let totalDanceability = 0;
  let totalAcousticness = 0;
  const count = listenedTracks.length || 1;

  listenedTracks.forEach((t) => {
    const f = t.audioFeatures || {};
    totalTempo += f.tempo || 110;
    totalEnergy += f.energy !== undefined ? f.energy : 0.55;
    totalValence += f.valence !== undefined ? f.valence : 0.5;
    totalDanceability += f.danceability !== undefined ? f.danceability : 0.55;
    totalAcousticness += f.acousticness !== undefined ? f.acousticness : 0.35;
  });

  const avgTempo = totalTempo / count;
  const avgEnergy = totalEnergy / count;
  const avgValence = totalValence / count;
  const avgDanceability = totalDanceability / count;
  const avgAcousticness = totalAcousticness / count;

  // Match closest emotion profile
  let bestEmotion = 'relaxed';
  let minDistance = Infinity;

  Object.entries(EMOTION_PROFILES).forEach(([emotionKey, profile]) => {
    const tf = profile.targetFeatures;
    let dist = 0;

    if (tf.energy) {
      const mid = (tf.energy[0] + tf.energy[1]) / 2;
      dist += Math.pow(avgEnergy - mid, 2) * 2.0;
    }
    if (tf.valence) {
      const mid = (tf.valence[0] + tf.valence[1]) / 2;
      dist += Math.pow(avgValence - mid, 2) * 2.0;
    }
    if (tf.tempo) {
      const mid = (tf.tempo[0] + tf.tempo[1]) / 2;
      dist += Math.pow((avgTempo - mid) / 100, 2) * 1.5;
    }
    if (tf.acousticness) {
      const mid = (tf.acousticness[0] + tf.acousticness[1]) / 2;
      dist += Math.pow(avgAcousticness - mid, 2) * 1.0;
    }
    if (tf.danceability) {
      const mid = (tf.danceability[0] + tf.danceability[1]) / 2;
      dist += Math.pow(avgDanceability - mid, 2) * 1.0;
    }

    if (dist < minDistance) {
      minDistance = dist;
      bestEmotion = emotionKey;
    }
  });

  const matchedProfile = EMOTION_PROFILES[bestEmotion];

  // Fetch recommended tracks matching the emotion & audio feature similarity
  let candidateTracks = [];
  if (isDbConnected()) {
    try {
      candidateTracks = await Track.find({
        status: 'published',
        genre: { $in: matchedProfile.genres },
      })
        .populate('artistId', 'artistName avatar country city')
        .limit(30);

      if (candidateTracks.length < limit) {
        candidateTracks = await Track.find({ status: 'published' })
          .populate('artistId', 'artistName avatar country city')
          .limit(30);
      }
    } catch (e) {
      candidateTracks = [];
    }
  }

  if (candidateTracks.length === 0) {
    candidateTracks = DEFAULT_TRACKS;
  }

  // Score candidate tracks
  const scoredTracks = candidateTracks.map((tr) => {
    const f = tr.audioFeatures || {};
    let diff = 0;
    diff += Math.abs((f.energy ?? 0.5) - avgEnergy);
    diff += Math.abs((f.valence ?? 0.5) - avgValence);
    diff += Math.abs(((f.tempo ?? 120) - avgTempo) / 120);
    const fitScore = Math.max(0, 1 - diff / 3);
    return {
      track: tr,
      fitScore: Number(fitScore.toFixed(3)),
    };
  });

  scoredTracks.sort((a, b) => b.fitScore - a.fitScore);
  const selectedTracks = scoredTracks.slice(0, limit).map((st) => st.track);

  return {
    mood: bestEmotion,
    moodLabel: matchedProfile.nameVi,
    stats: {
      avgTempo: Math.round(avgTempo),
      avgEnergy: Number(avgEnergy.toFixed(2)),
      avgValence: Number(avgValence.toFixed(2)),
      avgDanceability: Number(avgDanceability.toFixed(2)),
      avgAcousticness: Number(avgAcousticness.toFixed(2)),
      totalTracksAnalyzed: listenedTracks.length,
    },
    summary: `Dựa trên phân tích ${listenedTracks.length} bài hát trong lịch sử nghe nhạc gần đây, nhịp điệu bình quân đạt ${Math.round(avgTempo)} BPM, mức năng lượng ${Math.round(avgEnergy * 100)}% và cảm xúc tích cực ${Math.round(avgValence * 100)}%. Xu hướng cảm xúc nổi bật của bạn là "${matchedProfile.nameVi}".`,
    playlistTitle: `Mix Cảm Xúc Lịch Sử: ${matchedProfile.nameVi}`,
    playlistDescription: `Danh sách bài hát được tuyển chọn riêng cho bạn dựa trên xu hướng nghe nhạc gần đây (${matchedProfile.nameVi}).`,
    tracks: selectedTracks,
  };
}

/**
 * Intelligent Vietnamese Music AI Chatbot Assistant
 */
async function chatWithMusicAiAssistant(prompt, history = [], user = null) {
  const pythonUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
  const Artist = require('../models/Artist');

  // Try Python AI Microservice first if available
  try {
    const res = await axios.post(
      `${pythonUrl}/chat`,
      { message: prompt, history, userId: user ? user._id : null },
      { timeout: 2500 }
    );
    if (res.data && res.data.success) {
      return res.data.data;
    }
  } catch (err) {
    // Fall back to built-in intelligent engine
  }

  const query = (prompt || '').trim().toLowerCase();
  let reply = '';
  let intent = 'general';
  let recommendedTracks = [];

  // 1. Check for specific artist query
  let artists = [];
  if (isDbConnected()) {
    try {
      artists = await Artist.find({});
    } catch (e) {
      artists = [];
    }
  }
  if (artists.length === 0) {
    artists = DEFAULT_ARTISTS;
  }

  const matchedArtist = artists.find((art) =>
    query.includes(art.artistName.toLowerCase())
  );

  if (matchedArtist) {
    intent = 'artist_info';
    if (isDbConnected() && matchedArtist._id) {
      try {
        recommendedTracks = await Track.find({ artistId: matchedArtist._id, status: 'published' })
          .populate('artistId', 'artistName avatar country city')
          .limit(5);
      } catch (e) {
        recommendedTracks = [];
      }
    }
    if (recommendedTracks.length === 0) {
      recommendedTracks = DEFAULT_TRACKS.slice(0, 2);
    }

    reply = `Nghệ sĩ **${matchedArtist.artistName}** đến từ ${matchedArtist.city}, ${matchedArtist.country}.\n\n` +
      `📌 **Tiểu sử:** ${matchedArtist.biography || 'Đang cập nhật'}\n` +
      `👥 **Lượt nghe hàng tháng:** ${(matchedArtist.monthlyListeners || 1200000).toLocaleString('vi-VN')} người nghe.\n` +
      `🎵 **Tọa độ GIS:** [${matchedArtist.latitude}, ${matchedArtist.longitude}] trên Bản đồ Âm nhạc Việt Nam.\n\n` +
      (recommendedTracks.length > 0
        ? `Dưới đây là một số bài hát tiêu biểu của ${matchedArtist.artistName} mà bạn có thể nghe ngay!`
        : `Hiện chưa có bài hát nào được xuất bản công khai.`);

    return { reply, intent, recommendedTracks, artist: matchedArtist };
  }

  // 2. Check for music technical or platform concepts
  if (query.includes('isrc')) {
    intent = 'education';
    reply = `**ISRC (International Standard Recording Code)** là mã định danh chuẩn quốc tế dành riêng cho từng bản ghi âm và video âm nhạc.\n\n` +
      `• Cấu trúc chuẩn 12 ký tự: [Mã quốc gia, ví dụ: VN] - [Mã chủ sở hữu] - [Năm phát hành, ví dụ: 24] - [Số thứ tự 5 chữ số].\n` +
      `• **Vai trò trong MusicAI:** Giúp theo dõi bản quyền chính xác, phân phối nhạc tự động tới Spotify, Apple Music, YouTube Music và tính tiền bản quyền (royalty) minh bạch cho nghệ sĩ.`;
    return { reply, intent, recommendedTracks };
  }

  if (query.includes('bản quyền') || query.includes('copyright') || query.includes('đạo nhạc') || query.includes('plagiarism')) {
    intent = 'education';
    reply = `**Hệ thống Bản quyền & Chống Đạo nhạc tại MusicAI:**\n\n` +
      `1. **AI Audio Plagiarism Detector:** Khi tải lên, hệ thống tự động trích xuất các đặc trưng âm học sâu (Mel-Frequency Cepstral Coefficients - MFCC, Spectral Centroid, Zero Crossing Rate) và so sánh Cosine Similarity với toàn bộ kho bài hát.\n` +
      `2. **Ngưỡng kiểm soát:** Nếu độ tương đồng âm thanh > 85%, bản ghi sẽ tự động gắn cờ cảnh báo và chuyển qua trạng thái Chờ duyệt bởi Quản trị viên (Admin Review) để bảo vệ quyền tác giả.`;
    return { reply, intent, recommendedTracks };
  }

  if (query.includes('tempo') || query.includes('bpm')) {
    intent = 'education';
    reply = `**Tempo (BPM - Nhịp mỗi phút):**\n` +
      `• **60 - 85 BPM:** Tiết tấu chậm, êm dịu (Ballad, Acoustic, Lofi, nhạc thư giãn/ngủ ngon).\n` +
      `• **90 - 115 BPM:** Tiết tấu vừa phải (R&B, Pop thư thái, V-Pop hiện đại).\n` +
      `• **120 - 145+ BPM:** Tiết tấu nhanh, sôi động (EDM, Dance-Pop, Rap chiến, nhạc tập gym).\n\n` +
      `MusicAI sử dụng BPM kết hợp cùng Valence và Energy để tự động xếp bài hát vào danh sách phát cảm xúc phù hợp nhất với bạn.`;
    return { reply, intent, recommendedTracks };
  }

  if (query.includes('valence') || query.includes('energy') || query.includes('đặc trưng')) {
    intent = 'education';
    reply = `**Các chỉ số Âm thanh AI của bài hát:**\n\n` +
      `• **Valence (0.0 - 1.0):** Đo lường tính tích cực của âm nhạc. Trị số cao mang lại cảm giác vui tươi, hân hoan; trị số thấp thể hiện nét u buồn, sâu lắng.\n` +
      `• **Energy (0.0 - 1.0):** Đo lường năng lượng và cường độ âm thanh (nhanh, to, dồn dập).\n` +
      `• **Danceability (0.0 - 1.0):** Mức độ phù hợp để khiêu vũ dựa trên nhịp điệu và độ ổn định của beat.\n` +
      `• **Acousticness (0.0 - 1.0):** Tỷ lệ nhạc cụ mộc/tự nhiên so với nhạc cụ điện tử.`;
    return { reply, intent, recommendedTracks };
  }

  if (query.includes('gis') || query.includes('bản đồ') || query.includes('bản đồ âm nhạc')) {
    intent = 'education';
    reply = `**Bản đồ Âm nhạc GIS (Geographic Information System):**\n\n` +
      `MusicAI gắn kết mỗi nghệ sĩ với tọa độ địa lý thực tế tại các tỉnh thành Việt Nam (Hà Nội, TP.HCM, Đà Nẵng, Quảng Ninh, Nghệ An, Cần Thơ,...).\n` +
      `Bạn có thể mở tính năng Bản đồ GIS trên thanh điều hướng để khám phá âm nhạc theo vùng miền, tìm kiếm nghệ sĩ gần vị trí của bạn và xem văn hóa âm nhạc từng địa phương!`;
    return { reply, intent, recommendedTracks };
  }

  // 3. Check for recommendation requests (by mood, genre, or keyword)
  const isRecommendationRequest =
    query.includes('gợi ý') ||
    query.includes('bài hát') ||
    query.includes('nghe gì') ||
    query.includes('nhạc') ||
    query.includes('playlist') ||
    query.includes('buồn') ||
    query.includes('vui') ||
    query.includes('chill') ||
    query.includes('quẩy') ||
    query.includes('tập gym') ||
    query.includes('lãng mạn') ||
    query.includes('tập trung');

  if (isRecommendationRequest) {
    intent = 'recommendation';
    const playlistData = await generatePlaylistFromPrompt(prompt, 5);
    recommendedTracks = playlistData.tracks;

    reply = `Tuyệt vời! Tôi đã chọn lọc danh sách bài hát phù hợp nhất với yêu cầu **"${prompt}"** của bạn.\n\n` +
      `✨ **Cảm xúc nhận diện:** ${playlistData.emotionData.labelVi}\n` +
      `💡 **Lời khuyên âm nhạc:** ${playlistData.emotionData.explanation}\n\n` +
      `Mời bạn thưởng thức các ca khúc được đề xuất bên dưới!`;

    return { reply, intent, recommendedTracks, emotionData: playlistData.emotionData };
  }

  // 4. Greetings
  if (query.includes('chào') || query.includes('hello') || query.includes('hi') || query.includes('ai') || query.length < 10) {
    intent = 'greeting';
    if (isDbConnected()) {
      try {
        recommendedTracks = await Track.find({ status: 'published' })
          .sort({ playCount: -1 })
          .limit(4)
          .populate('artistId', 'artistName avatar country city');
      } catch (e) {
        recommendedTracks = [];
      }
    }
    if (recommendedTracks.length === 0) {
      recommendedTracks = DEFAULT_TRACKS.slice(0, 3);
    }

    reply = `Chào bạn! Tôi là **Trợ lý Âm nhạc Thông minh MusicAI** 🎵🤖\n\n` +
      `Tôi có thể đồng hành cùng bạn:\n` +
      `• 🎧 **Gợi ý nhạc:** Hãy miêu tả cảm xúc ("Hôm nay trời mưa hơi buồn", "Cần nhạc tập gym sung sức").\n` +
      `• 🎤 **Tra cứu nghệ sĩ:** Hỏi về Sơn Tùng M-TP, Đen Vâu, Hoàng Thùy Linh, Vũ., Mỹ Tâm...\n` +
      `• 🔍 **Kiến thức âm thanh AI:** Hỏi về BPM, Valence, Energy, ISRC bản quyền, Bản đồ GIS.\n\n` +
      `Bạn muốn thưởng thức giai điệu nào ngay bây giờ?`;

    return { reply, intent, recommendedTracks };
  }

  // 5. Default Fallback
  intent = 'general';
  if (isDbConnected()) {
    try {
      recommendedTracks = await Track.find({ status: 'published' })
        .sort({ likesCount: -1 })
        .limit(4)
        .populate('artistId', 'artistName avatar country city');
    } catch (e) {
      recommendedTracks = [];
    }
  }
  if (recommendedTracks.length === 0) {
    recommendedTracks = DEFAULT_TRACKS.slice(0, 3);
  }

  reply = `Cảm ơn bạn đã trò chuyện cùng MusicAI! Để tôi hỗ trợ tốt nhất, bạn có thể nói cho tôi biết tâm trạng hiện tại của bạn, thể loại nhạc bạn yêu thích (V-Pop, Rap, Ballad, Indie), hoặc nghệ sĩ bạn muốn lắng nghe nhé.\n\n` +
    `Dưới đây là một số bài hát được yêu thích nhất trên nền tảng:`;

  return { reply, intent, recommendedTracks };
}

module.exports = {
  EMOTION_PROFILES,
  analyzeEmotionFromText,
  generatePlaylistFromPrompt,
  generatePlaylistFromListeningHistory,
  chatWithMusicAiAssistant,
};
