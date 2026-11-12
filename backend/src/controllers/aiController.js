const {
  generatePlaylistFromPrompt,
  analyzeEmotionFromText,
  generatePlaylistFromListeningHistory,
  chatWithMusicAiAssistant,
} = require('../services/nlpService');
const { getSimilarTracks, getHybridRecommendationsForUser } = require('../services/recommendationService');
const { checkAudioPlagiarism } = require('../services/audioService');
const Track = require('../models/Track');

// @desc    Analyze Vietnamese emotion from prompt and auto-generate playlist
// @route   POST /api/ai/emotion-playlist
// @access  Public
const generateEmotionPlaylist = async (req, res, next) => {
  try {
    const { prompt, limit = 8 } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mô tả cảm xúc hoặc tâm trạng của bạn (ví dụ: "Hôm nay buồn quá...")',
      });
    }

    const result = await generatePlaylistFromPrompt(prompt, Number(limit));

    res.json({
      success: true,
      data: result,
      message: `Đã tạo danh sách phát phù hợp với cảm xúc: ${result.emotionData.labelVi}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze emotion only
// @route   POST /api/ai/analyze-emotion
// @access  Public
const analyzeEmotion = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp văn bản cần phân tích' });
    }

    const emotionResult = await analyzeEmotionFromText(text);
    res.json({ success: true, data: emotionResult });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI recommendations (Hybrid: Content-Based + Collaborative)
// @route   GET /api/ai/recommendations
// @access  Public (Optional Auth)
const getRecommendations = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const userId = req.user ? req.user._id : null;

    let recommendations = [];
    if (userId) {
      // Personalized Hybrid Recommendation
      recommendations = await getHybridRecommendationsForUser(userId, limit);
    } else {
      // Guest: Popular and diverse tracks
      recommendations = await Track.find({ status: 'published' })
        .sort({ playCount: -1, likesCount: -1 })
        .limit(limit)
        .populate('artistId', 'artistName avatar country city');
    }

    res.json({
      success: true,
      count: recommendations.length,
      mode: userId ? 'HYBRID_COLLABORATIVE_CONTENT' : 'POPULAR_CONTENT_BASED',
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get similar tracks (Content-Based Cosine Similarity)
// @route   GET /api/ai/similar-tracks/:trackId
// @access  Public
const getSimilarTracksEndpoint = async (req, res, next) => {
  try {
    const { trackId } = req.params;
    const limit = Number(req.query.limit) || 6;

    const similar = await getSimilarTracks(trackId, limit);
    res.json({
      success: true,
      count: similar.length,
      algorithm: 'Cosine Similarity on Mel-Spectrogram & Audio Features',
      data: similar,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check audio plagiarism / similarity against catalog
// @route   POST /api/ai/check-plagiarism
// @access  Private (Artist/Admin)
const checkPlagiarismEndpoint = async (req, res, next) => {
  try {
    const { audioFeatures, excludeTrackId, threshold } = req.body;

    if (!audioFeatures) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đặc trưng âm thanh (tempo, energy, mfcc,...) để kiểm tra',
      });
    }

    const report = await checkAudioPlagiarism(
      audioFeatures,
      excludeTrackId,
      threshold ? threshold / 100 : 0.85
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate personalized playlist from user's ListeningHistory & emotional trend
// @route   POST /api/ai/history-emotion-playlist or GET /api/ai/mood-from-history
// @access  Public (Optional Auth)
const getHistoryEmotionPlaylist = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : req.body.userId || req.query.userId || null;
    const limit = Number(req.body.limit || req.query.limit || 8);

    const result = await generatePlaylistFromListeningHistory(userId, limit);

    res.json({
      success: true,
      data: result,
      message: `Đã phân tích lịch sử nghe nhạc: Phát hiện xu hướng cảm xúc "${result.moodLabel}".`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Chat with AI Music Chatbot Assistant
// @route   POST /api/ai/chat
// @access  Public (Optional Auth)
const chatWithAi = async (req, res, next) => {
  try {
    const prompt = req.body.message || req.body.prompt || req.body.question || '';
    const history = req.body.history || [];

    if (!prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập câu hỏi hoặc yêu cầu dành cho Trợ lý AI Âm nhạc.',
      });
    }

    const chatResponse = await chatWithMusicAiAssistant(prompt, history, req.user);

    res.json({
      success: true,
      data: chatResponse,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateEmotionPlaylist,
  analyzeEmotion,
  getRecommendations,
  getSimilarTracksEndpoint,
  checkPlagiarismEndpoint,
  getHistoryEmotionPlaylist,
  chatWithAi,
};
