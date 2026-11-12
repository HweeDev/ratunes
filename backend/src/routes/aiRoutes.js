const express = require('express');
const router = express.Router();
const {
  generateEmotionPlaylist,
  analyzeEmotion,
  getRecommendations,
  getSimilarTracksEndpoint,
  checkPlagiarismEndpoint,
  getHistoryEmotionPlaylist,
  chatWithAi,
} = require('../controllers/aiController');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

router.post('/emotion-playlist', generateEmotionPlaylist);
router.post('/analyze-emotion', analyzeEmotion);
router.get('/recommendations', optionalAuth, getRecommendations);
router.get('/similar-tracks/:trackId', getSimilarTracksEndpoint);
router.post('/check-plagiarism', protect, authorize('artist', 'admin'), checkPlagiarismEndpoint);
router.post('/history-emotion-playlist', optionalAuth, getHistoryEmotionPlaylist);
router.get('/mood-from-history', optionalAuth, getHistoryEmotionPlaylist);
router.post('/chat', optionalAuth, chatWithAi);

module.exports = router;
