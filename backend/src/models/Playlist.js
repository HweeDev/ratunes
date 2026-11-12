const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Playlist name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    coverUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',
    },
    tracks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track',
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Playlist', playlistSchema);
