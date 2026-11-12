const Distribution = require('../models/Distribution');
const Artist = require('../models/Artist');

// @desc    Submit release distribution request
// @route   POST /api/distribution
// @access  Private (Artist)
const submitDistribution = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ userId: req.user._id });
    if (!artist) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ nghệ sĩ' });
    }

    const { releaseId, releaseTitle, platforms } = req.body;

    const distribution = await Distribution.create({
      artistId: artist._id,
      releaseId: releaseId || `REL-${Date.now()}`,
      releaseTitle: releaseTitle || 'Đĩa đơn phát hành mới',
      platforms: platforms || ['Spotify', 'Apple Music', 'YouTube Music', 'TikTok', 'Zing MP3'],
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: distribution,
      message: 'Yêu cầu phân phối đã được gửi tới các nền tảng phát nhạc trực tuyến quốc tế',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all distributions (Admin)
// @route   GET /api/distribution
// @access  Private (Admin)
const getAllDistributions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const distributions = await Distribution.find(query)
      .populate('artistId', 'artistName country city avatar')
      .sort({ submittedAt: -1 });

    res.json({ success: true, count: distributions.length, data: distributions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get artist's own distributions
// @route   GET /api/distribution/artist
// @access  Private (Artist)
const getArtistDistributions = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ userId: req.user._id });
    if (!artist) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ nghệ sĩ' });
    }

    const distributions = await Distribution.find({ artistId: artist._id }).sort({ submittedAt: -1 });
    res.json({ success: true, count: distributions.length, data: distributions });
  } catch (error) {
    next(error);
  }
};

// @desc    Update distribution status (Admin)
// @route   PATCH /api/distribution/:id/status
// @access  Private (Admin)
const updateDistributionStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const distribution = await Distribution.findById(req.params.id);

    if (!distribution) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu phân phối' });
    }

    distribution.status = status;
    if (notes) distribution.notes = notes;
    if (['approved', 'rejected'].includes(status)) {
      distribution.processedAt = new Date();
    }

    await distribution.save();

    res.json({
      success: true,
      data: distribution,
      message: `Đã cập nhật trạng thái phân phối: ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitDistribution,
  getAllDistributions,
  getArtistDistributions,
  updateDistributionStatus,
};
