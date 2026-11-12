import React from 'react';
import { Play, Pause, Heart, Activity } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { Link } from 'react-router-dom';

export default function TrackCard({ track, queue = [] }) {
  const { currentTrack, isPlaying, playTrack, togglePlay, toggleLike, isLikedTrack } = usePlayer();

  const isCurrent = currentTrack?._id === track._id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  const isLiked = isLikedTrack(track._id);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queue.length > 0 ? queue : [track]);
    }
  };

  return (
    <div className="group liquid-glass-card rounded-[22px] p-3.5 flex flex-col justify-between relative shadow-lg transition-all duration-300">
      {/* Cover Image & Play Button Overlay */}
      <div className="relative aspect-square rounded-[16px] overflow-hidden mb-3 bg-black/40">
        <img
          src={
            track.coverUrl ||
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop'
          }
          alt={track.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Ambient Glass Highlight Line */}
        <div className="absolute inset-0 rounded-[16px] border border-white/20 pointer-events-none" />

        {/* Play Button Overlay */}
        <button
          onClick={handlePlayClick}
          className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 ${
            isCurrentlyPlaying
              ? 'opacity-100 scale-100 ring-2 ring-emerald-400'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 scale-95 hover:scale-105 hover:bg-white'
          }`}
        >
          {isCurrentlyPlaying ? (
            <Pause className="w-4 h-4 fill-black" />
          ) : (
            <Play className="w-4 h-4 fill-black ml-0.5" />
          )}
        </button>

        {/* Audio features mini chip */}
        {track.audioFeatures && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full liquid-glass-pill text-[10px] text-white/90 flex items-center gap-1 border border-white/20 font-mono">
            <Activity className="w-2.5 h-2.5 text-emerald-300" />
            <span>{Math.round(track.audioFeatures.tempo)} BPM</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/track/${track._id}`}
          className="text-xs font-bold text-white truncate block hover:text-emerald-300 transition-colors"
          title={track.title}
        >
          {track.title}
        </Link>
        <p className="text-[11px] text-white/60 truncate mt-0.5">
          {track.artistId?.artistName || track.artistName || 'Nghệ sĩ'}
        </p>

        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/10">
          <span className="text-[9px] font-medium px-2 py-0.5 rounded-full liquid-glass-inner text-white/70 border border-white/10">
            {track.genre || 'V-Pop'}
          </span>
          <button
            onClick={() => toggleLike(track._id)}
            className="text-white/40 hover:text-red-400 transition-colors p-1"
            title={isLiked ? 'Bỏ thích' : 'Yêu thích'}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isLiked ? 'fill-red-500 text-red-500 scale-110' : ''
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
