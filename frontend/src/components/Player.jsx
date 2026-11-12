import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Music,
  Disc3,
} from 'lucide-react';

const formatTime = (secs) => {
  if (isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function Player() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    isLikedTrack,
  } = usePlayer();

  if (!currentTrack) {
    return (
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl z-50 pointer-events-none">
        <div className="liquid-glass-dock rounded-full px-6 py-3 flex items-center justify-between text-gray-300 pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/30 flex items-center justify-center flex-shrink-0">
              <img
                src="/ratunes-logo.jpg"
                alt="ratunes mascot"
                className="w-full h-full object-cover animate-pulse"
              />
            </div>
            <span className="text-xs text-white/90 font-medium">
               ratunes Spatial Audio • Chọn một bài hát bất kỳ để khởi tạo luồng âm thanh không gian 3D...
            </span>
          </div>
          <span className="text-[10px] text-white/80 bg-white/10 px-3 py-1 rounded-full border border-white/15">
            Spatial Audio Ready
          </span>
        </div>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[94%] max-w-5xl z-50 select-none">
      <div className="liquid-glass-player rounded-full px-5 py-2.5 flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-white/25">
        {/* Left: Track Information */}
        <div className="flex items-center gap-3.5 w-1/4 min-w-[200px]">
          <div className="relative group flex-shrink-0">
            <img
              src={
                currentTrack.coverUrl ||
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop'
              }
              alt={currentTrack.title}
              className={`w-12 h-12 rounded-full object-cover border-2 border-white/30 shadow-lg ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
            />
            <div className="absolute inset-0 rounded-full border border-white/40 pointer-events-none" />
          </div>

          <div className="truncate">
            <h4 className="text-xs font-bold text-white truncate hover:text-emerald-300 transition-colors cursor-pointer">
              {currentTrack.title}
            </h4>
            <p className="text-[11px] text-white/70 truncate mt-0.5">
              {currentTrack.artistId?.artistName || currentTrack.artistName || 'Nghệ sĩ'}
            </p>
          </div>

          <button
            onClick={() => toggleLike(currentTrack._id)}
            className="text-white/60 hover:text-red-400 transition-colors ml-1 p-1"
            title={isLikedTrack(currentTrack._id) ? 'Bỏ thích' : 'Yêu thích'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isLikedTrack(currentTrack._id) ? 'fill-red-500 text-red-500 scale-110' : ''
              }`}
            />
          </button>
        </div>

        {/* Center: Controls & Seek Bar */}
        <div className="flex flex-col items-center w-2/4 max-w-md">
          <div className="flex items-center gap-4 mb-1">
            <button
              onClick={toggleShuffle}
              className={`p-1 rounded-full transition-colors ${
                isShuffle ? 'text-emerald-300' : 'text-white/60 hover:text-white'
              }`}
              title="Trộn bài"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={prevTrack}
              className="text-white/80 hover:text-white transition-colors p-1"
              title="Bài trước"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)]"
              title={isPlaying ? 'Tạm dừng' : 'Phát'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="text-white/80 hover:text-white transition-colors p-1"
              title="Bài tiếp theo"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1 rounded-full transition-colors ${
                repeatMode !== 'off' ? 'text-emerald-300' : 'text-white/60 hover:text-white'
              }`}
              title="Lặp lại"
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-3.5 h-3.5" />
              ) : (
                <Repeat className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Progress Bar & Timers */}
          <div className="w-full flex items-center gap-2.5">
            <span className="text-[10px] text-white/60 w-8 text-right font-mono">
              {formatTime(currentTime)}
            </span>
            <div
              className="flex-1 h-1.5 bg-white/15 rounded-full relative cursor-pointer group backdrop-blur-md overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                seek(pct * duration);
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all relative"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-white/60 w-8 font-mono">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume & Spatial Wave Animation */}
        <div className="flex items-center justify-end gap-3.5 w-1/4 min-w-[180px]">
          {/* Spatial Equalizer Wave */}
          {isPlaying && (
            <div className="hidden lg:flex items-end gap-1 h-4 mr-2">
              <span className="w-0.5 bg-emerald-400 rounded-full animate-wave-1" />
              <span className="w-0.5 bg-teal-300 rounded-full animate-wave-2" />
              <span className="w-0.5 bg-emerald-400 rounded-full animate-wave-3" />
              <span className="w-0.5 bg-cyan-300 rounded-full animate-wave-4" />
            </div>
          )}

          <button
            onClick={toggleMute}
            className="text-white/70 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-white/20 rounded-full accent-white cursor-pointer"
          />

          <span className="text-[10px] font-semibold text-white/70 bg-white/10 px-2 py-0.5 rounded-full border border-white/15 hidden sm:inline">
            Spatial
          </span>
        </div>
      </div>
    </div>
  );
}
