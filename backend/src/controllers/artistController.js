const Artist = require('../models/Artist');
const Track = require('../models/Track');
const Album = require('../models/Album');

// @desc    Get all artists
// @route   GET /api/artists
// @access  Public
const getAllArtists = async (req, res, next) => {
  try {
    const { city, country, search } = req.query;
    const query = {};

    if (search) {
      query.artistName = { $regex: search, $options: 'i' };
    }
    if (city) query.city = city;
    if (country) query.country = country;

    const artists = await Artist.find(query).populate('userId', 'username email');
    res.json({ success: true, count: artists.length, data: artists });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single artist by ID with tracks and albums
// @route   GET /api/artists/:id
// @access  Public
const getArtistById = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id).populate('userId', 'username email avatar');
    if (!artist) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nghệ sĩ' });
    }

    const [tracks, albums] = await Promise.all([
      Track.find({ artistId: artist._id, status: 'published' }).sort({ playCount: -1 }),
      Album.find({ artistId: artist._id }),
    ]);

    res.json({
      success: true,
      data: {
        ...artist.toObject(),
        tracks,
        albums,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update artist profile
// @route   POST /api/artists/profile
// @access  Private (Artist/Admin)
const updateArtistProfile = async (req, res, next) => {
  try {
    let artist = await Artist.findOne({ userId: req.user._id });

    const { artistName, biography, country, city, latitude, longitude, avatar } = req.body;

    if (!artist) {
      // Create new artist record
      artist = await Artist.create({
        userId: req.user._id,
        artistName: artistName || req.user.username,
        biography: biography || '',
        country: country || 'Vietnam',
        city: city || 'Hà Nội',
        latitude: latitude !== undefined ? latitude : 21.0285,
        longitude: longitude !== undefined ? longitude : 105.8542,
        avatar: avatar || req.user.avatar,
      });
    } else {
      // Update existing
      if (artistName) artist.artistName = artistName;
      if (biography !== undefined) artist.biography = biography;
      if (country) artist.country = country;
      if (city) artist.city = city;
      if (latitude !== undefined) artist.latitude = latitude;
      if (longitude !== undefined) artist.longitude = longitude;
      if (avatar) artist.avatar = avatar;
      await artist.save();
    }

    res.json({
      success: true,
      data: artist,
      message: 'Cập nhật hồ sơ nghệ sĩ thành công',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllArtists,
  getArtistById,
  updateArtistProfile,
};
