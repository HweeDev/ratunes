const mongoose = require('mongoose');

const distributionSchema = new mongoose.Schema(
  {
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist',
      required: true,
    },
    releaseId: {
      type: String,
      required: true,
    },
    releaseTitle: {
      type: String,
      default: '',
    },
    platforms: {
      type: [String],
      default: ['Spotify', 'Apple Music', 'YouTube Music', 'TikTok', 'Zing MP3'],
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'approved', 'rejected'],
      default: 'pending',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Distribution', distributionSchema);
