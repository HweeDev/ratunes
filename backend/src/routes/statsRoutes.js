const express = require('express');
const router = express.Router();
const { getSystemStats, getArtistStats } = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/system', protect, authorize('admin'), getSystemStats);
router.get('/artist', protect, authorize('artist', 'admin'), getArtistStats);

module.exports = router;
