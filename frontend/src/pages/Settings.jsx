import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Palette,
  User,
  MapPin,
  Save,
  CheckCircle,
  AlertCircle,
  Headphones,
  Sliders,
  Sparkles,
  Shield,
  Compass,
  Radio,
  Eye,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

const inputCls =
  'w-full liquid-glass-inner border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors shadow-inner';

const AVATAR_PRESETS = [
  '/ratunes-logo.jpg',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop',
];

export default function Settings({ currentTheme, setTheme }) {
  const { user, updateUserData, isRole, role } = useAuth();
  const [activeTab, setActiveTab] = useState('appearance'); // 'appearance' | 'profile' | 'gis'

  // Appearance & Audio state
  const [audioQuality, setAudioQuality] = useState(() => localStorage.getItem('ratunes_audio_quality') || 'lossless');
  const [spatialAudioEnabled, setSpatialAudioEnabled] = useState(() => localStorage.getItem('ratunes_spatial_audio') !== 'false');
  const [crossfade, setCrossfade] = useState(() => localStorage.getItem('ratunes_crossfade') || '3');

  // Profile state
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '/ratunes-logo.jpg');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // GIS & Location state
  const [city, setCity] = useState('Hà Nội');
  const [country, setCountry] = useState('Vietnam');
  const [latitude, setLatitude] = useState(21.0285);
  const [longitude, setLongitude] = useState(105.8542);
  const [biography, setBiography] = useState('');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setAvatar(user.avatar || '/ratunes-logo.jpg');
    }
  }, [user]);

  // Load GIS profile info
  useEffect(() => {
    const fetchProfileInfo = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.data) {
          const u = res.data.data;
          if (u.artistProfile) {
            setCity(u.artistProfile.city || 'Hà Nội');
            setCountry(u.artistProfile.country || 'Vietnam');
            setLatitude(u.artistProfile.latitude || 21.0285);
            setLongitude(u.artistProfile.longitude || 105.8542);
            setBiography(u.artistProfile.biography || '');
          }
        }
      } catch (err) {
        // Fallback gracefully
      }
    };
    fetchProfileInfo();
  }, []);

  const handleSaveAppearance = (e) => {
    e.preventDefault();
    localStorage.setItem('ratunes_audio_quality', audioQuality);
    localStorage.setItem('ratunes_spatial_audio', spatialAudioEnabled);
    localStorage.setItem('ratunes_crossfade', crossfade);
    setSuccessMsg('Đã lưu cấu hình Giao diện & Âm thanh không gian thành công!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password && password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      const payload = { username, avatar };
      if (password) payload.password = password;

      const res = await api.put('/auth/profile', payload);
      if (res.data.success) {
        if (updateUserData) {
          updateUserData(res.data.data);
        }
        setSuccessMsg('Hồ sơ người dùng đã được cập nhật thành công!');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Lỗi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGIS = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      // First try /artists/profile (if artist)
      try {
        await api.post('/artists/profile', {
          artistName: username,
          biography,
          city,
          country,
          latitude: Number(latitude),
          longitude: Number(longitude),
          avatar,
        });
      } catch (artistErr) {
        // Fallback to updateProfile
        await api.put('/auth/profile', {
          city,
          country,
          latitude: Number(latitude),
          longitude: Number(longitude),
          biography,
        });
      }

      setSuccessMsg('Đã cập nhật tọa độ không gian GIS & Tiểu sử thành công!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Lỗi cập nhật tọa độ GIS');
    } finally {
      setLoading(false);
    }
  };

  const handleDetectGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(4));
          setLongitude(pos.coords.longitude.toFixed(4));
          setSuccessMsg(`Đã lấy vị trí GPS thực tế (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setTimeout(() => setSuccessMsg(''), 4000);
        },
        (err) => {
          setErrorMsg('Không thể truy cập GPS trình duyệt: ' + err.message);
        }
      );
    } else {
      setErrorMsg('Trình duyệt không hỗ trợ Geolocation API');
    }
  };

  const themes = [
    {
      id: 'ocean',
      title: 'Deep Ocean 🌊',
      desc: 'Sắc thái biển sâu dịu mát với các quả cầu khúc xạ ánh sáng ngọc lam và lục lam',
      color: 'from-[#07131b] via-[#0b1c26] to-[#04090e]',
      border: 'border-cyan-500/40',
    },
    {
      id: 'lagoon',
      title: 'Emerald Lagoon 🌿',
      desc: 'Tông màu ngọc bích thiên nhiên tươi sáng, mô phỏng phản xạ mặt nước sinh thái',
      color: 'from-[#051614] via-[#09221f] to-[#030d0c]',
      border: 'border-emerald-500/40',
    },
    {
      id: 'aurora',
      title: 'Spatial Aurora 🌌',
      desc: 'Huyền ảo cực quang vũ trụ với sắc tím chàm, hiệu ứng không gian Apple Vision Pro',
      color: 'from-[#0d1021] via-[#121630] to-[#080914]',
      border: 'border-purple-500/40',
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 select-none max-w-5xl mx-auto">
      {/* Settings Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-cyan-300 text-xs font-semibold mb-2.5 border border-white/20">
          <Sliders className="w-3.5 h-3.5" />
          ratunes Preference &amp; Spatial Configuration
        </div>
        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-3">
          Cài Đặt Hệ Thống &amp; Trải Nghiệm
        </h1>
        <p className="text-xs text-white/60 mt-1 max-w-2xl">
          Tùy biến chủ đề hiển thị Apple Glass, thiết lập giải mã âm thanh không gian 3D và quản lý hồ sơ định vị GIS.
        </p>
      </div>

      {/* Alert Notices */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
        {[
          { id: 'appearance', label: 'Giao Diện & Không Gian', icon: Palette },
          { id: 'profile', label: 'Hồ Sơ Cá Nhân', icon: User },
          { id: 'gis', label: 'Vị Trí & Bản Đồ GIS', icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'liquid-glass-pill-active text-white border-white/40 shadow-lg'
                  : 'liquid-glass-pill text-white/70 hover:text-white border-white/15'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: APPEARANCE & AUDIO SPATIAL EXPERIENCE */}
      {activeTab === 'appearance' && (
        <form onSubmit={handleSaveAppearance} className="space-y-6">
          {/* Theme Palette Chooser */}
          <div className="liquid-glass-card rounded-[28px] p-6 border border-white/15 shadow-xl space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Palette className="w-4 h-4 text-cyan-300" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Chủ Đề Không Gian (Apple Spatial Atmosphere)
              </h2>
            </div>
            <p className="text-xs text-white/60 mb-3">
              Lựa chọn tông màu ambient lỏng và hiệu ứng tán xạ ánh sáng cho toàn bộ ứng dụng:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themes.map((t) => {
                const isSelected = currentTheme === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setTheme && setTheme(t.id)}
                    className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 border ${
                      isSelected
                        ? `bg-white/15 ${t.border} shadow-[0_0_25px_rgba(255,255,255,0.15)] scale-[1.02]`
                        : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                    }`}
                  >
                    <div className={`h-16 rounded-xl bg-gradient-to-br ${t.color} mb-3 border border-white/15 flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.2),transparent_70%)]" />
                      <span className="text-sm font-bold text-white z-10">{t.title}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{t.title}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Đang dùng
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/55 mt-1.5 leading-relaxed">{t.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audio Engine & Spatial Quality */}
          <div className="liquid-glass-card rounded-[28px] p-6 border border-white/15 shadow-xl space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Headphones className="w-4 h-4 text-emerald-300" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Động Cơ Âm Thanh &amp; Chuẩn Giải Mã (Hi-Res DAC)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Chất lượng âm thanh truyền tải (Bitrate Quality)
                </label>
                <select
                  value={audioQuality}
                  onChange={(e) => setAudioQuality(e.target.value)}
                  className={inputCls}
                >
                  <option value="lossless" className="bg-[#0b1c26] text-white">
                    Studio Lossless (24-bit/96kHz FLAC Master)
                  </option>
                  <option value="high" className="bg-[#0b1c26] text-white">
                    Hi-Res Audio (320kbps MP3 / 256kbps AAC)
                  </option>
                  <option value="balanced" className="bg-[#0b1c26] text-white">
                    Tiết kiệm dữ liệu (128kbps Balanced)
                  </option>
                </select>
                <p className="text-[10px] text-white/45 mt-1">
                  Đảm bảo giải mã đầy đủ âm sắc nhạc cụ, tần số đáp ứng từ 20Hz - 48kHz.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Thời gian Crossfade chuyển bài (giây)
                </label>
                <select
                  value={crossfade}
                  onChange={(e) => setCrossfade(e.target.value)}
                  className={inputCls}
                >
                  <option value="0" className="bg-[#0b1c26] text-white">0s (Tắt Crossfade)</option>
                  <option value="3" className="bg-[#0b1c26] text-white">3 giây (Mượt mà)</option>
                  <option value="5" className="bg-[#0b1c26] text-white">5 giây (Dịu êm)</option>
                  <option value="8" className="bg-[#0b1c26] text-white">8 giây (Club DJ)</option>
                </select>
                <p className="text-[10px] text-white/45 mt-1">
                  Hòa âm chuyển bài liên tục không tạo khoảng lặng.
                </p>
              </div>
            </div>

            {/* Spatial Audio Toggle */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  Mô phỏng Âm Thanh Không Gian Apple Spatial (Binaural 3D)
                </h3>
                <p className="text-[11px] text-white/50 mt-0.5">
                  Tái tạo trường âm vòm 360 độ và mô phỏng định hướng nguồn âm đa hướng tương thích tai nghe.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSpatialAudioEnabled(!spatialAudioEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  spatialAudioEnabled ? 'bg-emerald-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    spatialAudioEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01]"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Thiết Lập Trải Nghiệm</span>
          </button>
        </form>
      )}

      {/* TAB 2: PERSONAL PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="liquid-glass-card rounded-[28px] p-6 border border-white/15 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Live Avatar Preview */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/30 shadow-xl bg-black/40 flex-shrink-0">
                  <img
                    src={avatar || '/ratunes-logo.jpg'}
                    alt="User avatar preview"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.src = '/ratunes-logo.jpg';
                    }}
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border border-black flex items-center justify-center text-[10px] text-black font-bold">
                  ✓
                </span>
              </div>

              {/* User overview */}
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                  {username || 'Khách vãng lai'}
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    role === 'admin'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : role === 'artist'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {role === 'admin' ? '🛡️ Quản trị viên' : role === 'artist' ? '🎤 Nghệ sĩ' : '🎧 Người nghe'}
                  </span>
                </h3>
                <p className="text-xs text-white/50 mt-1">{user?.email || 'Chưa liên kết email'}</p>
                <p className="text-[11px] text-white/40 mt-1">
                  Chọn ảnh đại diện có sẵn từ mascot ratunes hoặc dán liên kết URL ảnh cá nhân bên dưới.
                </p>
              </div>
            </div>

            {/* Avatar Preset Quick Chooser */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-2">
                Chọn Nhanh Ảnh Đại Diện Có Sẵn
              </label>
              <div className="flex items-center gap-3">
                {AVATAR_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(p)}
                    className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                      avatar === p ? 'border-emerald-400 scale-110 shadow-lg' : 'border-white/20 hover:border-white/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={p} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Tên Người Dùng (Username) *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Avatar Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-white/70 mb-1.5">Email (Đăng nhập)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className={`${inputCls} opacity-60 cursor-not-allowed`}
                />
                <span className="text-[10px] text-white/40 mt-1 block">
                  Email được cố định để bảo vệ tài khoản và liên kết dữ liệu bản quyền.
                </span>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-cyan-300" />
                Đổi Mật Khẩu (Để trống nếu không muốn thay đổi)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Mật khẩu mới</label>
                  <input
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Đang Lưu...' : 'Cập Nhật Hồ Sơ'}</span>
          </button>
        </form>
      )}

      {/* TAB 3: GIS LOCATION & REGIONAL SETTINGS */}
      {activeTab === 'gis' && (
        <form onSubmit={handleSaveGIS} className="space-y-6">
          <div className="liquid-glass-card rounded-[28px] p-6 border border-white/15 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-300" />
                  Định Vị Tọa Độ Không Gian &amp; Bản Đồ GIS
                </h2>
                <p className="text-xs text-white/60 mt-1">
                  Định vị hiển thị trên bản đồ số GIS Leaflet, giúp cộng đồng khám phá nghệ sĩ và xu hướng âm nhạc theo vùng miền.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDetectGPS}
                className="px-3.5 py-1.5 rounded-xl liquid-glass-pill text-teal-300 border border-teal-400/30 text-xs font-semibold flex items-center gap-1.5 hover:bg-teal-500/10 transition-colors"
                title="Lấy tọa độ vị trí hiện tại của thiết bị"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Lấy Tọa Độ GPS Hiện Tại</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Thành Phố / Khu Vực *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: TP. Hồ Chí Minh"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Quốc Gia *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Vietnam"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Vĩ Độ (Latitude) *</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Kinh Độ (Longitude) *</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Tiểu Sử Hoạt Động &amp; Giới Thiệu Bản Thân (Biography)
                </label>
                <textarea
                  rows="3"
                  placeholder="Mô tả phong cách âm nhạc, các cột mốc sản phẩm hoặc thông điệp gửi tới thính giả..."
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>

            {/* Quick Map Coordinates Indicator */}
            <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-teal-400 animate-pulse" />
                <span>
                  Tọa độ đăng ký: <span className="font-bold text-white">{latitude}, {longitude}</span> ({city}, {country})
                </span>
              </div>
              <a
                href="/gis-map"
                className="text-[11px] underline font-bold text-teal-200 hover:text-white"
              >
                Mở bản đồ GIS ↗
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Đang Lưu...' : 'Cập Nhật Vị Trí GIS'}</span>
          </button>
        </form>
      )}
    </div>
  );
}