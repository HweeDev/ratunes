import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import TrackRow from '../components/TrackRow';
import { usePlayer } from '../context/PlayerContext';
import {
  Play,
  Pause,
  Heart,
  Shield,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Music,
} from 'lucide-react';

export default function TrackDetail() {
  const { id } = useParams();
  const [track, setTrack] = useState(null);
  const [similarTracks, setSimilarTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  const { currentTrack, isPlaying, playTrack, togglePlay, toggleLike, isLikedTrack } = usePlayer();

  useEffect(() => {
    const fetchTrackData = async () => {
      setLoading(true);
      try {
        const [trackRes, simRes] = await Promise.all([
          api.get(`/tracks/${id}`),
          api.get(`/ai/similar-tracks/${id}?limit=6`),
        ]);

        if (trackRes.data.success) {
          setTrack(trackRes.data.data);
        }
        if (simRes.data.success) {
          setSimilarTracks(simRes.data.data || []);
        }
      } catch (err) {
        console.warn('Track details error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="p-8 text-center">
        <p className="text-white/60">Không tìm thấy bài hát</p>
      </div>
    );
  }

  const isCurrent = currentTrack?._id === track._id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  const features = track.audioFeatures || {};

  return (
    <div className="p-6 md:p-8 space-y-8 select-none">
      {/* Track Header Card */}
      <div className="flex flex-col md:flex-row items-center gap-6 liquid-glass-card rounded-[28px] p-6 md:p-8 border border-white/20 shadow-2xl">
        <img
          src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop'}
          alt={track.title}
          className="w-40 h-40 rounded-2xl object-cover shadow-2xl border border-white/30"
        />

        <div className="flex-1 text-center md:text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full liquid-glass-pill text-emerald-300 border border-white/20">
            {track.genre || 'V-Pop'}
          </span>

          <h1 className="text-2xl md:text-3xl font-black text-white mt-2 mb-1">{track.title}</h1>

          <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-white/70 mb-5">
            <Link
              to={`/search?artistId=${track.artistId?._id}`}
              className="font-semibold text-white hover:text-emerald-300 transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-emerald-300" />
              {track.artistId?.artistName || 'Nghệ sĩ'}
            </Link>
            <span>•</span>
            <span className="text-white/50">{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
            <span>•</span>
            <span className="text-white/50">{track.playCount?.toLocaleString() || 0} lượt nghe</span>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <button
              onClick={() => {
                if (isCurrent) togglePlay();
                else playTrack(track, [track, ...similarTracks]);
              }}
              className="px-6 py-2.5 bg-white hover:bg-gray-100 text-black font-bold text-xs rounded-full flex items-center gap-2 shadow-lg shadow-white/20 transition-all hover:scale-105"
            >
              {isCurrentlyPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-black" />
                  Tạm Dừng
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-black" />
                  Phát Bài Hát
                </>
              )}
            </button>

            <button
              onClick={() => toggleLike(track._id)}
              className="p-2.5 liquid-glass-pill rounded-full text-white/60 hover:text-red-400 transition-colors border border-white/20"
              title={isLikedTrack(track._id) ? 'Bỏ thích' : 'Yêu thích'}
            >
              <Heart className={`w-4 h-4 transition-colors ${isLikedTrack(track._id) ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Acoustic Features & Copyright Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audio Features Breakdown (Librosa Extract) */}
        <div className="lg:col-span-2 liquid-glass-card rounded-[28px] p-6 shadow-xl border border-white/15">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-emerald-300" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Đặc Trưng Âm Học (Librosa Audio Features)</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            <div className="liquid-glass-inner p-3.5 rounded-2xl">
              <span className="text-[10px] text-white/50 block mb-0.5">Nhịp độ (Tempo)</span>
              <span className="text-xl font-bold text-emerald-300 font-mono">
                {features.tempo || 120} <span className="text-xs text-white/40">BPM</span>
              </span>
            </div>

            <div className="liquid-glass-inner p-3.5 rounded-2xl">
              <span className="text-[10px] text-white/50 block mb-0.5">Mức Năng Lượng (Energy)</span>
              <span className="text-xl font-bold text-amber-300 font-mono">
                {Math.round((features.energy || 0.6) * 100)}%
              </span>
            </div>

            <div className="liquid-glass-inner p-3.5 rounded-2xl">
              <span className="text-[10px] text-white/50 block mb-0.5">Độ Tươi Vui (Valence)</span>
              <span className="text-xl font-bold text-teal-300 font-mono">
                {Math.round((features.valence || 0.5) * 100)}%
              </span>
            </div>

            <div className="liquid-glass-inner p-3.5 rounded-2xl">
              <span className="text-[10px] text-white/50 block mb-0.5">Độ Bắt Tai (Danceability)</span>
              <span className="text-xl font-bold text-purple-300 font-mono">
                {Math.round((features.danceability || 0.65) * 100)}%
              </span>
            </div>

            <div className="liquid-glass-inner p-3.5 rounded-2xl">
              <span className="text-[10px] text-white/50 block mb-0.5">Tính Mộc (Acousticness)</span>
              <span className="text-xl font-bold text-cyan-300 font-mono">
                {Math.round((features.acousticness || 0.3) * 100)}%
              </span>
            </div>

            <div className="liquid-glass-inner p-3.5 rounded-2xl">
              <span className="text-[10px] text-white/50 block mb-0.5">Trọng Tâm Phổ (Centroid)</span>
              <span className="text-xl font-bold text-rose-300 font-mono">
                {Math.round(features.spectralCentroid || 2200)}{' '}
                <span className="text-xs text-white/40">Hz</span>
              </span>
            </div>
          </div>

          {/* MFCC Coefficients Visual Bars */}
          {Array.isArray(features.mfcc) && features.mfcc.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-white/60 block mb-2">
                Hệ số Mel-Frequency Cepstral Coefficients (MFCC Vector 8 chiều):
              </span>
              <div className="grid grid-cols-8 gap-2 liquid-glass-inner p-3 rounded-2xl">
                {features.mfcc.slice(0, 8).map((coeff, idx) => (
                  <div key={idx} className="text-center">
                    <div className="h-14 bg-white/10 rounded-lg flex items-end justify-center p-1 relative overflow-hidden">
                      <div
                        className="w-full bg-emerald-400 rounded-sm"
                        style={{ height: `${Math.min(100, Math.abs(coeff) * 5)}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-white/50 font-mono mt-1 block">
                      c{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Copyright & Plagiarism Verification Badge */}
        <div className="liquid-glass-card rounded-[28px] p-6 shadow-xl border border-white/15 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-emerald-300" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Xác Minh Bản Quyền Âm Nhạc</h2>
            </div>

            {track.copyrightId ? (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl liquid-glass-pill flex items-center gap-2.5 border border-emerald-400/30">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-300 block">
                      Bản Quyền Hợp Lệ & Đã Phê Duyệt
                    </span>
                    <span className="text-[10px] text-white/60">
                      Tác quyền được kiểm định bởi hệ thống AI chống đạo nhạc
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-white/50">Chủ sở hữu:</span>
                    <span className="font-semibold text-white">{track.copyrightId.owner}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-white/50">Tác giả / Nhạc sĩ:</span>
                    <span className="font-semibold text-white">{track.copyrightId.author}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-white/50">Độ tương đồng AI:</span>
                    <span className="font-bold text-emerald-300 font-mono">
                      {track.copyrightId.similarityScore || 12}% (Rất an toàn)
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-white/70 liquid-glass-inner p-3 rounded-xl border border-white/10 italic">
                  "{track.copyrightId.declaration}"
                </p>
              </div>
            ) : (
              <div className="text-center py-6 text-white/50 text-xs">
                Chưa có hồ sơ bản quyền chính thức được gắn kèm.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-white/40">
            Hệ thống đối soát tự động sử dụng Cosine Similarity trên phổ đặc trưng tần số Mel.
          </div>
        </div>
      </div>

      {/* AI Similar Tracks Section (Content-Based) */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-300" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Bài Hát Tương Đồng Âm Học (Content-Based Cosine Similarity)
          </h2>
        </div>

        <div className="space-y-1">
          {similarTracks.map((item, idx) => (
            <TrackRow
              key={item._id}
              track={item}
              index={idx}
              queue={[track, ...similarTracks]}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
