const express = require('express');
const router = express.Router();
const {
  getAllArtists,
  getArtistById,
  updateArtistProfile,
} = require('../controllers/artistController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllArtists);
router.get('/:id', getArtistById);
router.post('/profile', protect, authorize('artist', 'admin'), updateArtistProfile);

module.exports = router;
