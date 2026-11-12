const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Album title is required'],
      trim: true,
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist',
      required: true,
    },
    coverUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop',
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      default: '',
    },
    tracks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Album', albumSchema);
