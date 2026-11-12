const mongoose = require('mongoose');

const copyrightSchema = new mongoose.Schema(
  {
    trackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track',
      required: true,
    },
    owner: {
      type: String,
      required: [true, 'Copyright owner is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author/Composer is required'],
      trim: true,
    },
    declaration: {
      type: String,
      required: [true, 'Copyright declaration statement is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    similarityScore: {
      type: Number,
      default: 0, // 0 - 100 percentage from AI acoustic similarity
    },
    similarityNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Copyright', copyrightSchema);
