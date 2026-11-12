import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TrackRow from '../components/TrackRow';
import { History as HistoryIcon, Trash2, CheckCircle2, Clock, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

export default function History() {
  const { isAuthenticated } = useAuth();
  const { playTrack } = usePlayer();
  const [historyItems, setHistoryItems] = useState([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/history?limit=50');
      if (res.data.success) {
        setHistoryItems(res.data.data || []);
        setCompletionRate(res.data.completionRate || 0);
      }
    } catch (err) {
      console.warn('History fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ lịch sử nghe nhạc?')) return;
    try {
      await api.delete('/history');
      setHistoryItems([]);
      setCompletionRate(0);
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full liquid-glass-pill flex items-center justify-center mb-3">
          <HistoryIcon className="w-8 h-8 text-white/50" />
        </div>
        <h2 className="text-base font-bold text-white mb-1">Đăng Nhập Để Lưu Lịch Sử Nghe</h2>
        <p className="text-xs text-white/60 max-w-sm">
          Hệ thống sẽ tự động ghi nhận bài hát bạn đã nghe, tỷ lệ hoàn thành và sở thích cá nhân.
        </p>
      </div>
    );
  }

  const tracksOnly = historyItems.map((h) => h.trackId).filter(Boolean);

  return (
    <div className="p-6 md:p-8 space-y-6 select-none">
      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white">Lịch Sử Nghe Nhạc Của Bạn</h1>
          <p className="text-xs text-white/60">
            Dữ liệu hành vi được sử dụng để tối ưu hóa hệ thống gợi ý Collaborative Filtering
          </p>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="px-4 py-2 text-xs font-semibold text-rose-300 hover:text-white liquid-glass-pill border border-rose-500/30 rounded-full flex items-center gap-1.5 transition-colors self-start"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa Toàn Bộ Lịch Sử
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="liquid-glass-card p-4 rounded-2xl">
          <span className="text-[11px] text-white/50 block">Tổng Bài Đã Nghe</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">
            {historyItems.length}
          </span>
        </div>

        <div className="liquid-glass-card p-4 rounded-2xl">
          <span className="text-[11px] text-white/50 block">Tỷ Lệ Nghe Trọn Vẹn</span>
          <span className="text-2xl font-black text-emerald-300 font-mono mt-1 block">
            {completionRate}%
          </span>
        </div>

        <div className="liquid-glass-card p-4 rounded-2xl">
          <span className="text-[11px] text-white/50 block">Lượt Yêu Thích</span>
          <span className="text-2xl font-black text-rose-300 font-mono mt-1 block">
            {historyItems.filter((h) => h.action === 'like').length}
          </span>
        </div>
      </div>

      {/* History Track List */}
      <div className="liquid-glass-card rounded-[28px] p-6 shadow-xl border border-white/15">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : historyItems.length > 0 ? (
          <div className="space-y-1">
            {historyItems.map((item, idx) => {
              const track = item.trackId;
              if (!track) return null;
              return (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors"
                >
                  <div
                    onClick={() => playTrack(track, tracksOnly)}
                    className="flex items-center gap-3.5 flex-1 cursor-pointer"
                  >
                    <span className="text-xs text-white/40 font-mono w-5">#{idx + 1}</span>
                    <img
                      src={track.coverUrl}
                      className="w-10 h-10 rounded-xl object-cover border border-white/20"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-white hover:text-emerald-300 truncate">
                        {track.title}
                      </p>
                      <p className="text-[11px] text-white/60 truncate">
                        {track.artistId?.artistName || 'Nghệ sĩ'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono ${
                        item.completed
                          ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/30'
                          : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {item.completed ? 'Hoàn thành' : `${item.duration}s`}
                    </span>

                    <span className="text-[10px] text-white/40 font-mono hidden sm:inline">
                      {new Date(item.listenedAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-white/50 text-xs">
            Bạn chưa có lịch sử nghe nhạc nào gần đây. Hãy chọn một bài hát để bắt đầu!
          </div>
        )}
      </div>
    </div>
  );
}
