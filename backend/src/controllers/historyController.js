const ListeningHistory = require('../models/ListeningHistory');
const Track = require('../models/Track');

// @desc    Record listening event
// @route   POST /api/history
// @access  Private (or authenticated user)
const recordHistory = async (req, res, next) => {
  try {
    const { trackId, duration, completed, action } = req.body;
    const userId = req.user._id;

    const historyRecord = await ListeningHistory.create({
      userId,
      trackId,
      duration: duration || 0,
      completed: completed === true || completed === 'true',
      action: action || 'play',
      listenedAt: new Date(),
    });

    // If played or completed, increment playCount on track
    if (action === 'play' || completed) {
      await Track.findByIdAndUpdate(trackId, { $inc: { playCount: 1 } });
    }

    res.status(201).json({
      success: true,
      data: historyRecord,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's listening history
// @route   GET /api/history
// @access  Private
const getUserHistory = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const history = await ListeningHistory.find({ userId: req.user._id })
      .populate({
        path: 'trackId',
        populate: { path: 'artistId', select: 'artistName avatar country city' },
      })
      .sort({ listenedAt: -1 })
      .limit(Number(limit));

    // Calculate user summary
    const totalListened = history.length;
    const completedCount = history.filter((h) => h.completed).length;
    const completionRate = totalListened > 0 ? Math.round((completedCount / totalListened) * 100) : 0;

    res.json({
      success: true,
      count: history.length,
      completionRate,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear user's listening history
// @route   DELETE /api/history
// @access  Private
const clearUserHistory = async (req, res, next) => {
  try {
    await ListeningHistory.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: 'Đã xóa toàn bộ lịch sử nghe nhạc' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordHistory,
  getUserHistory,
  clearUserHistory,
};
