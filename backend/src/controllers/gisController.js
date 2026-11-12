const Artist = require('../models/Artist');
const Track = require('../models/Track');

// @desc    Get all artist GIS locations and heatmap data
// @route   GET /api/gis/artists
// @access  Public
const getArtistLocations = async (req, res, next) => {
  try {
    const artists = await Artist.find().select(
      'artistName city country latitude longitude avatar monthlyListeners verified biography'
    );

    // Get track counts for each artist
    const artistIds = artists.map((a) => a._id);
    const trackCounts = await Track.aggregate([
      { $match: { artistId: { $in: artistIds }, status: 'published' } },
      { $group: { _id: '$artistId', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    trackCounts.forEach((tc) => {
      countMap[tc._id.toString()] = tc.count;
    });

    const markers = artists.map((a) => ({
      _id: a._id,
      name: a.artistName,
      city: a.city,
      country: a.country,
      coordinates: [a.latitude, a.longitude],
      latitude: a.latitude,
      longitude: a.longitude,
      avatar: a.avatar,
      biography: a.biography,
      monthlyListeners: a.monthlyListeners || 0,
      verified: a.verified,
      trackCount: countMap[a._id.toString()] || 0,
    }));

    // Heatmap data points: [latitude, longitude, intensity]
    // Intensity is normalized based on trackCount and monthlyListeners
    const heatmapPoints = markers.map((m) => {
      const weight = Math.min(1.0, 0.4 + (m.trackCount * 0.1) + ((m.monthlyListeners || 0) / 500000) * 0.5);
      return [m.latitude, m.longitude, Number(weight.toFixed(2))];
    });

    res.json({
      success: true,
      count: markers.length,
      data: {
        markers,
        heatmapPoints,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get GeoJSON of artists
// @route   GET /api/gis/geojson
// @access  Public
const getArtistGeoJSON = async (req, res, next) => {
  try {
    const artists = await Artist.find();

    const geoJSON = {
      type: 'FeatureCollection',
      features: artists.map((artist) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [artist.longitude, artist.latitude], // GeoJSON order: [lng, lat]
        },
        properties: {
          id: artist._id,
          name: artist.artistName,
          city: artist.city,
          country: artist.country,
          avatar: artist.avatar,
          monthlyListeners: artist.monthlyListeners,
        },
      })),
    };

    res.json(geoJSON);
  } catch (error) {
    next(error);
  }
};

// @desc    Get artist distribution statistics by city
// @route   GET /api/gis/density-stats
// @access  Public
const getDensityStats = async (req, res, next) => {
  try {
    const stats = await Artist.aggregate([
      {
        $group: {
          _id: '$city',
          count: { $sum: 1 },
          avgListeners: { $avg: '$monthlyListeners' },
          sampleCoords: { $first: { lat: '$latitude', lng: '$longitude' } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const totalArtists = await Artist.countDocuments();

    const formatted = stats.map((item) => ({
      city: item._id || 'Không xác định',
      artistCount: item.count,
      percentage: totalArtists > 0 ? Number(((item.count / totalArtists) * 100).toFixed(1)) : 0,
      avgListeners: Math.round(item.avgListeners || 0),
      coordinates: item.sampleCoords,
    }));

    res.json({
      success: true,
      totalArtists,
      cities: formatted,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getArtistLocations,
  getArtistGeoJSON,
  getDensityStats,
};
