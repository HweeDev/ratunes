const Album = require('../models/Album');
const Artist = require('../models/Artist');

// @desc    Get all albums
// @route   GET /api/albums
// @access  Public
const getAllAlbums = async (req, res, next) => {
  try {
    const albums = await Album.find()
      .populate('artistId', 'artistName avatar country city')
      .populate('tracks', 'title duration audioUrl coverUrl genre')
      .sort({ releaseDate: -1 });

    res.json({ success: true, count: albums.length, data: albums });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single album by ID
// @route   GET /api/albums/:id
// @access  Public
const getAlbumById = async (req, res, next) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate('artistId', 'artistName avatar biography country city')
      .populate({
        path: 'tracks',
        populate: { path: 'artistId', select: 'artistName avatar' },
      });

    if (!album) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy album' });
    }

    res.json({ success: true, data: album });
  } catch (error) {
    next(error);
  }
};

// @desc    Create album (Artist only)
// @route   POST /api/albums
// @access  Private (Artist/Admin)
const createAlbum = async (req, res, next) => {
  try {
    let artistId = req.body.artistId;
    if (req.user.role === 'artist') {
      const artist = await Artist.findOne({ userId: req.user._id });
      if (!artist) {
        return res.status(400).json({ success: false, message: 'Không tìm thấy hồ sơ nghệ sĩ' });
      }
      artistId = artist._id;
    }

    const { title, coverUrl, description, tracks, releaseDate } = req.body;

    const album = await Album.create({
      title,
      artistId,
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop',
      description,
      tracks: tracks || [],
      releaseDate: releaseDate || Date.now(),
    });

    res.status(201).json({ success: true, data: album, message: 'Tạo album thành công' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAlbums,
  getAlbumById,
  createAlbum,
};
