const mongoose = require('mongoose');

const listeningHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    trackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
      required: true,
      index: true,
    },
    listenedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    duration: {
      type: Number,
      default: 0, // seconds listened
    },
    completed: {
      type: Boolean,
      default: false,
    },
    action: {
      type: String,
      enum: ['play', 'skip', 'like'],
      default: 'play',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ListeningHistory', listeningHistorySchema);
