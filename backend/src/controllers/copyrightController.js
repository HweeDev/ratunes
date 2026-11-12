const Copyright = require('../models/Copyright');
const Track = require('../models/Track');
const Artist = require('../models/Artist');

// @desc    Submit copyright declaration
// @route   POST /api/copyright
// @access  Private (Artist/Admin)
const submitCopyright = async (req, res, next) => {
  try {
    const { trackId, owner, author, declaration, similarityScore } = req.body;

    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài hát' });
    }

    const copyright = await Copyright.create({
      trackId,
      owner,
      author,
      declaration,
      similarityScore: similarityScore || 0,
      status: 'pending',
    });

    track.copyrightId = copyright._id;
    await track.save();

    res.status(201).json({
      success: true,
      data: copyright,
      message: 'Hồ sơ bản quyền đã được nộp thành công và đang chờ xét duyệt',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all copyright declarations (Admin only)
// @route   GET /api/copyright
// @access  Private (Admin)
const getAllCopyrights = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const records = await Copyright.find(query)
      .populate({
        path: 'trackId',
        populate: { path: 'artistId', select: 'artistName avatar' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

// @desc    Get artist copyright declarations
// @route   GET /api/copyright/artist
// @access  Private (Artist)
const getArtistCopyrights = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ userId: req.user._id });
    if (!artist) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ nghệ sĩ' });
    }

    const artistTracks = await Track.find({ artistId: artist._id }).select('_id');
    const trackIds = artistTracks.map((t) => t._id);

    const records = await Copyright.find({ trackId: { $in: trackIds } })
      .populate('trackId', 'title coverUrl genre audioUrl')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    next(error);
  }
};

// @desc    Review and approve/reject copyright
// @route   PATCH /api/copyright/:id/review
// @access  Private (Admin)
const reviewCopyright = async (req, res, next) => {
  try {
    const { status, similarityNotes } = req.body; // status: 'approved' | 'rejected'

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const record = await Copyright.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ bản quyền' });
    }

    record.status = status;
    if (similarityNotes) record.similarityNotes = similarityNotes;
    await record.save();

    // If approved, update track status to published; if rejected, update to rejected
    if (status === 'approved') {
      await Track.findByIdAndUpdate(record.trackId, { status: 'published' });
    } else if (status === 'rejected') {
      await Track.findByIdAndUpdate(record.trackId, { status: 'rejected' });
    }

    res.json({
      success: true,
      data: record,
      message: `Đã ${status === 'approved' ? 'phê duyệt' : 'từ chối'} hồ sơ bản quyền thành công`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitCopyright,
  getAllCopyrights,
  getArtistCopyrights,
  reviewCopyright,
};
