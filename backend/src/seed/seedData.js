const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Artist = require('../models/Artist');
const Track = require('../models/Track');
const Album = require('../models/Album');
const Playlist = require('../models/Playlist');
const ListeningHistory = require('../models/ListeningHistory');
const Copyright = require('../models/Copyright');
const Distribution = require('../models/Distribution');

// High-reliability royalty-free audio streams for smooth preview playback
const SAMPLE_AUDIOS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
];

async function seedDatabase() {
  try {
    console.log('[Seeder] Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Artist.deleteMany({}),
      Track.deleteMany({}),
      Album.deleteMany({}),
      Playlist.deleteMany({}),
      ListeningHistory.deleteMany({}),
      Copyright.deleteMany({}),
      Distribution.deleteMany({}),
    ]);

    console.log('[Seeder] Creating users & roles...');
    const rawDefaultPassword = '123456';

    // 1. Create Admin
    const adminUser = await User.create({
      username: 'admin_sys',
      email: 'admin@musicai.vn',
      password: rawDefaultPassword,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300&fit=crop',
    });

    // 2. Create Regular User
    const regularUser = await User.create({
      username: 'nguyen_van_a',
      email: 'user@musicai.vn',
      password: rawDefaultPassword,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
    });

    // 3. Create Artist Users & Profiles with real GIS coordinates across Vietnam
    const artistSeedData = [
      {
        username: 'sontungmtp',
        email: 'sontung@musicai.vn',
        artistName: 'Sơn Tùng M-TP',
        city: 'TP. Hồ Chí Minh',
        country: 'Vietnam',
        latitude: 10.7769,
        longitude: 106.7009,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        monthlyListeners: 2450000,
        biography: 'Ca sĩ kiêm nhạc sĩ V-Pop hàng đầu với phong cách hiện đại và hàng loạt bản hit kỷ lục.',
      },
      {
        username: 'denvau',
        email: 'denvau@musicai.vn',
        artistName: 'Đen Vâu',
        city: 'Quảng Ninh',
        country: 'Vietnam',
        latitude: 20.9505,
        longitude: 107.0734,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
        monthlyListeners: 1850000,
        biography: 'Rapper mang phong cách mộc mạc, triết lý sống và ca từ chân thật chạm đến hàng triệu con tim.',
      },
      {
        username: 'hoangthuylinh',
        email: 'hoangthuylinh@musicai.vn',
        artistName: 'Hoàng Thùy Linh',
        city: 'Hà Nội',
        country: 'Vietnam',
        latitude: 21.0285,
        longitude: 105.8542,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
        monthlyListeners: 1520000,
        biography: 'Tiên phong kết hợp âm nhạc dân gian đương đại Việt Nam với âm hưởng điện tử thế giới.',
      },
      {
        username: 'vu_official',
        email: 'vu@musicai.vn',
        artistName: 'Vũ.',
        city: 'Hà Nội',
        country: 'Vietnam',
        latitude: 21.0333,
        longitude: 105.85,
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop',
        monthlyListeners: 1200000,
        biography: 'Hoàng tử Indie Việt Nam với chất giọng ấm áp và những bản tình ca mộc mạc làm say lòng người.',
      },
      {
        username: 'mytam',
        email: 'mytam@musicai.vn',
        artistName: 'Mỹ Tâm',
        city: 'Đà Nẵng',
        country: 'Vietnam',
        latitude: 16.0544,
        longitude: 108.2022,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
        monthlyListeners: 1980000,
        biography: 'Họa mi tóc nâu, biểu tượng âm nhạc Việt Nam với sự nghiệp bền bỉ và giọng hát truyền cảm.',
      },
      {
        username: 'suboi',
        email: 'suboi@musicai.vn',
        artistName: 'Suboi',
        city: 'TP. Hồ Chí Minh',
        country: 'Vietnam',
        latitude: 10.8231,
        longitude: 106.6297,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
        monthlyListeners: 920000,
        biography: 'Nữ hoàng Hip-hop Việt Nam với kỹ năng rap đỉnh cao và phong cách phóng khoáng.',
      },
      {
        username: 'phanmanhquynh',
        email: 'quynh@musicai.vn',
        artistName: 'Phan Mạnh Quỳnh',
        city: 'Nghệ An',
        country: 'Vietnam',
        latitude: 18.6796,
        longitude: 105.6813,
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
        monthlyListeners: 1350000,
        biography: 'Nhạc sĩ kể chuyện bậc thầy với những giai điệu đậm chất văn hóa dân gian và lời tự sự sâu sắc.',
      },
      {
        username: 'chillies_band',
        email: 'chillies@musicai.vn',
        artistName: 'Chillies',
        city: 'Cần Thơ',
        country: 'Vietnam',
        latitude: 10.0452,
        longitude: 105.7469,
        avatar: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=400&h=400&fit=crop',
        monthlyListeners: 1150000,
        biography: 'Ban nhạc Pop-Rock đầy cảm xúc với những ca khúc làm thổn thức thế hệ trẻ.',
      },
    ];

    const createdArtists = [];

    for (const art of artistSeedData) {
      const user = await User.create({
        username: art.username,
        email: art.email,
        password: rawDefaultPassword,
        role: 'artist',
        avatar: art.avatar,
      });

      const artist = await Artist.create({
        userId: user._id,
        artistName: art.artistName,
        biography: art.biography,
        country: art.country,
        city: art.city,
        latitude: art.latitude,
        longitude: art.longitude,
        avatar: art.avatar,
        monthlyListeners: art.monthlyListeners,
        verified: true,
      });

      createdArtists.push(artist);
    }

    console.log(`[Seeder] Created ${createdArtists.length} artists with GIS coordinates.`);

    // 4. Create Tracks with detailed Audio Features
    const trackSeedData = [
      {
        title: 'Chúng Ta Của Hiện Tại',
        artistIndex: 0, // Sơn Tùng
        genre: 'V-Pop',
        duration: 301,
        coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&h=500&fit=crop',
        audioUrl: SAMPLE_AUDIOS[0],
        playCount: 154200,
        likesCount: 12450,
        audioFeatures: {
          tempo: 105,
          energy: 0.62,
          valence: 0.45,
          danceability: 0.58,
          acousticness: 0.42,
          spectralCentroid: 2100,
          zeroCrossingRate: 0.065,
          mfcc: [14.2, -6.1, 7.8, -3.2, 4.1, -1.9, 2.5, 0.8],
        },
      },
      {
        title: 'Nấu Ăn Cho Em',
        artistIndex: 1, // Đen Vâu
        genre: 'Rap/Hip-hop',
        duration: 254,
        coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',
        audioUrl: SAMPLE_AUDIOS[1],
        playCount: 198000,
        likesCount: 18900,
        audioFeatures: {
          tempo: 92,
          energy: 0.55,
          valence: 0.68,
          danceability: 0.72,
          acousticness: 0.65,
          spectralCentroid: 1850,
          zeroCrossingRate: 0.052,
          mfcc: [11.5, -4.5, 6.2, -2.1, 3.8, -1.2, 1.9, 0.4],
        },
      },
      {
        title: 'See Tình',
        artistIndex: 2, // Hoàng Thùy Linh
        genre: 'V-Pop',
        duration: 195,
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop',
        audioUrl: SAMPLE_AUDIOS[2],
        playCount: 320500,
        likesCount: 34100,
        audioFeatures: {
          tempo: 128,
          energy: 0.85,
          valence: 0.88,
          danceability: 0.82,
          acousticness: 0.18,
          spectralCentroid: 2800,
          zeroCrossingRate: 0.098,
          mfcc: [18.4, -8.2, 10.5, -4.5, 6.2, -2.8, 4.1, 1.2],
        },
      },
      {
        title: 'Bước Qua Mùa Cô Đơn',
        artistIndex: 3, // Vũ.
        genre: 'Indie',
        duration: 278,
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop',
        audioUrl: SAMPLE_AUDIOS[3],
        playCount: 142000,
        likesCount: 15300,
        audioFeatures: {
          tempo: 78,
          energy: 0.38,
          valence: 0.28,
          danceability: 0.44,
          acousticness: 0.82,
          spectralCentroid: 1450,
          zeroCrossingRate: 0.041,
          mfcc: [8.5, -2.8, 4.2, -1.5, 2.4, -0.9, 1.2, 0.3],
        },
      },
      {
        title: 'Ước Gì',
        artistIndex: 4, // Mỹ Tâm
        genre: 'Ballad',
        duration: 320,
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop',
        audioUrl: SAMPLE_AUDIOS[4],
        playCount: 210000,
        likesCount: 22400,
        audioFeatures: {
          tempo: 82,
          energy: 0.42,
          valence: 0.35,
          danceability: 0.48,
          acousticness: 0.75,
          spectralCentroid: 1600,
          zeroCrossingRate: 0.048,
          mfcc: [9.8, -3.2, 5.1, -1.8, 2.9, -1.1, 1.5, 0.4],
        },
      },
      {
        title: 'N-Sao?',
        artistIndex: 5, // Suboi
        genre: 'Rap/Hip-hop',
        duration: 210,
        coverUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&h=500&fit=crop',
        audioUrl: SAMPLE_AUDIOS[5],
        playCount: 88500,
        likesCount: 7900,
        audioFeatures: {
          tempo: 135,
          energy: 0.88,
          valence: 0.65,
          danceability: 0.86,
          acousticness: 0.12,
          spectralCentroid: 2950,
          zeroCrossingRate: 0.112,
          mfcc: [19.2, -8.9, 11.2, -5.1, 6.8, -3.1, 4.5, 1.4],
        },
      },
      {
        title: 'Có Chàng Trai Viết Lên Cây',
        artistIndex: 6, // Phan Mạnh Quỳnh
        genre: 'Ballad',
        duration: 315,
        coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=500&fit=crop',
        audioUrl: SAMPLE_AUDIOS[6],
        playCount: 175000,
        likesCount: 16800,
        audioFeatures: {
          tempo: 86,
          energy: 0.45,
          valence: 0.32,
          danceability: 0.52,
          acousticness: 0.78,
          spectralCentroid: 1720,
          zeroCrossingRate: 0.051,
          mfcc: [10.2, -3.5, 5.8, -2.0, 3.2, -1.3, 1.7, 0.5],
        },
      },
      {
        title: 'Mascara',
        artistIndex: 7, // Chillies
        genre: 'Indie',
        duration: 260,
        coverUrl: 'https://images.unsplash.com/photo-1445985543469-433ecba627a0?w=500&h=500&fit=crop',
        audioUrl: SAMPLE_AUDIOS[7],
        playCount: 135000,
        likesCount: 14200,
        audioFeatures: {
          tempo: 96,
          energy: 0.68,
          valence: 0.52,
          danceability: 0.62,
          acousticness: 0.45,
          spectralCentroid: 2300,
          zeroCrossingRate: 0.075,
          mfcc: [13.5, -5.4, 7.2, -2.9, 4.5, -1.8, 2.8, 0.9],
        },
      },
      {
        title: 'Lạc Trôi',
        artistIndex: 0, // Sơn Tùng
        genre: 'V-Pop',
        duration: 235,
        coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&h=500&fit=crop',
        audioUrl: SAMPLE_AUDIOS[0],
        playCount: 289000,
        likesCount: 29000,
        audioFeatures: {
          tempo: 122,
          energy: 0.82,
          valence: 0.62,
          danceability: 0.74,
          acousticness: 0.25,
          spectralCentroid: 2650,
          zeroCrossingRate: 0.088,
          mfcc: [16.8, -7.5, 9.4, -3.9, 5.7, -2.4, 3.8, 1.1],
        },
      },
      {
        title: 'Đi Về Nhà',
        artistIndex: 1, // Đen Vâu
        genre: 'Rap/Hip-hop',
        duration: 215,
        coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',
        audioUrl: SAMPLE_AUDIOS[1],
        playCount: 220000,
        likesCount: 24500,
        audioFeatures: {
          tempo: 108,
          energy: 0.68,
          valence: 0.78,
          danceability: 0.76,
          acousticness: 0.48,
          spectralCentroid: 2250,
          zeroCrossingRate: 0.072,
          mfcc: [14.0, -5.8, 7.9, -3.1, 4.6, -1.9, 2.9, 0.8],
        },
      },
    ];

    const createdTracks = [];

    for (let idx = 0; idx < trackSeedData.length; idx++) {
      const t = trackSeedData[idx];
      const artist = createdArtists[t.artistIndex];
      const isrcCode = `VN-MTP-${(20 + idx).toString()}-${String(1000 + idx).padStart(5, '0')}`;
      const recordLabelName = idx % 2 === 0 ? 'M-TP Entertainment / Universal Music VN' : 'Đen Vâu Music / Def Jam SEA';
      const copyrightText = `Cam kết toàn quyền tác giả và quyền liên quan đối với tác phẩm "${t.title}". Mã ISRC: ${isrcCode}`;

      const track = await Track.create({
        title: t.title,
        artistId: artist._id,
        genre: t.genre,
        duration: t.duration,
        coverUrl: t.coverUrl,
        audioUrl: t.audioUrl,
        playCount: t.playCount,
        likesCount: t.likesCount,
        audioFeatures: t.audioFeatures,
        status: 'published',
        recordLabel: recordLabelName,
        copyrightDeclaration: copyrightText,
        isrc: isrcCode,
        releaseNotes: 'Bản thu Master kỹ thuật số chuẩn phòng thu 24-bit/48kHz.',
      });

      // Create Copyright record
      const copyright = await Copyright.create({
        trackId: track._id,
        owner: artist.artistName,
        author: artist.artistName,
        declaration: copyrightText,
        status: 'approved',
        similarityScore: 12, // low similarity = clean original
      });

      track.copyrightId = copyright._id;
      await track.save();

      createdTracks.push(track);
    }

    console.log(`[Seeder] Created ${createdTracks.length} tracks with AI audio features & copyright.`);

    // 5. Create Sample Albums
    const album1 = await Album.create({
      title: 'Tuyển Tập Sơn Tùng M-TP',
      artistId: createdArtists[0]._id,
      coverUrl: createdTracks[0].coverUrl,
      description: 'Các ca khúc đình đám làm nên tên tuổi Sơn Tùng M-TP.',
      tracks: [createdTracks[0]._id, createdTracks[8]._id],
    });

    const album2 = await Album.create({
      title: 'Những Bài Ca Mộc Mạc',
      artistId: createdArtists[1]._id,
      coverUrl: createdTracks[1].coverUrl,
      description: 'Những câu chuyện đời thường qua góc nhìn rap mộc mạc của Đen.',
      tracks: [createdTracks[1]._id, createdTracks[9]._id],
    });

    // 6. Create Playlists
    await Playlist.create({
      userId: regularUser._id,
      name: 'V-Pop Chill & Lofi Buổi Tối',
      description: 'Những giai điệu êm dịu nhất để thư giãn sau ngày dài học tập và làm việc.',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',
      tracks: [createdTracks[3]._id, createdTracks[4]._id, createdTracks[6]._id, createdTracks[7]._id],
      isPublic: true,
    });

    await Playlist.create({
      userId: regularUser._id,
      name: 'Năng Lượng Bùng Nổ Cuối Tuần',
      description: 'Tuyển tập bản nhạc sôi động, nhịp điệu nhanh giúp tiếp thêm năng lượng.',
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop',
      tracks: [createdTracks[2]._id, createdTracks[5]._id, createdTracks[8]._id],
      isPublic: true,
    });

    // 7. Create Listening History for Collaborative Filtering
    for (let i = 0; i < 5; i++) {
      await ListeningHistory.create({
        userId: regularUser._id,
        trackId: createdTracks[i]._id,
        duration: createdTracks[i].duration,
        completed: true,
        action: i % 2 === 0 ? 'like' : 'play',
      });
    }

    // 8. Create Sample Distributions
    await Distribution.create({
      artistId: createdArtists[0]._id,
      releaseId: `REL-ST-${Date.now()}`,
      releaseTitle: 'Chúng Ta Của Hiện Tại (Single)',
      platforms: ['Spotify', 'Apple Music', 'YouTube Music', 'TikTok', 'Zing MP3'],
      status: 'approved',
      processedAt: new Date(),
    });

    await Distribution.create({
      artistId: createdArtists[1]._id,
      releaseId: `REL-DEN-${Date.now()}`,
      releaseTitle: 'Nấu Ăn Cho Em (Single)',
      platforms: ['Spotify', 'Apple Music', 'YouTube Music'],
      status: 'processing',
    });

    console.log('[Seeder] ========================================');
    console.log('[Seeder] Database seeding completed successfully!');
    console.log('[Seeder] Credentials:');
    console.log('         Admin:  admin@musicai.vn / 123456');
    console.log('         Artist: sontung@musicai.vn / 123456');
    console.log('         User:   user@musicai.vn / 123456');
    console.log('[Seeder] ========================================');
  } catch (err) {
    console.error('[Seeder] Error during seeding:', err);
  }
}

// If executed directly from CLI: node src/seed/seedData.js
if (require.main === module) {
  const connectDB = require('../config/db');
  connectDB().then(async () => {
    await seedDatabase();
    process.exit(0);
  });
}

module.exports = { seedDatabase };
