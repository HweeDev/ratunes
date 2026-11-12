const axios = require('axios');
const Track = require('../models/Track');
const { cosineSimilarity, featureToVector } = require('./recommendationService');

/**
 * Checks audio similarity against all existing tracks in database to detect copyright infringement / plagiarism.
 */
async function checkAudioPlagiarism(targetFeatures, excludeTrackId = null, threshold = 0.85) {
  const pythonUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

  // Try Python AI Microservice first
  try {
    const res = await axios.post(
      `${pythonUrl}/detect-similarity`,
      {
        targetFeatures,
        excludeTrackId,
        threshold,
      },
      { timeout: 3000 }
    );
    if (res.data && res.data.success) {
      return res.data.data;
    }
  } catch (err) {
    // Fallback to internal vector comparison
  }

  // Internal Fallback Comparison
  const targetVector = featureToVector(targetFeatures);
  const query = { status: 'published' };
  if (excludeTrackId) {
    query._id = { $ne: excludeTrackId };
  }

  const existingTracks = await Track.find(query).populate('artistId', 'artistName');

  const matches = [];

  for (const track of existingTracks) {
    const candidateVector = featureToVector(track.audioFeatures);
    const minLen = Math.min(targetVector.length, candidateVector.length);
    const similarity = cosineSimilarity(
      targetVector.slice(0, minLen),
      candidateVector.slice(0, minLen)
    );

    const similarityPercentage = Math.round(similarity * 100);

    if (similarity >= threshold) {
      matches.push({
        trackId: track._id,
        trackTitle: track.title,
        artistName: track.artistId?.artistName || 'Unknown Artist',
        similarityScore: similarityPercentage,
        verdict: similarityPercentage >= 92 ? 'HIGH_RISK_PLAGIARISM' : 'POTENTIAL_SIMILARITY',
        matchedFeatures: {
          tempoDifference: Math.abs((targetFeatures.tempo || 120) - (track.audioFeatures?.tempo || 120)),
          energySimilarity: 1 - Math.abs((targetFeatures.energy || 0.5) - (track.audioFeatures?.energy || 0.5)),
        },
      });
    }
  }

  matches.sort((a, b) => b.similarityScore - a.similarityScore);

  return {
    hasPlagiarismWarning: matches.length > 0,
    highestSimilarity: matches.length > 0 ? matches[0].similarityScore : 0,
    matches,
    threshold: threshold * 100,
    checkedAgainstTotal: existingTracks.length,
    engine: 'Acoustic Feature Vector Comparison (Cosine Similarity & Spectral Envelope)',
  };
}

module.exports = {
  checkAudioPlagiarism,
};
