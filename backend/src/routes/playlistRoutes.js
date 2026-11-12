const express = require('express');
const router = express.Router();
const {
  getUserPlaylists,
  getPublicPlaylists,
  getPlaylistById,
  createPlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  deletePlaylist,
} = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');

router.get('/public', getPublicPlaylists);
router.get('/me', protect, getUserPlaylists);
router.get('/:id', getPlaylistById);
router.post('/', protect, createPlaylist);
router.post('/:id/tracks', protect, addTrackToPlaylist);
router.delete('/:id/tracks/:trackId', protect, removeTrackFromPlaylist);
router.delete('/:id', protect, deletePlaylist);

module.exports = router;
