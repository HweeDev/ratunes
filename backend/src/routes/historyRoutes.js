const express = require('express');
const router = express.Router();
const {
  recordHistory,
  getUserHistory,
  clearUserHistory,
} = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, recordHistory);
router.get('/', protect, getUserHistory);
router.delete('/', protect, clearUserHistory);

module.exports = router;
