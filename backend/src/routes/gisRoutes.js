const express = require('express');
const router = express.Router();
const {
  getArtistLocations,
  getArtistGeoJSON,
  getDensityStats,
} = require('../controllers/gisController');

router.get('/artists', getArtistLocations);
router.get('/geojson', getArtistGeoJSON);
router.get('/density-stats', getDensityStats);

module.exports = router;
