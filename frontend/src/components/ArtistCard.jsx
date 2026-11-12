import React from 'react';
import { MapPin, Users, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ArtistCard({ artist }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/search?artistId=${artist._id}`)}
      className="group liquid-glass-card rounded-[24px] p-4 text-center cursor-pointer transition-all duration-300 flex flex-col items-center"
    >
      <div className="relative mb-2.5">
        <img
          src={
            artist.avatar ||
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop'
          }
          alt={artist.artistName}
          className="w-24 h-24 rounded-full object-cover group-hover:scale-105 transition-transform duration-300 border-2 border-white/30 group-hover:border-emerald-300 shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
        />
        {artist.verified && (
          <div
            className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-md rounded-full p-0.5 border border-white/30"
            title="Đã xác minh"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          </div>
        )}
      </div>

      <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate max-w-full">
        {artist.artistName}
      </h4>

      <p className="text-[11px] text-white/60 flex items-center gap-1 mt-0.5">
        <MapPin className="w-3 h-3 text-emerald-300" />
        {artist.city}
      </p>

      <div className="mt-2 text-[10px] text-white/50 flex items-center gap-1 font-mono">
        <Users className="w-3 h-3 text-white/50" />
        <span>{(artist.monthlyListeners || 0).toLocaleString()} người nghe</span>
      </div>
    </div>
  );
}
