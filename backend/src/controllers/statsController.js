const User = require('../models/User');
const Artist = require('../models/Artist');
const Track = require('../models/Track');
const ListeningHistory = require('../models/ListeningHistory');
const Copyright = require('../models/Copyright');
const Distribution = require('../models/Distribution');

// @desc    Get overall system statistics (Admin)
// @route   GET /api/stats/system
// @access  Private (Admin)
const getSystemStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalArtists,
      totalTracks,
      totalPlaysResult,
      historySummary,
      topTracks,
      topArtists,
      genreBreakdown,
      pendingCopyrights,
      pendingDistributions,
    ] = await Promise.all([
      User.countDocuments(),
      Artist.countDocuments(),
      Track.countDocuments({ status: 'published' }),
      Track.aggregate([{ $group: { _id: null, total: { $sum: '$playCount' } } }]),
      ListeningHistory.aggregate([
        {
          $group: {
            _id: null,
            totalLogs: { $sum: 1 },
            completedLogs: { $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] } },
            skippedLogs: { $sum: { $cond: [{ $eq: ['$action', 'skip'] }, 1, 0] } },
            likedLogs: { $sum: { $cond: [{ $eq: ['$action', 'like'] }, 1, 0] } },
          },
        },
      ]),
      Track.find({ status: 'published' })
        .sort({ playCount: -1 })
        .limit(5)
        .populate('artistId', 'artistName avatar'),
      Artist.find().sort({ monthlyListeners: -1 }).limit(5),
      Track.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$genre', count: { $sum: 1 }, totalPlays: { $sum: '$playCount' } } },
        { $sort: { count: -1 } },
      ]),
      Copyright.countDocuments({ status: 'pending' }),
      Distribution.countDocuments({ status: 'pending' }),
    ]);

    const totalPlays = totalPlaysResult[0]?.total || 0;
    const historyStats = historySummary[0] || {
      totalLogs: 0,
      completedLogs: 0,
      skippedLogs: 0,
      likedLogs: 0,
    };

    const completionRate =
      historyStats.totalLogs > 0
        ? Math.round((historyStats.completedLogs / historyStats.totalLogs) * 100)
        : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalArtists,
          totalTracks,
          totalPlays,
          completionRate,
          pendingCopyrights,
          pendingDistributions,
        },
        behavior: {
          totalEvents: historyStats.totalLogs,
          completedCount: historyStats.completedLogs,
          skippedCount: historyStats.skippedLogs,
          likedCount: historyStats.likedLogs,
          completionRate,
        },
        topTracks,
        topArtists,
        genreBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stats for logged-in Artist
// @route   GET /api/stats/artist
// @access  Private (Artist)
const getArtistStats = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ userId: req.user._id });
    if (!artist) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ nghệ sĩ' });
    }

    const artistTracks = await Track.find({ artistId: artist._id });
    const trackIds = artistTracks.map((t) => t._id);

    const totalPlays = artistTracks.reduce((acc, t) => acc + (t.playCount || 0), 0);
    const totalLikes = artistTracks.reduce((acc, t) => acc + (t.likesCount || 0), 0);

    const historyEvents = await ListeningHistory.find({ trackId: { $in: trackIds } });
    const totalEvents = historyEvents.length;
    const completedCount = historyEvents.filter((e) => e.completed).length;
    const completionRate = totalEvents > 0 ? Math.round((completedCount / totalEvents) * 100) : 0;

    const topTracks = [...artistTracks]
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        artistName: artist.artistName,
        totalTracks: artistTracks.length,
        totalPlays,
        totalLikes,
        monthlyListeners: artist.monthlyListeners,
        completionRate,
        topTracks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSystemStats,
  getArtistStats,
};
