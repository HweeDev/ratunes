const express = require('express');
const router = express.Router();
const { getAllAlbums, getAlbumById, createAlbum } = require('../controllers/albumController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllAlbums);
router.get('/:id', getAlbumById);
router.post('/', protect, authorize('artist', 'admin'), createAlbum);

module.exports = router;
