const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const trackRoutes = require('./routes/trackRoutes');
const artistRoutes = require('./routes/artistRoutes');
const albumRoutes = require('./routes/albumRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const historyRoutes = require('./routes/historyRoutes');
const copyrightRoutes = require('./routes/copyrightRoutes');
const distributionRoutes = require('./routes/distributionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const gisRoutes = require('./routes/gisRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// Database connection
connectDB().then(async () => {
  // Check if initial seeding is needed
  try {
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database] Database is empty. Running initial seeder...');
      const { seedDatabase } = require('./seed/seedData');
      await seedDatabase();
    }
  } catch (seedErr) {
    console.warn('[Database] Seeder check notice:', seedErr.message);
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files for uploaded audio & images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root route & Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Nền tảng phát nhạc trực tuyến AI & GIS',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/copyright', copyrightRoutes);
app.use('/api/distribution', distributionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/gis', gisRoutes);
app.use('/api/stats', statsRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Music Platform Backend running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
