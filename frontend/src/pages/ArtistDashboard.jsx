import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Upload,
  Mic2,
  Shield,
  Send,
  BarChart3,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Play,
  Sparkles,
  Layers,
} from 'lucide-react';

// Reusable glass input classes
const inputCls =
  'w-full liquid-glass-inner border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors';

export default function ArtistDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'profile' | 'copyright' | 'distribution' | 'stats'
  const [loading, setLoading] = useState(false);
  const [artistStats, setArtistStats] = useState(null);
  const [copyrights, setCopyrights] = useState([]);
  const [distributions, setDistributions] = useState([]);

  // Form states for Upload Track
  const [trackForm, setTrackForm] = useState({
    title: '',
    genre: 'V-Pop',
    duration: 210,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    tempo: 120,
    energy: 0.7,
    valence: 0.6,
    danceability: 0.65,
    acousticness: 0.35,
    author: user?.username || 'Nghệ sĩ',
    recordLabel: 'M-TP Entertainment / Độc quyền',
    isrc: 'VN-MTP-26-0001',
    declaration: 'Tôi cam kết toàn bộ quyền tác giả và quyền liên quan đối với tác phẩm này.',
    masterRights: 'Tôi/Công ty chủ quản sở hữu 100% Master Recordings và quyền khai thác thương mại số.',
    commercialPlatforms: ['Spotify', 'Apple Music', 'YouTube Music', 'Zing MP3'],
    releaseNotes: '',
  });

  // Form states for Artist GIS Profile
  const [profileForm, setProfileForm] = useState({
    artistName: user?.username || '',
    biography: '',
    city: 'Hà Nội',
    country: 'Vietnam',
    latitude: 21.0285,
    longitude: 105.8542,
    avatar: user?.avatar || '',
  });

  // Plagiarism Pre-check state
  const [plagiarismCheckResult, setPlagiarismCheckResult] = useState(null);
  const [checkingPlagiarism, setCheckingPlagiarism] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Distribution Form
  const [distributionTitle, setDistributionTitle] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([
    'Spotify',
    'Apple Music',
    'YouTube Music',
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      if (activeTab === 'stats') {
        const res = await api.get('/stats/artist');
        if (res.data.success) setArtistStats(res.data.data);
      } else if (activeTab === 'copyright') {
        const res = await api.get('/copyright/artist');
        if (res.data.success) setCopyrights(res.data.data);
      } else if (activeTab === 'distribution') {
        const res = await api.get('/distribution/artist');
        if (res.data.success) setDistributions(res.data.data);
      } else if (activeTab === 'profile') {
        const res = await api.get('/auth/me');
        if (res.data.data?.artistProfile) {
          const p = res.data.data.artistProfile;
          setProfileForm({
            artistName: p.artistName || '',
            biography: p.biography || '',
            city: p.city || 'Hà Nội',
            country: p.country || 'Vietnam',
            latitude: p.latitude || 21.0285,
            longitude: p.longitude || 105.8542,
            avatar: p.avatar || '',
          });
        }
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    }
  };

  // AI Plagiarism Pre-check
  const handleCheckPlagiarism = async () => {
    setCheckingPlagiarism(true);
    setPlagiarismCheckResult(null);
    try {
      const res = await api.post('/ai/check-plagiarism', {
        audioFeatures: {
          tempo: Number(trackForm.tempo),
          energy: Number(trackForm.energy),
          valence: Number(trackForm.valence),
          danceability: Number(trackForm.danceability),
          acousticness: Number(trackForm.acousticness),
        },
      });

      if (res.data.success) {
        setPlagiarismCheckResult(res.data.data);
      }
    } catch (err) {
      alert('Lỗi kiểm tra AI: ' + err.message);
    } finally {
      setCheckingPlagiarism(false);
    }
  };

  // Submit new Track
  const handleCreateTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    try {
      const payload = {
        title: trackForm.title,
        genre: trackForm.genre,
        duration: Number(trackForm.duration),
        audioUrl: trackForm.audioUrl,
        coverUrl: trackForm.coverUrl,
        audioFeatures: {
          tempo: Number(trackForm.tempo),
          energy: Number(trackForm.energy),
          valence: Number(trackForm.valence),
          danceability: Number(trackForm.danceability),
          acousticness: Number(trackForm.acousticness),
          mfcc: [14.0, -5.2, 7.8, -2.9, 4.1, -1.8, 2.5, 0.8],
        },
        author: trackForm.author,
        declaration: trackForm.declaration,
        recordLabel: trackForm.recordLabel,
        isrc: trackForm.isrc,
        copyrightDeclaration: trackForm.declaration,
        masterRights: trackForm.masterRights,
        commercialPlatforms: trackForm.commercialPlatforms,
        releaseNotes: trackForm.releaseNotes,
      };

      const res = await api.post('/tracks', payload);
      if (res.data.success) {
        setSuccessMessage(res.data.message || 'Đăng tải bài hát thành công!');
        setTrackForm({ ...trackForm, title: '' });
        setPlagiarismCheckResult(null);
      }
    } catch (err) {
      alert('Lỗi đăng tải bài hát: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Update Artist GIS Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/artists/profile', {
        ...profileForm,
        latitude: Number(profileForm.latitude),
        longitude: Number(profileForm.longitude),
      });
      alert('Cập nhật hồ sơ & tọa độ GIS nghệ sĩ thành công!');
    } catch (err) {
      alert('Lỗi cập nhật: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit Distribution Request
  const handleSubmitDistribution = async (e) => {
    e.preventDefault();
    if (!distributionTitle.trim()) return;
    try {
      await api.post('/distribution', {
        releaseTitle: distributionTitle,
        platforms: selectedPlatforms,
      });
      alert('Đã gửi yêu cầu phân phối thành công!');
      setDistributionTitle('');
      fetchDashboardData();
    } catch (err) {
      alert('Lỗi phân phối: ' + err.message);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-blue-300 text-xs font-semibold mb-2 border border-white/20">
            <Mic2 className="w-3.5 h-3.5" />
            Artist Studio &amp; Creator Portal
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white">Kênh Quản Lý Nghệ Sĩ</h1>
          <p className="text-xs text-white/60">
            Đăng tải sản phẩm âm nhạc, định vị GIS, khai báo tác quyền và yêu cầu phân phối quốc tế
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
        {[
          { id: 'upload', label: 'Đăng Tải Bài Hát', icon: Upload },
          { id: 'profile', label: 'Hồ Sơ & Tọa Độ GIS', icon: MapPin },
          { id: 'copyright', label: 'Quản Lý Bản Quyền', icon: Shield },
          { id: 'distribution', label: 'Phát Hành & Phân Phối', icon: Send },
          { id: 'stats', label: 'Thống Kê Lượt Nghe', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'liquid-glass-pill-active text-white border-white/40 shadow-md'
                  : 'liquid-glass-pill text-white/70 hover:text-white border-white/15'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: UPLOAD TRACK */}
      {activeTab === 'upload' && (
        <form onSubmit={handleCreateTrack} className="space-y-6 max-w-4xl">
          {successMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {successMessage}
            </div>
          )}

          {/* Basic Info */}
          <div className="liquid-glass-card border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              1. Thông Tin Cơ Bản Của Bài Hát
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Tên bài hát *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Em Đồng Ý (I Do)"
                  value={trackForm.title}
                  onChange={(e) => setTrackForm({ ...trackForm, title: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Thể loại nhạc *</label>
                <select
                  value={trackForm.genre}
                  onChange={(e) => setTrackForm({ ...trackForm, genre: e.target.value })}
                  className={inputCls}
                >
                  <option value="V-Pop">V-Pop</option>
                  <option value="Rap/Hip-hop">Rap/Hip-hop</option>
                  <option value="Indie">Indie</option>
                  <option value="Ballad">Ballad</option>
                  <option value="EDM">EDM</option>
                  <option value="R&B">R&B</option>
                  <option value="Rock">Rock</option>
                  <option value="Acoustic">Acoustic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Thời lượng (giây) *</label>
                <input
                  type="number"
                  required
                  value={trackForm.duration}
                  onChange={(e) => setTrackForm({ ...trackForm, duration: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Audio Stream URL *</label>
                <input
                  type="url"
                  required
                  value={trackForm.audioUrl}
                  onChange={(e) => setTrackForm({ ...trackForm, audioUrl: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-white/60 mb-1">Ảnh bìa Cover URL</label>
                <input
                  type="url"
                  value={trackForm.coverUrl}
                  onChange={(e) => setTrackForm({ ...trackForm, coverUrl: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Copyright & Comprehensive Industry Fields */}
          <div className="liquid-glass-card border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              2. Tiêu Chuẩn Công Nghiệp Âm Nhạc &amp; Khai Báo Bản Quyền
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Tác giả / Nhạc sĩ sáng tác *</label>
                <input
                  type="text"
                  required
                  value={trackForm.author}
                  onChange={(e) => setTrackForm({ ...trackForm, author: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">
                  Công ty chủ quản / Record Label (Hãng Đĩa) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: M-TP Entertainment, Universal Music VN..."
                  value={trackForm.recordLabel}
                  onChange={(e) => setTrackForm({ ...trackForm, recordLabel: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">
                  Mã ISRC Quốc Tế (International Standard Recording Code)
                </label>
                <input
                  type="text"
                  placeholder="VN-AAA-26-XXXXX"
                  value={trackForm.isrc}
                  onChange={(e) => setTrackForm({ ...trackForm, isrc: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">
                  Tuyên bố sở hữu Master (Master Rights Statement) *
                </label>
                <input
                  type="text"
                  required
                  value={trackForm.masterRights}
                  onChange={(e) => setTrackForm({ ...trackForm, masterRights: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-white/60 mb-1">
                  Lời cam kết bản quyền độc bản (Copyright Declaration) *
                </label>
                <textarea
                  rows="2"
                  required
                  value={trackForm.declaration}
                  onChange={(e) => setTrackForm({ ...trackForm, declaration: e.target.value })}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  Nền tảng thương mại phát hành (Commercial Distribution Platforms)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'TikTok / ByteDance', 'Zing MP3', 'Tidal', 'Deezer'].map((plat) => {
                    const checked = trackForm.commercialPlatforms?.includes(plat);
                    return (
                      <label
                        key={plat}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          checked
                            ? 'liquid-glass-pill-active text-white border-emerald-400/50'
                            : 'liquid-glass-inner text-white/70 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTrackForm({
                                ...trackForm,
                                commercialPlatforms: [...(trackForm.commercialPlatforms || []), plat],
                              });
                            } else {
                              setTrackForm({
                                ...trackForm,
                                commercialPlatforms: (trackForm.commercialPlatforms || []).filter((p) => p !== plat),
                              });
                            }
                          }}
                          className="rounded accent-emerald-500"
                        />
                        <span className="truncate">{plat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-white/60 mb-1">
                  Ghi chú phát hành &amp; Credits sản xuất (Release Notes)
                </label>
                <textarea
                  rows="2"
                  placeholder="Arranger, Producer, Sound Engineer, Studio..."
                  value={trackForm.releaseNotes}
                  onChange={(e) => setTrackForm({ ...trackForm, releaseNotes: e.target.value })}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-green-500 hover:bg-green-400 text-black font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-green-500/20 transition-transform hover:scale-[1.01]"
          >
            <Upload className="w-4 h-4 fill-black" />
            {loading ? 'Đang Đăng Tải...' : 'Đăng Tải & Phát Hành Bài Hát Lên Nền Tảng'}
          </button>
        </form>
      )}

      {/* TAB 2: PROFILE & GIS COORDINATES */}
      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-3xl">
          <div className="liquid-glass-card border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Tọa Độ Không Gian GIS &amp; Thông Tin Nghệ Sĩ
            </h2>
            <p className="text-xs text-white/50 mb-4">
              Tọa độ Latitude và Longitude sẽ được hiển thị trực tiếp trên Bản đồ số GIS Leaflet cho toàn bộ người dùng tra cứu.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Nghệ Danh *</label>
                <input
                  type="text"
                  required
                  value={profileForm.artistName}
                  onChange={(e) => setProfileForm({ ...profileForm, artistName: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Tỉnh / Thành Phố *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: TP. Hồ Chí Minh"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-400 mb-1 font-mono">GIS Latitude (Vĩ Độ) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={profileForm.latitude}
                  onChange={(e) => setProfileForm({ ...profileForm, latitude: e.target.value })}
                  className={`${inputCls} border-emerald-500/30 focus:border-emerald-500 font-mono`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-400 mb-1 font-mono">GIS Longitude (Kinh Độ) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={profileForm.longitude}
                  onChange={(e) => setProfileForm({ ...profileForm, longitude: e.target.value })}
                  className={`${inputCls} border-emerald-500/30 focus:border-emerald-500 font-mono`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-white/60 mb-1">Tiểu sử nghệ sĩ</label>
                <textarea
                  rows="3"
                  value={profileForm.biography}
                  onChange={(e) => setProfileForm({ ...profileForm, biography: e.target.value })}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-colors"
            >
              Lưu Tọa Độ &amp; Hồ Sơ GIS
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: COPYRIGHT MANAGEMENT */}
      {activeTab === 'copyright' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Danh Sách Hồ Sơ Bản Quyền Của Bạn ({copyrights.length})
          </h2>

          <div className="space-y-3">
            {copyrights.map((c) => (
              <div
                key={c._id}
                className="liquid-glass-card border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{c.trackId?.title || 'Bài hát'}</h4>
                  <p className="text-xs text-white/50 mt-0.5">Tác giả: {c.author} • Chủ sở hữu: {c.owner}</p>
                  <p className="text-[11px] text-white/40 mt-1 italic">"{c.declaration}"</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      c.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : c.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}
                  >
                    {c.status === 'approved' ? 'Đã duyệt' : c.status === 'rejected' ? 'Bị từ chối' : 'Chờ duyệt'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DISTRIBUTION */}
      {activeTab === 'distribution' && (
        <div className="space-y-6 max-w-3xl">
          <form
            onSubmit={handleSubmitDistribution}
            className="liquid-glass-card border border-white/10 rounded-3xl p-6 shadow-xl space-y-4"
          >
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Gửi Yêu Cầu Phát Hành Ra Quốc Tế
            </h2>
            <p className="text-xs text-white/50 mb-4">
              Hệ thống sẽ đồng bộ siêu dữ liệu và tệp âm thanh tới Spotify, Apple Music, YouTube Music và TikTok.
            </p>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Tên đĩa đơn / Album *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Đĩa đơn Mùa Thu 2026"
                value={distributionTitle}
                onChange={(e) => setDistributionTitle(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">Các nền tảng phân phối</label>
              <div className="flex flex-wrap gap-2">
                {['Spotify', 'Apple Music', 'YouTube Music', 'TikTok', 'Zing MP3'].map((plat) => (
                  <button
                    type="button"
                    key={plat}
                    onClick={() => {
                      if (selectedPlatforms.includes(plat)) {
                        setSelectedPlatforms(selectedPlatforms.filter((p) => p !== plat));
                      } else {
                        setSelectedPlatforms([...selectedPlatforms, plat]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      selectedPlatforms.includes(plat)
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'liquid-glass-pill text-white/60 border-white/15'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-colors"
            >
              Gửi Yêu Cầu Phân Phối
            </button>
          </form>

          {/* List of Distributions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider">
              Lịch sử yêu cầu phân phối
            </h3>
            {distributions.map((d) => (
              <div
                key={d._id}
                className="liquid-glass-card border border-white/10 rounded-2xl p-4 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{d.releaseTitle}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    {d.platforms?.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] px-2 py-0.5 rounded liquid-glass-pill text-white/60 border border-white/15"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: STATS */}
      {activeTab === 'stats' && artistStats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Tổng Lượt Nghe', value: artistStats.totalPlays?.toLocaleString(), color: 'text-green-400' },
              { label: 'Người Nghe Hàng Tháng', value: artistStats.monthlyListeners?.toLocaleString(), color: 'text-blue-400' },
              { label: 'Lượt Yêu Thích', value: artistStats.totalLikes?.toLocaleString(), color: 'text-rose-400' },
              { label: 'Tỷ Lệ Hoàn Thành Bài Hát', value: `${artistStats.completionRate}%`, color: 'text-yellow-400' },
            ].map((stat) => (
              <div key={stat.label} className="liquid-glass-card p-5 rounded-2xl border border-white/10">
                <span className="text-xs text-white/50">{stat.label}</span>
                <p className={`text-2xl font-black font-mono mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
