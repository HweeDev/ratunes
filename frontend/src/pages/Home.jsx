import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TrackCard from '../components/TrackCard';
import TrackRow from '../components/TrackRow';
import ArtistCard from '../components/ArtistCard';
import {
  Sparkles,
  Search,
  Radio,
  MapPin,
  Play,
  Flame,
  Disc3,
  SlidersHorizontal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';

export default function Home() {
  const [recommendations, setRecommendations] = useState([]);
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recRes, trendRes, artRes] = await Promise.all([
          api.get('/ai/recommendations?limit=8'),
          api.get('/tracks?sort=popular&limit=8'),
          api.get('/artists?limit=6'),
        ]);

        setRecommendations(recRes.data.data || []);
        setTrendingTracks(trendRes.data.data || []);
        setTopArtists(artRes.data.data || []);
      } catch (err) {
        console.warn('Data fetch notice:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 select-none">
      {/* Top Section matching user's image: Playlist Title & Spatial Search Bar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Playlist
            </h1>
            <p className="text-xs text-white/60">304 Playlist • Spatial Audio Experience</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/playlists')}
              className="w-8 h-8 rounded-full liquid-glass-pill flex items-center justify-center text-white/80 hover:text-white"
              title="Danh sách phát"
            >
              <Disc3 className="w-4 h-4 text-emerald-300" />
            </button>
          </div>
        </div>

        {/* Spatial Glass Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full mb-6">
          <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search in Albums, Tracks, Artists..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full liquid-glass-inner rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors shadow-inner"
          />
        </form>
      </div>

      {/* Featured Grid (Style as in reference image: Woh Pehli Dafa, Hollywood, The Egyptian, Lucky You...) */}
      <section>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-300" />
            Albums & Bản Ghi Nổi Bật
          </h2>
          <button
            onClick={() => navigate('/search')}
            className="text-[11px] text-emerald-300 hover:underline font-medium"
          >
            Xem tất cả
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {trendingTracks.slice(0, 4).map((track) => (
            <TrackCard key={track._id} track={track} queue={trendingTracks} />
          ))}
        </div>
      </section>

      {/* Hero Spatial Glass Banner */}
      <div className="relative rounded-[28px] overflow-hidden liquid-glass-card p-6 md:p-8 border border-white/20 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-emerald-300 text-[11px] font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            Apple Spatial UI & AI Music Intelligence
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-3">
            Âm Nhạc Đỉnh Cao, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
              Giao Diện Liquid Glass Mê Hoặc
            </span>
          </h2>

          <p className="text-xs text-white/70 mb-5 leading-relaxed">
            Trải nghiệm không gian âm nhạc sống động tích hợp AI phân tích cảm xúc tiếng Việt (NLP),
            gợi ý cá nhân hóa và bản đồ số địa lý GIS nghệ sĩ.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (trendingTracks.length > 0) {
                  playTrack(trendingTracks[0], trendingTracks);
                }
              }}
              className="px-5 py-2.5 bg-white hover:bg-gray-100 text-black font-bold text-xs rounded-full flex items-center gap-2 shadow-lg shadow-white/20 transition-transform hover:scale-105"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              Nghe Nhạc Ngay
            </button>

            <button
              onClick={() => navigate('/ai-playlist')}
              className="px-5 py-2.5 liquid-glass-pill text-white text-xs font-semibold rounded-full flex items-center gap-2 hover:bg-white/20 transition-all border border-white/25"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              AI Tạo Playlist
            </button>

            <button
              onClick={() => navigate('/gis-map')}
              className="px-5 py-2.5 liquid-glass-pill text-white text-xs font-semibold rounded-full flex items-center gap-2 hover:bg-white/20 transition-all border border-white/25"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-300" />
              Bản Đồ GIS
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: AI Hybrid Recommendations */}
      <section>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <h2 className="text-sm font-bold text-white">
              Gợi Ý Dành Riêng Cho Bạn (AI Hybrid)
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {recommendations.slice(0, 4).map((track) => (
            <TrackCard key={track._id} track={track} queue={recommendations} />
          ))}
        </div>
      </section>

      {/* Section 3: Trending Track Rows */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-bold text-white">Bảng Xếp Hạng Bài Hát</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {trendingTracks.slice(0, 6).map((track, idx) => (
            <TrackRow key={track._id} track={track} index={idx} queue={trendingTracks} />
          ))}
        </div>
      </section>

      {/* Section 4: Top Artists on GIS Map */}
      <section>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-300" />
            <h2 className="text-sm font-bold text-white">Nghệ Sĩ Nổi Bật Trên Bản Đồ GIS</h2>
          </div>
          <button
            onClick={() => navigate('/gis-map')}
            className="text-[11px] text-teal-300 hover:underline font-medium"
          >
            Mở Bản Đồ Nhiệt GIS →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {topArtists.map((artist) => (
            <ArtistCard key={artist._id} artist={artist} />
          ))}
        </div>
      </section>
    </div>
  );
}
