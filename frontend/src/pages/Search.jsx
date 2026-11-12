import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import TrackRow from '../components/TrackRow';
import ArtistCard from '../components/ArtistCard';
import { Search as SearchIcon, Music, Users, Sparkles } from 'lucide-react';

const GENRES = ['All', 'V-Pop', 'Rap/Hip-hop', 'Indie', 'Ballad', 'EDM', 'R&B'];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialGenre = searchParams.get('genre') || 'All';
  const initialArtist = searchParams.get('artistId') || '';
  const searchType = searchParams.get('type') || searchParams.get('filter') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [sort, setSort] = useState('popular');
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setSelectedGenre(initialGenre);
  }, [initialGenre]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append('search', query);
        if (selectedGenre && selectedGenre !== 'All') params.append('genre', selectedGenre);
        if (initialArtist) params.append('artistId', initialArtist);
        if (sort) params.append('sort', sort);

        const artistUrl = query
          ? `/artists?search=${encodeURIComponent(query)}`
          : '/artists';

        const [tracksRes, artistsRes] = await Promise.all([
          api.get(`/tracks?${params.toString()}`),
          api.get(artistUrl),
        ]);

        setTracks(tracksRes.data.data || []);
        setArtists(artistsRes.data.data || []);
      } catch (err) {
        console.warn('Search query error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 200);
    return () => clearTimeout(timer);
  }, [query, selectedGenre, sort, initialArtist, searchType]);

  return (
    <div className="p-6 md:p-8 space-y-6 select-none">
      {/* Search Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-white mb-1.5 flex items-center gap-2">
          Tìm Kiếm Âm Nhạc & Nghệ Sĩ
        </h1>
        <p className="text-xs text-white/60 mb-5">
          Tra cứu tác phẩm theo giai điệu, ca sĩ, thể loại hoặc phân tích âm phổ
        </p>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Nhập tên bài hát hoặc ca sĩ bạn muốn nghe..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full liquid-glass-inner rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="liquid-glass-inner text-xs text-white/80 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-white/40 cursor-pointer border border-white/15"
            >
              <option value="popular" className="bg-[#0b1c26] text-white">Phổ biến nhất</option>
              <option value="latest" className="bg-[#0b1c26] text-white">Mới phát hành</option>
              <option value="likes" className="bg-[#0b1c26] text-white">Nhiều lượt thích</option>
            </select>
          </div>
        </div>

        {/* Genre Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedGenre === g
                  ? 'liquid-glass-pill-active text-white font-bold'
                  : 'liquid-glass-pill text-white/70 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Artists Result Section if matched or type === artists */}
      {artists.length > 0 && (query || searchType === 'artists') && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-teal-300" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              {searchType === 'artists' ? 'Danh Sách Nghệ Sĩ' : 'Nghệ Sĩ Liên Quan'} ({artists.length})
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {artists.map((artist) => (
              <ArtistCard key={artist._id} artist={artist} />
            ))}
          </div>
        </section>
      )}

      {/* Albums Result Section if type === albums */}
      {(searchType === 'albums' || searchType === 'album') && tracks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Albums & Tuyển Tập Âm Nhạc
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
            {tracks.slice(0, 10).map((tr) => (
              <div
                key={tr._id}
                className="liquid-glass-card rounded-2xl p-3 border border-white/10 hover:border-white/30 transition-all group cursor-pointer"
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-2 relative">
                  <img
                    src={tr.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop'}
                    alt={tr.album || tr.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/60 text-[9px] text-white backdrop-blur-sm">
                    {tr.genre}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white truncate">{tr.album || `${tr.title} (Single)`}</h3>
                <p className="text-[10px] text-white/60 truncate">{tr.artist?.name || tr.author || 'Nghệ sĩ'}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tracks List */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-emerald-300" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Kết Quả Bài Hát ({tracks.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tracks.length > 0 ? (
          <div className="space-y-1">
            {tracks.map((track, idx) => (
              <TrackRow key={track._id} track={track} index={idx} queue={tracks} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 liquid-glass-inner rounded-3xl border border-white/10">
            <p className="text-xs text-white/50">Không tìm thấy bài hát nào phù hợp với từ khóa này.</p>
          </div>
        )}
      </section>
    </div>
  );
}
