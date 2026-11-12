const express = require('express');
const router = express.Router();
const {
  submitDistribution,
  getAllDistributions,
  getArtistDistributions,
  updateDistributionStatus,
} = require('../controllers/distributionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('artist', 'admin'), submitDistribution);
router.get('/', protect, authorize('admin'), getAllDistributions);
router.get('/artist', protect, authorize('artist', 'admin'), getArtistDistributions);
router.patch('/:id/status', protect, authorize('admin'), updateDistributionStatus);

module.exports = router;
