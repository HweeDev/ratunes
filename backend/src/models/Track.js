const mongoose = require('mongoose');

const audioFeaturesSchema = new mongoose.Schema(
  {
    tempo: { type: Number, default: 120 },
    energy: { type: Number, default: 0.5 },
    valence: { type: Number, default: 0.5 },       // musical positiveness (0.0 sad -> 1.0 happy)
    danceability: { type: Number, default: 0.5 },  // suitability for dancing
    acousticness: { type: Number, default: 0.3 },  // confidence measure of whether track is acoustic
    spectralCentroid: { type: Number, default: 2200 },
    zeroCrossingRate: { type: Number, default: 0.08 },
    mfcc: { type: [Number], default: [] },          // Mel-Frequency Cepstral Coefficients (13 or 20 values)
  },
  { _id: false }
);

const trackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Track title is required'],
      trim: true,
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist',
      required: true,
    },
    albumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album',
      default: null,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      default: 'V-Pop',
    },
    audioUrl: {
      type: String,
      required: [true, 'Audio URL is required'],
    },
    coverUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop',
    },
    duration: {
      type: Number,
      required: true,
      default: 180, // duration in seconds
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    audioFeatures: {
      type: audioFeaturesSchema,
      default: () => ({}),
    },
    copyrightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Copyright',
      default: null,
    },
    playCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['published', 'pending', 'rejected'],
      default: 'published',
    },
    recordLabel: {
      type: String,
      default: '',
      trim: true,
    },
    copyrightDeclaration: {
      type: String,
      default: '',
      trim: true,
    },
    isrc: {
      type: String,
      default: '',
      trim: true,
    },
    releaseNotes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Track', trackSchema);
