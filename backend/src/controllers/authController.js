const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Artist = require('../models/Artist');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_jwt_key_music_platform_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email đã tồn tại trong hệ thống' });
    }

    const assignedRole = ['user', 'artist', 'admin'].includes(role) ? role : 'user';

    const user = await User.create({
      username,
      email,
      password,
      role: assignedRole,
    });

    // If registered as artist, create an initial artist profile
    let artistProfile = null;
    if (assignedRole === 'artist') {
      artistProfile = await Artist.create({
        userId: user._id,
        artistName: username,
        country: 'Vietnam',
        city: 'Hà Nội',
        latitude: 21.0285,
        longitude: 105.8542,
        biography: 'Nghệ sĩ mới gia nhập nền tảng',
      });
    }

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        artistId: artistProfile ? artistProfile._id : null,
        artistProfile,
        token: generateToken(user._id),
      },
      message: 'Đăng ký tài khoản thành công',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
    }

    let artistProfile = null;
    if (user.role === 'artist') {
      artistProfile = await Artist.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        artistId: artistProfile ? artistProfile._id : null,
        artistProfile,
        token: generateToken(user._id),
      },
      message: 'Đăng nhập thành công',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let artistProfile = null;
    if (user.role === 'artist') {
      artistProfile = await Artist.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        artistProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (req.body.username) user.username = req.body.username;
    if (req.body.avatar) user.avatar = req.body.avatar;
    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();

    let artistProfile = null;
    if (updatedUser.role === 'artist') {
      artistProfile = await Artist.findOne({ userId: updatedUser._id });
      if (!artistProfile) {
        artistProfile = new Artist({
          userId: updatedUser._id,
          artistName: req.body.artistName || updatedUser.username,
          latitude: req.body.latitude !== undefined ? Number(req.body.latitude) : 21.0285,
          longitude: req.body.longitude !== undefined ? Number(req.body.longitude) : 105.8542,
        });
      }

      if (req.body.artistName) artistProfile.artistName = req.body.artistName;
      if (req.body.city !== undefined) artistProfile.city = req.body.city;
      if (req.body.country !== undefined) artistProfile.country = req.body.country;
      if (req.body.latitude !== undefined) artistProfile.latitude = Number(req.body.latitude);
      if (req.body.longitude !== undefined) artistProfile.longitude = Number(req.body.longitude);
      if (req.body.biography !== undefined) artistProfile.biography = req.body.biography;
      if (req.body.avatar) artistProfile.avatar = req.body.avatar;

      await artistProfile.save();
    }

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        artistProfile,
      },
      message: 'Cập nhật thông tin thành công',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
