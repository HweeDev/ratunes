const express = require('express');
const router = express.Router();
const {
  submitCopyright,
  getAllCopyrights,
  getArtistCopyrights,
  reviewCopyright,
} = require('../controllers/copyrightController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('artist', 'admin'), submitCopyright);
router.get('/', protect, authorize('admin'), getAllCopyrights);
router.get('/artist', protect, authorize('artist', 'admin'), getArtistCopyrights);
router.patch('/:id/review', protect, authorize('admin'), reviewCopyright);

module.exports = router;
