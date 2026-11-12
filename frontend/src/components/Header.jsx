import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, LogOut, LogIn, UserPlus, Sparkles, Settings, UploadCloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, isAuthenticated, logout, role, isRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="w-full flex items-center justify-between py-3 px-6 select-none z-30">
      {/* Brand & Apple Spatial Badge */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="liquid-glass-pill rounded-full pl-2 pr-4 py-1.5 flex items-center gap-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.4)] border border-white/25 hover:border-white/40 transition-all group"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center p-0.5 bg-white/10 border border-white/30 group-hover:scale-105 transition-transform">
            <img
              src="/ratunes-logo.png"
              alt="ratunes mascot"
              className="w-full h-full object-contain filter drop-shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold tracking-wide text-white">
              ratunes
            </span>
            <span className="h-3 w-px bg-white/25" />
            <span className="text-[11px] font-medium text-emerald-300">
               Spatial & GIS
            </span>
          </div>
        </Link>
      </div>

      {/* Global Quick Search Bar */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm bài hát, nghệ sĩ hoặc thể loại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full liquid-glass-inner rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors border border-white/15"
          />
        </div>
      </form>

      {/* Right User Actions */}
      <div className="flex items-center gap-2.5">
        {/* Prominent Artist Upload Button */}
        {(isRole('artist') || isRole('admin')) && (
          <Link
            to="/artist-studio"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
            title="Đăng tải tác phẩm âm nhạc mới"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Đăng Tải Nhạc</span>
          </Link>
        )}

        {/* Settings Navigation Link */}
        <Link
          to="/settings"
          className="w-8 h-8 rounded-full liquid-glass-pill flex items-center justify-center text-white/70 hover:text-white transition-colors"
          title="Cài đặt hệ thống & Giao diện"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-2.5">
            <Link
              to="/settings"
              className="liquid-glass-pill rounded-full pl-2 pr-3.5 py-1 flex items-center gap-2 border border-white/20 hover:border-white/40 transition-colors"
              title="Xem hồ sơ & Cài đặt"
            >
              <img
                src={
                  user.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
                }
                alt={user.username}
                className="w-7 h-7 rounded-full object-cover border border-white/40"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">
                  {user.username}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider ${
                    role === 'admin'
                      ? 'text-rose-300'
                      : role === 'artist'
                      ? 'text-blue-300'
                      : 'text-emerald-300'
                  }`}
                >
                  {role === 'admin' ? 'Admin' : role === 'artist' ? 'Artist' : 'User'}
                </span>
              </div>
            </Link>

            <button
              onClick={logout}
              className="w-8 h-8 rounded-full liquid-glass-pill flex items-center justify-center text-white/70 hover:text-red-300 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-1.5 text-xs font-semibold text-white/80 hover:text-white liquid-glass-pill rounded-full flex items-center gap-1.5 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              Đăng Nhập
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 text-xs font-bold text-black bg-white hover:bg-gray-100 rounded-full flex items-center gap-1.5 transition-colors shadow-lg shadow-white/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Đăng Ký
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
