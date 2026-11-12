const Playlist = require('../models/Playlist');

// @desc    Get current user playlists
// @route   GET /api/playlists/me
// @access  Private
const getUserPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find({ userId: req.user._id })
      .populate({
        path: 'tracks',
        populate: { path: 'artistId', select: 'artistName avatar' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: playlists.length, data: playlists });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public playlists
// @route   GET /api/playlists/public
// @access  Public
const getPublicPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find({ isPublic: true })
      .populate('userId', 'username avatar')
      .populate({
        path: 'tracks',
        populate: { path: 'artistId', select: 'artistName avatar' },
      })
      .limit(20)
      .sort({ createdAt: -1 });

    res.json({ success: true, count: playlists.length, data: playlists });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single playlist by ID
// @route   GET /api/playlists/:id
// @access  Public
const getPlaylistById = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('userId', 'username avatar')
      .populate({
        path: 'tracks',
        populate: { path: 'artistId', select: 'artistName avatar country city' },
      });

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh sách phát' });
    }

    res.json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new playlist
// @route   POST /api/playlists
// @access  Private
const createPlaylist = async (req, res, next) => {
  try {
    const { name, description, coverUrl, tracks, isPublic } = req.body;

    const playlist = await Playlist.create({
      userId: req.user._id,
      name,
      description: description || '',
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',
      tracks: tracks || [],
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    const populated = await Playlist.findById(playlist._id).populate({
      path: 'tracks',
      populate: { path: 'artistId', select: 'artistName avatar' },
    });

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Tạo danh sách phát thành công',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add track to playlist
// @route   POST /api/playlists/:id/tracks
// @access  Private
const addTrackToPlaylist = async (req, res, next) => {
  try {
    const { trackId } = req.body;
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user._id });

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh sách phát của bạn' });
    }

    if (!playlist.tracks.includes(trackId)) {
      playlist.tracks.push(trackId);
      await playlist.save();
    }

    res.json({ success: true, data: playlist, message: 'Đã thêm bài hát vào danh sách phát' });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove track from playlist
// @route   DELETE /api/playlists/:id/tracks/:trackId
// @access  Private
const removeTrackFromPlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user._id });
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh sách phát' });
    }

    playlist.tracks = playlist.tracks.filter((t) => t.toString() !== req.params.trackId);
    await playlist.save();

    res.json({ success: true, data: playlist, message: 'Đã xóa bài hát khỏi danh sách phát' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete playlist
// @route   DELETE /api/playlists/:id
// @access  Private
const deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh sách phát' });
    }

    res.json({ success: true, message: 'Đã xóa danh sách phát thành công' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserPlaylists,
  getPublicPlaylists,
  getPlaylistById,
  createPlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  deletePlaylist,
};
