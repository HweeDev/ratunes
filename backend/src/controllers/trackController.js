const Track = require('../models/Track');
const Artist = require('../models/Artist');
const Copyright = require('../models/Copyright');
const ListeningHistory = require('../models/ListeningHistory');
const { checkAudioPlagiarism } = require('../services/audioService');

// @desc    Get all tracks with filters & pagination
// @route   GET /api/tracks
// @access  Public
const getAllTracks = async (req, res, next) => {
  try {
    const { search, genre, artistId, sort, limit = 50, page = 1 } = req.query;
    const query = { status: 'published' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
      ];
    }

    if (genre && genre !== 'All') {
      query.genre = genre;
    }

    if (artistId) {
      query.artistId = artistId;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { playCount: -1 };
    if (sort === 'likes') sortOption = { likesCount: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [tracks, total] = await Promise.all([
      Track.find(query)
        .populate('artistId', 'artistName avatar country city latitude longitude')
        .populate('albumId', 'title coverUrl')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Track.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: tracks,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single track by ID
// @route   GET /api/tracks/:id
// @access  Public
const getTrackById = async (req, res, next) => {
  try {
    const track = await Track.findById(req.params.id)
      .populate('artistId', 'artistName avatar biography country city latitude longitude')
      .populate('albumId', 'title coverUrl releaseDate')
      .populate('copyrightId');

    if (!track) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài hát' });
    }

    res.json({ success: true, data: track });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new track (Artist only)
// @route   POST /api/tracks
// @access  Private (Artist/Admin)
const createTrack = async (req, res, next) => {
  try {
    let artistId = req.body.artistId;

    // If caller is an artist, verify or locate their artist profile
    if (req.user.role === 'artist') {
      const artist = await Artist.findOne({ userId: req.user._id });
      if (!artist) {
        return res.status(400).json({
          success: false,
          message: 'Chưa tìm thấy hồ sơ nghệ sĩ của bạn. Vui lòng cập nhật hồ sơ trước.',
        });
      }
      artistId = artist._id;
    }

    const {
      title,
      genre,
      audioUrl,
      coverUrl,
      duration,
      audioFeatures,
      declaration,
      copyrightDeclaration,
      author,
      recordLabel,
      isrc,
      releaseNotes,
    } = req.body;

    // AI Plagiarism / Audio Similarity Detection check before saving
    let plagiarismReport = null;
    let similarityScore = 0;
    if (audioFeatures) {
      plagiarismReport = await checkAudioPlagiarism(audioFeatures);
      similarityScore = plagiarismReport.highestSimilarity || 0;
    }

    // Determine initial status: if high plagiarism warning, flag as pending admin review
    const initialStatus = similarityScore > 85 ? 'pending' : 'published';
    const finalDeclaration = copyrightDeclaration || declaration || '';

    const newTrack = await Track.create({
      title,
      artistId,
      albumId: req.body.albumId || null,
      genre: genre || 'V-Pop',
      audioUrl,
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop',
      duration: duration || 180,
      audioFeatures: audioFeatures || {
        tempo: 120,
        energy: 0.7,
        valence: 0.6,
        danceability: 0.65,
        acousticness: 0.3,
        mfcc: [12.5, -4.2, 8.1, -2.0, 5.4, -1.8, 3.2, 0.5],
      },
      status: initialStatus,
      recordLabel: recordLabel || '',
      copyrightDeclaration: finalDeclaration,
      isrc: isrc || '',
      releaseNotes: releaseNotes || '',
    });

    // Automatically create Copyright record if copyright info was provided
    if (finalDeclaration || author || isrc) {
      const copyright = await Copyright.create({
        trackId: newTrack._id,
        owner: req.body.owner || req.user.username,
        author: author || req.user.username,
        declaration: finalDeclaration || 'Cam kết bản quyền âm nhạc thuộc quyền sở hữu của tác giả',
        status: similarityScore > 85 ? 'pending' : 'approved',
        similarityScore,
        similarityNotes: plagiarismReport?.hasPlagiarismWarning
          ? `Cảnh báo AI: Phát hiện tương đồng ${similarityScore}% với bài hát khác.`
          : 'Hệ thống AI xác nhận tính độc bản âm thanh hợp lệ.',
      });

      newTrack.copyrightId = copyright._id;
      await newTrack.save();
    }

    res.status(201).json({
      success: true,
      data: newTrack,
      plagiarismReport,
      message:
        similarityScore > 85
          ? 'Bài hát được lưu nhưng đang chờ Admin phê duyệt do phát hiện độ tương đồng âm thanh cao.'
          : 'Đăng tải bài hát thành công!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update track
// @route   PUT /api/tracks/:id
// @access  Private (Artist/Admin)
const updateTrack = async (req, res, next) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài hát' });
    }

    // Role check
    if (req.user.role === 'artist') {
      const artist = await Artist.findOne({ userId: req.user._id });
      if (!artist || track.artistId.toString() !== artist._id.toString()) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa bài hát này' });
      }
    }

    const updated = await Track.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated, message: 'Cập nhật bài hát thành công' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete track
// @route   DELETE /api/tracks/:id
// @access  Private (Artist/Admin)
const deleteTrack = async (req, res, next) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài hát' });
    }

    if (req.user.role === 'artist') {
      const artist = await Artist.findOne({ userId: req.user._id });
      if (!artist || track.artistId.toString() !== artist._id.toString()) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa bài hát này' });
      }
    }

    await Track.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa bài hát thành công' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Like on track
// @route   POST /api/tracks/:id/like
// @access  Private
const likeTrack = async (req, res, next) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài hát' });
    }

    // Check if user already liked
    const existingLike = await ListeningHistory.findOne({
      userId: req.user._id,
      trackId: track._id,
      action: 'like',
    });

    let liked = false;
    if (existingLike) {
      // Unlike
      await ListeningHistory.findByIdAndDelete(existingLike._id);
      track.likesCount = Math.max(0, (track.likesCount || 0) - 1);
      liked = false;
    } else {
      // Like
      await ListeningHistory.create({
        userId: req.user._id,
        trackId: track._id,
        action: 'like',
        completed: true,
      });
      track.likesCount = (track.likesCount || 0) + 1;
      liked = true;
    }

    await track.save();

    // AUTO-MANAGE "Bài hát đã thích" (Liked Songs) Playlist
    const Playlist = require('../models/Playlist');
    let likedPlaylist = await Playlist.findOne({
      userId: req.user._id,
      name: 'Bài hát đã thích',
    });

    if (!likedPlaylist) {
      likedPlaylist = await Playlist.create({
        userId: req.user._id,
        name: 'Bài hát đã thích',
        description: 'Tập hợp tất cả các bản nhạc bạn đã thả tim trên ratunes',
        coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&h=500&fit=crop',
        isPublic: false,
        tracks: [],
      });
    }

    if (liked) {
      if (!likedPlaylist.tracks.some((t) => t.toString() === track._id.toString())) {
        likedPlaylist.tracks.unshift(track._id);
        await likedPlaylist.save();
      }
    } else {
      likedPlaylist.tracks = likedPlaylist.tracks.filter(
        (t) => t.toString() !== track._id.toString()
      );
      await likedPlaylist.save();
    }

    res.json({
      success: true,
      data: {
        liked,
        likesCount: track.likesCount,
        playlistId: likedPlaylist._id,
      },
      message: liked
        ? 'Đã thêm vào bài hát yêu thích'
        : 'Đã bỏ yêu thích',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get array of track IDs that current user has liked
// @route   GET /api/tracks/user/liked-ids
// @access  Private
const getLikedTrackIds = async (req, res, next) => {
  try {
    const likes = await ListeningHistory.find({
      userId: req.user._id,
      action: 'like',
    }).select('trackId');

    const ids = likes.map((l) => (l.trackId ? l.trackId.toString() : null)).filter(Boolean);
    res.json({ success: true, data: ids });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTracks,
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack,
  likeTrack,
  getLikedTrackIds,
};
