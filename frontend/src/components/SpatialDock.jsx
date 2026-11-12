import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  CircleDot,
  LayoutGrid,
  MapPin,
  Radio,
  Music2,
  Search,
  Sparkles,
  Settings,
} from 'lucide-react';

export default function SpatialDock() {
  const dockBtnClass = ({ isActive }) =>
    `w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 relative group ${
      isActive
        ? 'liquid-glass-pill-active text-white scale-105 shadow-[0_0_20px_rgba(255,255,255,0.4)]'
        : 'text-white/70 hover:text-white hover:bg-white/15 active:scale-95'
    }`;

  return (
    <div className="fixed left-5 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center">
      <div className="liquid-glass-dock rounded-full py-4 px-2 flex flex-col items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.65)]">
        {/* Mascot Logo Button */}
        <NavLink to="/" className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/30 p-1 bg-white/10 hover:scale-105 transition-transform group relative flex items-center justify-center" title="ratunes">
          <img src="/ratunes-logo.png" alt="ratunes" className="w-full h-full object-contain filter drop-shadow-sm" />
          <span className="absolute left-14 bg-black/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/15 z-50">
            ratunes Music
          </span>
        </NavLink>

        <span className="w-6 h-px bg-white/20" />

        {/* Home / Explore */}
        <NavLink to="/" className={dockBtnClass} title="Khám Phá / Home">
          <CircleDot className="w-5 h-5" />
          <span className="absolute left-14 bg-black/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/15 z-50">
            Khám Phá
          </span>
        </NavLink>

        {/* AI Playlist Studio */}
        <NavLink to="/ai-playlist" className={dockBtnClass} title="AI Studio (NLP)">
          <Sparkles className="w-5 h-5 text-emerald-300" />
          <span className="absolute left-14 bg-black/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/15 z-50">
            AI Playlist Studio
          </span>
        </NavLink>

        {/* GIS Map */}
        <NavLink to="/gis-map" className={dockBtnClass} title="Bản Đồ GIS Nghệ Sĩ">
          <MapPin className="w-5 h-5 text-teal-300" />
          <span className="absolute left-14 bg-black/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/15 z-50">
            Bản Đồ GIS Nghệ Sĩ
          </span>
        </NavLink>

        {/* Radio / Trending */}
        <NavLink to="/search?sort=popular" className={dockBtnClass} title="Trending / Radio">
          <Radio className="w-5 h-5 text-cyan-300" />
          <span className="absolute left-14 bg-black/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/15 z-50">
            Thịnh Hành & Radio
          </span>
        </NavLink>

        {/* Library / Playlists */}
        <NavLink to="/playlists" className={dockBtnClass} title="Thư Viện / Playlists">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
            <Music2 className="w-3.5 h-3.5 text-emerald-200" />
          </div>
          <span className="absolute left-14 bg-black/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/15 z-50">
            Danh Sách Phát
          </span>
        </NavLink>

        {/* Search */}
        <NavLink to="/search" className={dockBtnClass} title="Tìm Kiếm">
          <Search className="w-4 h-4" />
          <span className="absolute left-14 bg-black/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/15 z-50">
            Tìm Kiếm
          </span>
        </NavLink>

        <span className="w-6 h-px bg-white/20" />

        {/* Settings */}
        <NavLink to="/settings" className={dockBtnClass} title="Cài Đặt Hệ Thống">
          <Settings className="w-4 h-4 text-cyan-300" />
          <span className="absolute left-14 bg-black/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/15 z-50">
            Cài Đặt Hệ Thống
          </span>
        </NavLink>
      </div>
    </div>
  );
}
