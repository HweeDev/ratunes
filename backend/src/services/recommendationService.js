const Track = require('../models/Track');
const ListeningHistory = require('../models/ListeningHistory');

/**
 * Calculates Cosine Similarity between two feature vectors
 * Vector keys: tempo (normalized), energy, valence, danceability, acousticness, mfcc
 */
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Convert audioFeatures object to numerical vector
 */
function featureToVector(features = {}) {
  const tempoNorm = (features.tempo || 120) / 200; // normalize tempo roughly to [0, 1]
  const energy = features.energy ?? 0.5;
  const valence = features.valence ?? 0.5;
  const danceability = features.danceability ?? 0.5;
  const acousticness = features.acousticness ?? 0.3;

  const baseVector = [tempoNorm, energy, valence, danceability, acousticness];

  // If MFCC array exists, append it
  if (Array.isArray(features.mfcc) && features.mfcc.length > 0) {
    // Take first 8 MFCC coefficients, normalized
    const mfccSubset = features.mfcc.slice(0, 8).map((v) => v / 100);
    return baseVector.concat(mfccSubset);
  }

  return baseVector;
}

/**
 * Content-Based Recommendation: Find tracks similar to a given track ID
 */
async function getSimilarTracks(trackId, limit = 6) {
  const targetTrack = await Track.findById(trackId);
  if (!targetTrack) return [];

  const targetVector = featureToVector(targetTrack.audioFeatures);

  // Fetch candidate tracks in the same or related genres
  const candidates = await Track.find({
    _id: { $ne: trackId },
    status: 'published',
  }).populate('artistId', 'artistName avatar country city');

  const scoredTracks = candidates.map((track) => {
    const vec = featureToVector(track.audioFeatures);
    // Align vector lengths
    const minLen = Math.min(targetVector.length, vec.length);
    const sim = cosineSimilarity(targetVector.slice(0, minLen), vec.slice(0, minLen));
    
    // Genre boost (+0.1 if same genre)
    const genreBoost = track.genre === targetTrack.genre ? 0.1 : 0.0;
    
    return {
      track,
      similarityScore: Number((sim + genreBoost).toFixed(4)),
    };
  });

  scoredTracks.sort((a, b) => b.similarityScore - a.similarityScore);
  return scoredTracks.slice(0, limit).map((item) => ({
    ...item.track.toObject(),
    similarityScore: item.similarityScore,
  }));
}

/**
 * Hybrid Recommendation for a specific user:
 * Combines Collaborative Filtering (User Listening History) + Content-Based Filtering
 */
async function getHybridRecommendationsForUser(userId, limit = 10) {
  // 1. Fetch user's recent liked or completed tracks
  const userHistory = await ListeningHistory.find({ userId })
    .sort({ listenedAt: -1 })
    .limit(20)
    .populate('trackId');

  const listenedTrackIds = new Set();
  const likedTrackIds = [];
  const completedTrackIds = [];

  userHistory.forEach((h) => {
    if (h.trackId) {
      listenedTrackIds.add(h.trackId._id.toString());
      if (h.action === 'like') likedTrackIds.push(h.trackId);
      if (h.completed) completedTrackIds.push(h.trackId);
    }
  });

  // If user has no listening history, return popular published tracks
  if (listenedTrackIds.size === 0) {
    return await Track.find({ status: 'published' })
      .sort({ playCount: -1, likesCount: -1 })
      .limit(limit)
      .populate('artistId', 'artistName avatar country city');
  }

  // 2. Compute user profile vector from favorite tracks
  const seedTracks = likedTrackIds.length > 0 ? likedTrackIds : completedTrackIds;
  const activeSeeds = seedTracks.length > 0 ? seedTracks : userHistory.map((h) => h.trackId).filter(Boolean);

  let avgVector = [0, 0, 0, 0, 0];
  let vectorCount = 0;

  activeSeeds.forEach((tr) => {
    if (tr && tr.audioFeatures) {
      const vec = featureToVector(tr.audioFeatures).slice(0, 5);
      for (let i = 0; i < 5; i++) {
        avgVector[i] += vec[i];
      }
      vectorCount++;
    }
  });

  if (vectorCount > 0) {
    avgVector = avgVector.map((v) => v / vectorCount);
  } else {
    avgVector = [0.6, 0.6, 0.5, 0.6, 0.3]; // default taste profile
  }

  // 3. Collaborative aspect: Tracks played by other users who also listened to seed tracks
  const otherListeners = await ListeningHistory.find({
    trackId: { $in: Array.from(listenedTrackIds) },
    userId: { $ne: userId },
  }).distinct('userId');

  const collaborativeTrackCounts = {};
  if (otherListeners.length > 0) {
    const coHistory = await ListeningHistory.find({
      userId: { $in: otherListeners },
      trackId: { $nin: Array.from(listenedTrackIds) },
    }).limit(100);

    coHistory.forEach((item) => {
      const id = item.trackId.toString();
      collaborativeTrackCounts[id] = (collaborativeTrackCounts[id] || 0) + 1;
    });
  }

  // 4. Score all candidate tracks
  const allCandidates = await Track.find({
    _id: { $nin: Array.from(listenedTrackIds) },
    status: 'published',
  }).populate('artistId', 'artistName avatar country city');

  const scoredCandidates = allCandidates.map((track) => {
    const vec = featureToVector(track.audioFeatures).slice(0, 5);
    const contentScore = cosineSimilarity(avgVector, vec);
    const collabCount = collaborativeTrackCounts[track._id.toString()] || 0;
    const collabScore = Math.min(collabCount / 5, 1.0); // max 1.0

    // Hybrid formula: 60% Content-Based + 40% Collaborative Filtering
    const hybridScore = 0.6 * contentScore + 0.4 * collabScore;

    return {
      track,
      hybridScore: Number(hybridScore.toFixed(4)),
      contentScore: Number(contentScore.toFixed(4)),
      collabScore: Number(collabScore.toFixed(4)),
    };
  });

  scoredCandidates.sort((a, b) => b.hybridScore - a.hybridScore);

  return scoredCandidates.slice(0, limit).map((item) => ({
    ...item.track.toObject(),
    recommendationMeta: {
      hybridScore: item.hybridScore,
      contentScore: item.contentScore,
      collabScore: item.collabScore,
    },
  }));
}

module.exports = {
  cosineSimilarity,
  featureToVector,
  getSimilarTracks,
  getHybridRecommendationsForUser,
};
