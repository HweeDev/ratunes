import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Clock,
  Mic2,
  Disc3,
  Music,
  Heart,
  Sparkles,
  ListMusic,
  MoreHorizontal,
  ChevronDown,
  ShieldCheck,
  MapPin,
  Flame,
  Settings,
  UploadCloud,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, role, isRole } = useAuth();
  const [playlistOpen, setPlaylistOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const currentType = searchParams.get('type') || '';
  const currentFilter = searchParams.get('filter') || '';

  const isArtistActive = location.pathname === '/search' && currentType === 'artists';
  const isAlbumsActive =
    location.pathname === '/search' &&
    (currentType === 'albums' || currentFilter === 'albums');
  const isSongsActive =
    location.pathname === '/search' &&
    (currentType === 'songs' ||
      (!currentType && !currentFilter && !searchParams.get('genre')));

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
      isActive
        ? 'liquid-glass-pill-active text-white font-semibold'
        : 'text-white/70 hover:text-white hover:bg-white/10'
    }`;

  const customNavClass = (isActive) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
      isActive
        ? 'liquid-glass-pill-active text-white font-semibold'
        : 'text-white/70 hover:text-white hover:bg-white/10'
    }`;

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-full border-r border-white/10 select-none p-4 overflow-y-auto">
      {/* Brand & Mascot */}
      <Link to="/" className="flex items-center gap-3 mb-4 px-1 pb-3 border-b border-white/10 group">
        <div className="w-11 h-11 rounded-2xl liquid-glass-pill flex items-center justify-center p-1 border border-white/30 shadow-lg group-hover:scale-105 transition-transform duration-300">
          <img
            src="/ratunes-logo.png"
            alt="ratunes logo"
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1">
            ratunes
          </h1>
          <p className="text-[10px] text-cyan-300 font-semibold truncate tracking-wider uppercase">Spatial & AI Music</p>
        </div>
      </Link>

      {/* Prominent Artist Upload CTA */}
      {(isRole('artist') || isRole('admin')) && (
        <button
          onClick={() => navigate('/artist-studio')}
          className="w-full mb-4 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02]"
        >
          <UploadCloud className="w-4 h-4 text-black" />
          <span>Đăng Tải Nhạc</span>
        </button>
      )}

      {/* Library Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            Library
          </h2>
          <p className="text-[11px] text-white/50">All Music</p>
        </div>
        <button
          onClick={() => navigate('/playlists')}
          className="w-7 h-7 rounded-full liquid-glass-pill flex items-center justify-center text-white/70 hover:text-white"
          title="Tùy chọn thư viện"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Library Nav List */}
      <div className="space-y-1 mb-5">
        <NavLink to="/history" className={navClass}>
          <Clock className="w-4 h-4 text-emerald-300" />
          <span>Recently Added</span>
        </NavLink>

        <Link to="/search?type=artists" className={customNavClass(isArtistActive)}>
          <Mic2 className="w-4 h-4 text-teal-300" />
          <span>Artist</span>
        </Link>

        <Link to="/search?type=albums" className={customNavClass(isAlbumsActive)}>
          <Disc3 className="w-4 h-4 text-cyan-300" />
          <span>Albums</span>
        </Link>

        <Link to="/search?type=songs" className={customNavClass(isSongsActive)}>
          <Music className="w-4 h-4 text-sky-300" />
          <span>Songs</span>
        </Link>

        <NavLink to="/ai-playlist" className={navClass}>
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span>Made for You</span>
        </NavLink>

        <NavLink to="/settings" className={navClass}>
          <Settings className="w-4 h-4 text-gray-300" />
          <span>Cài Đặt Hệ Thống</span>
        </NavLink>
      </div>

      {/* Playlists Section */}
      <div className="mb-5 flex-1">
        <div
          onClick={() => setPlaylistOpen(!playlistOpen)}
          className="flex items-center justify-between text-[11px] font-bold text-white/60 uppercase tracking-wider mb-2 px-1 cursor-pointer hover:text-white transition-colors"
        >
          <span>Playlist</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${playlistOpen ? '' : '-rotate-90'}`}
          />
        </div>

        {playlistOpen && (
          <div className="space-y-1">
            <NavLink to="/playlists" className={navClass}>
              <ListMusic className="w-3.5 h-3.5" />
              <span>All Playlists</span>
            </NavLink>

            <NavLink to="/playlists" className={navClass}>
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500" />
              <span>Bài Hát Đã Thích</span>
            </NavLink>

            <NavLink
              to="/ai-playlist?mood=chill"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs transition-colors ${
                  isActive
                    ? 'liquid-glass-pill-active text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <img
                src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=50&h=50&fit=crop"
                className="w-5 h-5 rounded-md object-cover border border-white/20"
                alt="cover"
              />
              <span className="truncate">Good Vibes Only</span>
            </NavLink>

            <NavLink
              to="/ai-playlist?mood=focus"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs transition-colors ${
                  isActive
                    ? 'liquid-glass-pill-active text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <img
                src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=50&h=50&fit=crop"
                className="w-5 h-5 rounded-md object-cover border border-white/20"
                alt="cover"
              />
              <span className="truncate">AI Mood Chill</span>
            </NavLink>

            <NavLink
              to="/search?genre=V-Pop"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs transition-colors ${
                  isActive
                    ? 'liquid-glass-pill-active text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <img
                src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=50&h=50&fit=crop"
                className="w-5 h-5 rounded-md object-cover border border-white/20"
                alt="cover"
              />
              <span className="truncate">V-Pop Hits 2026</span>
            </NavLink>
          </div>
        )}
      </div>

      {/* Special RBAC Management Links */}
      {(isRole('artist') || isRole('admin')) && (
        <div className="pt-3 border-t border-white/10 space-y-1 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 px-1 mb-1">
            Chuyên Sâu
          </p>

          <NavLink to="/artist-studio" className={navClass}>
            <Mic2 className="w-3.5 h-3.5 text-blue-300" />
            <span>Kênh Nghệ Sĩ</span>
          </NavLink>

          {role === 'admin' && (
            <NavLink to="/admin" className={navClass}>
              <ShieldCheck className="w-3.5 h-3.5 text-rose-300" />
              <span>Quản Trị Hệ Thống</span>
            </NavLink>
          )}
        </div>
      )}

      {/* Mini Profile Card */}
      <div
        onClick={() => navigate('/settings')}
        className="liquid-glass-pill rounded-2xl p-2.5 flex items-center gap-2.5 border border-white/20 cursor-pointer hover:border-white/40 transition-colors"
        title="Nhấn để mở Cài đặt hồ sơ"
      >
        <img
          src={
            user?.avatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
          }
          alt={user?.username || 'Guest'}
          className="w-8 h-8 rounded-full object-cover border border-white/40"
        />
        <div className="truncate flex-1">
          <p className="text-xs font-bold text-white truncate">
            {user?.username || 'Khách vãng lai'}
          </p>
          <span className="text-[9px] text-white/70 capitalize block">
            {role === 'admin'
              ? '🛡️ Quản trị viên'
              : role === 'artist'
              ? '🎤 Nghệ sĩ'
              : '🎧 Người nghe'}
          </span>
        </div>
      </div>
    </aside>
  );
}
