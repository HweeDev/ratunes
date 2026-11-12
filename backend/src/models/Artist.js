const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    artistName: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true,
    },
    biography: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: 'Vietnam',
    },
    city: {
      type: String,
      default: 'Hanoi',
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required for GIS mapping'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required for GIS mapping'],
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop',
    },
    monthlyListeners: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Artist', artistSchema);
