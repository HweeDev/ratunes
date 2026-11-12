import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShieldCheck,
  Users,
  Music,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Flame,
  Radio,
  Layers,
  Send,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'copyright' | 'distribution'
  const [systemStats, setSystemStats] = useState(null);
  const [copyrights, setCopyrights] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanningPlagiarism, setScanningPlagiarism] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const handleRunAdminPlagiarismCheck = async () => {
    setScanningPlagiarism(true);
    setScanMessage(null);
    try {
      const res = await api.post('/ai/check-plagiarism', {
        audioFeatures: {
          tempo: 124,
          energy: 0.8,
          valence: 0.7,
          danceability: 0.72,
          acousticness: 0.25,
        },
      });
      if (res.data.success) {
        setScanMessage({
          type: res.data.data.hasPlagiarismWarning ? 'warning' : 'success',
          text: `Đã hoàn tất quét AI toàn hệ thống. Mức tương đồng cao nhất phát hiện: ${res.data.data.highestSimilarity}%. Tình trạng: ${res.data.data.hasPlagiarismWarning ? 'Phát hiện nghi vấn cần thẩm duyệt' : 'Toàn bộ bài hát độc bản hợp lệ'}.`,
        });
        fetchAdminData();
      }
    } catch (err) {
      alert('Lỗi quét AI: ' + err.message);
    } finally {
      setScanningPlagiarism(false);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await api.get('/stats/system');
        if (res.data.success) setSystemStats(res.data.data);
      } else if (activeTab === 'copyright') {
        const res = await api.get('/copyright');
        if (res.data.success) setCopyrights(res.data.data);
      } else if (activeTab === 'distribution') {
        const res = await api.get('/distribution');
        if (res.data.success) setDistributions(res.data.data);
      }
    } catch (err) {
      console.warn('Admin fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewCopyright = async (id, status) => {
    try {
      await api.patch(`/copyright/${id}/review`, { status });
      alert(`Đã cập nhật trạng thái bản quyền: ${status}`);
      fetchAdminData();
    } catch (err) {
      alert('Lỗi cập nhật: ' + err.message);
    }
  };

  const handleUpdateDistribution = async (id, status) => {
    try {
      await api.patch(`/distribution/${id}/status`, { status });
      alert(`Đã cập nhật trạng thái phân phối: ${status}`);
      fetchAdminData();
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 select-none">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-rose-300 text-xs font-semibold mb-2 border border-white/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Hệ Thống Quản Trị Trung Tâm (Admin Portal)
        </div>
        <h1 className="text-xl md:text-2xl font-black text-white">Quản Trị Nền Tảng &amp; Thống Kê</h1>
        <p className="text-xs text-white/60">
          Giám sát hành vi người dùng, duyệt bản quyền tự động với AI và quản lý phân phối
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {[
          { id: 'overview', label: 'Tổng Quan & Thống Kê', icon: BarChart3 },
          { id: 'copyright', label: 'Thẩm Định Bản Quyền & AI', icon: ShieldCheck },
          { id: 'distribution', label: 'Quản Lý Phân Phối', icon: Send },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'liquid-glass-pill-active text-white border-white/40 shadow-md'
                  : 'liquid-glass-pill text-white/70 hover:text-white border-white/15'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && systemStats && (
        <div className="space-y-8">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Tổng Người Dùng', value: systemStats.overview.totalUsers, color: 'text-white' },
              { label: 'Nghệ Sĩ Bản Đồ GIS', value: systemStats.overview.totalArtists, color: 'text-emerald-400' },
              { label: 'Tổng Bài Hát', value: systemStats.overview.totalTracks, color: 'text-blue-400' },
              { label: 'Tổng Lượt Nghe', value: systemStats.overview.totalPlays?.toLocaleString(), color: 'text-green-400' },
              { label: 'Tỷ Lệ Hoàn Thành', value: `${systemStats.overview.completionRate}%`, color: 'text-yellow-400' },
            ].map((kpi) => (
              <div key={kpi.label} className="liquid-glass-card p-4 rounded-2xl border border-white/10">
                <span className="text-[11px] text-white/50 block">{kpi.label}</span>
                <span className={`text-2xl font-black font-mono mt-1 block ${kpi.color}`}>{kpi.value}</span>
              </div>
            ))}
          </div>

          {/* User Behavior Breakdown */}
          <div className="liquid-glass-card border border-white/10 rounded-3xl p-6 shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Phân Tích Hành Vi Người Dùng (Listening Behavior Analytics)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Tổng Sự Kiện Nghe', value: systemStats.behavior.totalEvents, color: 'text-white' },
                { label: 'Lượt Nghe Trọn Vẹn (>80%)', value: systemStats.behavior.completedCount, color: 'text-emerald-400' },
                { label: 'Lượt Bỏ Qua (Skip)', value: systemStats.behavior.skippedCount, color: 'text-rose-400' },
                { label: 'Lượt Thả Tim (Like)', value: systemStats.behavior.likedCount, color: 'text-pink-400' },
              ].map((item) => (
                <div key={item.label} className="liquid-glass-inner p-4 rounded-2xl border border-white/10">
                  <span className="text-xs text-white/50">{item.label}</span>
                  <p className={`text-xl font-bold font-mono mt-1 ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Tracks & Top Artists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="liquid-glass-card border border-white/10 rounded-3xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Top Bài Hát Hot Nhất Nền Tảng
              </h2>
              <div className="space-y-3">
                {systemStats.topTracks?.map((t, idx) => (
                  <div key={t._id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-white/40 w-4">#{idx + 1}</span>
                      <img src={t.coverUrl} className="w-8 h-8 rounded-lg object-cover" alt={t.title} />
                      <div>
                        <p className="font-semibold text-white">{t.title}</p>
                        <p className="text-[11px] text-white/50">{t.artistId?.artistName}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-green-400">
                      {t.playCount?.toLocaleString()} lượt
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="liquid-glass-card border border-white/10 rounded-3xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Top Nghệ Sĩ Phổ Biến Nhất
              </h2>
              <div className="space-y-3">
                {systemStats.topArtists?.map((a, idx) => (
                  <div key={a._id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-white/40 w-4">#{idx + 1}</span>
                      <img src={a.avatar} className="w-8 h-8 rounded-full object-cover" alt={a.artistName} />
                      <div>
                        <p className="font-semibold text-white">{a.artistName}</p>
                        <p className="text-[11px] text-emerald-400">{a.city}, {a.country}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-blue-400">
                      {a.monthlyListeners?.toLocaleString()} người nghe
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COPYRIGHT MODERATION */}
      {activeTab === 'copyright' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Yêu Cầu Duyệt Bản Quyền &amp; Thẩm Định Tương Đồng AI ({copyrights.length})
              </h2>
              <p className="text-xs text-white/50">
                Chức năng độc quyền dành cho Quản trị viên: Quét kiểm tra trùng lặp âm thanh đa chiều (MFCC &amp; Cosine Similarity)
              </p>
            </div>

            <button
              onClick={handleRunAdminPlagiarismCheck}
              disabled={scanningPlagiarism}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95 whitespace-nowrap self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              {scanningPlagiarism ? 'AI Đang Quét Toàn Hệ Thống...' : 'Kiểm Tra Trùng Lặp Âm Thanh Bằng AI'}
            </button>
          </div>

          {scanMessage && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 ${
                scanMessage.type === 'warning'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{scanMessage.text}</span>
            </div>
          )}

          <div className="space-y-3">
            {copyrights.map((c) => (
              <div
                key={c._id}
                className="liquid-glass-card border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{c.trackId?.title || 'Bài hát'}</h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : c.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <p className="text-xs text-white/50 mt-1">
                    Chủ sở hữu: <span className="text-white">{c.owner}</span> • Tác giả:{' '}
                    <span className="text-white">{c.author}</span>
                  </p>

                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="text-white/50">
                      Điểm tương đồng AI:{' '}
                      <span
                        className={`font-mono font-bold ${
                          c.similarityScore > 80 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {c.similarityScore || 0}%
                      </span>
                    </span>
                    {c.similarityNotes && (
                      <span className="text-white/40 italic">({c.similarityNotes})</span>
                    )}
                  </div>
                </div>

                {c.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReviewCopyright(c._id, 'approved')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Phê Duyệt
                    </button>
                    <button
                      onClick={() => handleReviewCopyright(c._id, 'rejected')}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Từ Chối
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DISTRIBUTION REQUESTS */}
      {activeTab === 'distribution' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Yêu Cầu Phân Phối Quốc Tế Cần Xử Lý ({distributions.length})
          </h2>

          <div className="space-y-3">
            {distributions.map((d) => (
              <div
                key={d._id}
                className="liquid-glass-card border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{d.releaseTitle}</h4>
                  <p className="text-xs text-white/50 mt-0.5">
                    Nghệ sĩ: <span className="text-white">{d.artistId?.artistName}</span>
                  </p>
                  <div className="flex gap-1.5 mt-2">
                    {d.platforms?.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] liquid-glass-pill px-2 py-0.5 rounded text-white/70 border border-white/15"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateDistribution(d._id, 'approved')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Duyệt Phát Hành
                  </button>
                  <button
                    onClick={() => handleUpdateDistribution(d._id, 'rejected')}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    Từ Chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
