const express = require('express');
const router = express.Router();
const {
  getAllTracks,
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack,
  likeTrack,
  getLikedTrackIds,
} = require('../controllers/trackController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllTracks);
router.get('/user/liked-ids', protect, getLikedTrackIds);
router.get('/:id', getTrackById);
router.post('/', protect, authorize('artist', 'admin'), createTrack);
router.put('/:id', protect, authorize('artist', 'admin'), updateTrack);
router.delete('/:id', protect, authorize('artist', 'admin'), deleteTrack);
router.post('/:id/like', protect, likeTrack);

module.exports = router;
