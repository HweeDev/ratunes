import React from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const formatDuration = (seconds) => {
  if (!seconds) return '3:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function TrackRow({ track, index, queue = [] }) {
  const { currentTrack, isPlaying, playTrack, togglePlay, toggleLike, isLikedTrack } = usePlayer();

  const isCurrent = currentTrack?._id === track._id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  const isLiked = isLikedTrack(track._id);

  const handlePlayClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queue);
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/15 ${
        isCurrent ? 'liquid-glass-pill-active border-white/30' : ''
      }`}
    >
      {/* Index & Title */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-5 text-center text-xs text-white/50 font-mono">
          {isCurrentlyPlaying ? (
            <div className="flex items-end justify-center gap-0.5 h-3">
              <span className="w-0.5 bg-emerald-400 h-full animate-wave-1" />
              <span className="w-0.5 bg-teal-300 h-2/3 animate-wave-2" />
              <span className="w-0.5 bg-emerald-400 h-full animate-wave-3" />
            </div>
          ) : (
            <span className="group-hover:hidden">{index + 1}</span>
          )}
          <Play className="w-3.5 h-3.5 fill-white text-white hidden group-hover:block mx-auto" />
        </div>

        <img
          src={
            track.coverUrl ||
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop'
          }
          alt={track.title}
          className="w-10 h-10 rounded-xl object-cover border border-white/20 shadow-md"
        />

        <div className="truncate">
          <p
            className={`text-xs font-bold truncate ${
              isCurrent ? 'text-emerald-300' : 'text-white'
            }`}
          >
            {track.title}
          </p>
          <p className="text-[11px] text-white/60 truncate">
            {track.artistId?.artistName || track.artistName || 'Nghệ sĩ'}
          </p>
        </div>
      </div>

      {/* Genre & Audio Features badge */}
      <div className="hidden md:flex items-center gap-2 w-1/4">
        <span className="text-[10px] px-2.5 py-0.5 rounded-full liquid-glass-inner text-white/75 border border-white/15">
          {track.genre || 'V-Pop'}
        </span>
        {track.audioFeatures?.tempo && (
          <span className="text-[10px] text-white/50 font-mono">
            {Math.round(track.audioFeatures.tempo)} BPM
          </span>
        )}
      </div>

      {/* Play Count */}
      <div className="hidden lg:block text-[11px] text-white/60 w-24 text-right font-mono">
        {(track.playCount || 0).toLocaleString()} lượt
      </div>

      {/* Duration & Like */}
      <div className="flex items-center gap-3 w-24 justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(track._id);
          }}
          className="text-white/40 hover:text-red-400 transition-colors p-1"
          title={isLiked ? 'Bỏ thích' : 'Yêu thích'}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isLiked ? 'fill-red-500 text-red-500 scale-110' : ''
            }`}
          />
        </button>
        <span className="text-[11px] text-white/60 w-9 text-right font-mono">
          {formatDuration(track.duration)}
        </span>
      </div>
    </div>
  );
}
