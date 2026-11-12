import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import HeatmapLayer from '../components/HeatmapLayer';
import { usePlayer } from '../context/PlayerContext';
import {
  MapPin,
  Layers,
  Flame,
  Users,
  Play,
  Navigation,
  Compass,
  Radio,
  CheckCircle2,
  Key,
  HelpCircle,
  ExternalLink,
  X,
  Globe,
  Eye,
  Check,
} from 'lucide-react';

// Custom Marker Icon helper using artist avatar
const createCustomIcon = (avatarUrl, isSelected = false) => {
  return L.divIcon({
    className: 'custom-artist-pin',
    html: `
      <div style="
        position: relative;
        width: ${isSelected ? '46px' : '38px'};
        height: ${isSelected ? '46px' : '38px'};
        border-radius: 50%;
        border: 3px solid ${isSelected ? '#22c55e' : '#10b981'};
        box-shadow: 0 4px 14px rgba(0,0,0,0.6), 0 0 12px rgba(34, 197, 94, 0.5);
        background: #0f131a;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s;
      ">
        <img src="${avatarUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop'}" 
             style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <div style="
        width: 0; 
        height: 0; 
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid ${isSelected ? '#22c55e' : '#10b981'};
        margin: -2px auto 0 auto;
      "></div>
    `,
    iconSize: [isSelected ? 46 : 38, isSelected ? 54 : 46],
    iconAnchor: [isSelected ? 23 : 19, isSelected ? 54 : 46],
    popupAnchor: [0, isSelected ? -50 : -42],
  });
};

// Map Controller for Smooth Fly-To
function FlyToLocation({ targetCoords }) {
  const map = useMap();
  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, 11, { duration: 1.5 });
    }
  }, [targetCoords, map]);
  return null;
}

export default function GISMap() {
  const [artists, setArtists] = useState([]);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [densityStats, setDensityStats] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  // Map Basemap layer: 'mapbox' (default if env key present) | 'dark' | 'osm' | 'satellite'
  const envMapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
  const [mapboxToken, setMapboxToken] = useState(() => {
    return envMapboxToken || localStorage.getItem('ratunes_mapbox_token') || '';
  });
  const [mapLayer, setMapLayer] = useState(() => {
    return envMapboxToken || localStorage.getItem('ratunes_mapbox_token') ? 'mapbox' : 'dark';
  });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tokenInput, setTokenInput] = useState(mapboxToken);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { playTrack } = usePlayer();

  useEffect(() => {
    const fetchGISData = async () => {
      try {
        const [gisRes, statsRes] = await Promise.all([
          api.get('/gis/artists'),
          api.get('/gis/density-stats'),
        ]);

        if (gisRes.data.success) {
          setArtists(gisRes.data.data.markers || []);
          setHeatmapPoints(gisRes.data.data.heatmapPoints || []);
        }

        if (statsRes.data.success) {
          setDensityStats(statsRes.data.cities || []);
        }
      } catch (err) {
        console.warn('GIS data load error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGISData();
  }, []);

  const handleSaveToken = (e) => {
    e.preventDefault();
    const clean = tokenInput.trim();
    setMapboxToken(clean);
    localStorage.setItem('ratunes_mapbox_token', clean);
    setSavedSuccess(true);
    if (clean) setMapLayer('mapbox');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Handle play artist top tracks
  const handlePlayArtist = async (artistId) => {
    try {
      const res = await api.get(`/artists/${artistId}`);
      if (res.data.success && res.data.data.tracks?.length > 0) {
        playTrack(res.data.data.tracks[0], res.data.data.tracks);
      }
    } catch (e) {
      console.warn('Failed to load artist tracks:', e);
    }
  };

  // Determine active tile layer URL & attribution
  const getTileConfig = () => {
    if (mapLayer === 'mapbox' && mapboxToken) {
      return {
        url: `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
        attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; OpenStreetMap',
        maxZoom: 19,
      };
    }
    if (mapLayer === 'satellite') {
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18,
      };
    }
    if (mapLayer === 'osm') {
      return {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      };
    }
    // Default: Spatial Dark Matter (CartoDB fast raster with high reliability)
    return {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    };
  };

  const tileConfig = getTileConfig();

  return (
    <div className="h-full flex flex-col relative select-none">
      {/* Top Map Control Bar */}
      <div className="liquid-glass-inner border-b border-white/10 px-6 py-3 flex flex-wrap items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg liquid-glass-pill flex items-center justify-center border border-white/20">
            <Compass className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-bold text-white flex items-center gap-2">
              Hệ Thống Thông Tin Địa Lý GIS Âm Nhạc
              <span className="text-[10px] liquid-glass-pill text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-white/15">
                Leaflet + Heatmap
              </span>
            </h1>
            <p className="text-[11px] text-white/60">
              Khảo sát mật độ phân bố nghệ sĩ, tọa độ GPS không gian và phát nhạc thực địa
            </p>
          </div>
        </div>

        {/* Toggles & Layer selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Layer switcher */}
          <div className="liquid-glass-pill rounded-full p-1 flex items-center gap-1 border border-white/15">
            <button
              onClick={() => setMapLayer('dark')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                mapLayer === 'dark' ? 'liquid-glass-pill-active text-emerald-300' : 'text-white/60 hover:text-white'
              }`}
              title="Giao diện Không Gian Tối (CartoDB Dark Matter)"
            >
              🌑 Tối
            </button>
            <button
              onClick={() => setMapLayer('osm')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                mapLayer === 'osm' ? 'liquid-glass-pill-active text-emerald-300' : 'text-white/60 hover:text-white'
              }`}
              title="OpenStreetMap (100% Miễn phí, Không cần API Key)"
            >
              🗺️ OSM
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                mapLayer === 'satellite' ? 'liquid-glass-pill-active text-emerald-300' : 'text-white/60 hover:text-white'
              }`}
              title="Vệ tinh Esri World Imagery (100% Miễn phí, Không cần API Key)"
            >
              🛰️ Vệ Tinh
            </button>
            {mapboxToken && (
              <button
                onClick={() => setMapLayer('mapbox')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  mapLayer === 'mapbox' ? 'liquid-glass-pill-active text-cyan-300' : 'text-white/60 hover:text-white'
                }`}
                title="Mapbox Dark Mode (Custom Token)"
              >
                ⚡ Mapbox
              </button>
            )}
          </div>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              showHeatmap
                ? 'liquid-glass-pill-active text-rose-300 border-rose-400/40 shadow-sm'
                : 'liquid-glass-pill text-white/60 hover:text-white border-white/15'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-300" />
            <span>Heatmap ({showHeatmap ? 'Bật' : 'Tắt'})</span>
          </button>

          <button
            onClick={() => setShowMarkers(!showMarkers)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              showMarkers
                ? 'liquid-glass-pill-active text-emerald-300 border-emerald-400/40 shadow-sm'
                : 'liquid-glass-pill text-white/60 hover:text-white border-white/15'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-300" />
            <span>Ghim ({showMarkers ? 'Bật' : 'Tắt'})</span>
          </button>

          <button
            onClick={() => setShowKeyModal(true)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 liquid-glass-pill text-cyan-300 border border-cyan-400/30 hover:border-cyan-400/60 transition-all shadow-sm"
            title="Cài đặt và Hướng dẫn lấy API Key bản đồ miễn phí"
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Key / Nhà Cung Cấp</span>
          </button>
        </div>
      </div>

      {/* Main Map Body with Side Panel */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Leaflet Map Canvas */}
        <div className="flex-1 h-full z-10 p-3">
          <MapContainer
            center={[15.8, 107.5]} // Center of Vietnam
            zoom={6}
            minZoom={5}
            maxZoom={18}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Dynamic Tile Layer according to user selection */}
            <TileLayer
              key={mapLayer + (mapboxToken ? '_token' : '')}
              url={tileConfig.url}
              attribution={tileConfig.attribution}
              maxZoom={tileConfig.maxZoom}
            />

            {/* Heatmap Layer */}
            {showHeatmap && <HeatmapLayer points={heatmapPoints} />}

            {/* FlyTo Animation */}
            {selectedCoords && <FlyToLocation targetCoords={selectedCoords} />}

            {/* Artist Markers */}
            {showMarkers &&
              artists.map((artist) => (
                <Marker
                  key={artist._id}
                  position={[artist.latitude, artist.longitude]}
                  icon={createCustomIcon(artist.avatar, selectedArtist?._id === artist._id)}
                  eventHandlers={{
                    click: () => {
                      setSelectedArtist(artist);
                    },
                  }}
                >
                  <Popup className="dark-popup">
                    <div className="p-3 max-w-xs text-left">
                      <div className="flex items-center gap-3 mb-2.5">
                        <img
                          src={artist.avatar}
                          alt={artist.name}
                          className="w-12 h-12 rounded-full object-cover border border-green-500/50"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1">
                            {artist.name}
                            {artist.verified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                            )}
                          </h4>
                          <p className="text-xs text-emerald-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {artist.city}, {artist.country}
                          </p>
                          <span className="text-[10px] text-gray-400 font-mono">
                            [{artist.latitude.toFixed(4)}, {artist.longitude.toFixed(4)}]
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-300 mb-3 line-clamp-2">
                        {artist.biography || 'Nghệ sĩ phát hành âm nhạc trực tuyến.'}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-white/15 mb-3">
                        <div className="text-[11px] text-gray-400">
                          <span className="font-semibold text-white">
                            {(artist.monthlyListeners || 0).toLocaleString()}
                          </span>{' '}
                          người nghe
                        </div>
                        <div className="text-[11px] text-gray-400">
                          <span className="font-semibold text-white">{artist.trackCount || 0}</span>{' '}
                          bài hát
                        </div>
                      </div>

                      <button
                        onClick={() => handlePlayArtist(artist._id)}
                        className="w-full py-2 bg-green-500 hover:bg-green-400 text-black text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-green-500/20"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        Phát Bài Hát Của Nghệ Sĩ
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>

        {/* Side Panel: City Density Statistics */}
        <div className="w-80 liquid-glass-inner border-l border-white/10 flex flex-col z-20 overflow-y-auto">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-xs font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-300" />
              Mật Độ Nghệ Sĩ Theo Tỉnh / Thành
            </h2>
            <p className="text-[10px] text-white/50 mt-0.5">
              Nhấp vào một khu vực để di chuyển vị trí bản đồ đến tọa độ trung tâm
            </p>
          </div>

          <div className="p-3 space-y-2 flex-1">
            {densityStats.map((item, idx) => (
              <div
                key={item.city}
                onClick={() => {
                  if (item.coordinates) {
                    setSelectedCoords([item.coordinates.lat, item.coordinates.lng]);
                  }
                }}
                className="group p-2.5 rounded-2xl liquid-glass-card cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                    <span className="w-4 text-[10px] text-white/40 font-mono">#{idx + 1}</span>
                    {item.city}
                  </span>
                  <span className="text-xs font-bold text-emerald-300 font-mono">
                    {item.artistCount} nghệ sĩ
                  </span>
                </div>

                {/* Density Bar */}
                <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-white/50">
                  <span>Chiếm {item.percentage}% cả nước</span>
                  <span className="font-mono">TB {item.avgListeners.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-white/5 border-t border-white/10 text-[10px] text-white/50">
            💡 Tọa độ trích xuất tự động qua trường GIS <code className="text-emerald-300">latitude</code> &{' '}
            <code className="text-emerald-300">longitude</code> của Mongoose Artist Model.
          </div>
        </div>
      </div>

      {/* API KEY & PROVIDER GUIDE MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="liquid-glass-window rounded-[32px] p-6 max-w-lg w-full shadow-2xl border border-white/25 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl liquid-glass-pill flex items-center justify-center border border-cyan-400/30">
                  <Key className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cài Đặt API Key &amp; Hướng Dẫn Lấy Key Bản Đồ</h3>
                  <p className="text-[11px] text-white/60">Tùy biến nhà cung cấp bản đồ số GIS cho ratunes</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="w-8 h-8 rounded-full liquid-glass-pill flex items-center justify-center text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification on saved */}
            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                Đã lưu API Key thành công và kích hoạt lớp bản đồ Mapbox!
              </div>
            )}

            {/* Option 1: 100% Free - No Key Needed (Recommended) */}
            <div className="liquid-glass-inner p-4 rounded-2xl border border-white/15 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Phương án 1 (Khuyên dùng): Không cần bất kỳ API Key nào!
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Miễn Phí 100%
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                ratunes đã tích hợp sẵn 2 nhà cung cấp bản đồ nguồn mở toàn cầu mà <strong className="text-white">hoàn toàn không cần API Key</strong>:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMapLayer('osm');
                    setShowKeyModal(false);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    mapLayer === 'osm' ? 'liquid-glass-pill-active text-emerald-300' : 'liquid-glass-inner text-white/80'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Dùng OpenStreetMap
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMapLayer('satellite');
                    setShowKeyModal(false);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    mapLayer === 'satellite' ? 'liquid-glass-pill-active text-cyan-300' : 'liquid-glass-inner text-white/80'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Dùng Vệ Tinh Esri
                </button>
              </div>
            </div>

            {/* Option 2: Mapbox API Key from Environment (.env) */}
            <div className="liquid-glass-inner p-4 rounded-2xl border border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
                  Phương án 2: Mapbox Dark High-Res (Đang nạp từ .env)
                </span>
                {envMapboxToken && (
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3 text-cyan-300" />
                    Đã cấu hình trong .env
                  </span>
                )}
              </div>

              {envMapboxToken ? (
                <div className="bg-cyan-500/10 border border-cyan-500/30 p-3 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Mã Token trong <code className="text-cyan-300">frontend/.env</code>:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMapLayer('mapbox');
                        setShowKeyModal(false);
                      }}
                      className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-lg shadow-sm"
                    >
                      Kích Hoạt Lớp Mapbox
                    </button>
                  </div>
                  <p className="font-mono text-[11px] text-cyan-200 truncate bg-black/40 p-2 rounded-lg border border-white/10">
                    {envMapboxToken}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSaveToken} className="space-y-3">
                  <div className="text-[11px] text-white/60 space-y-1 bg-black/30 p-2.5 rounded-xl border border-white/10 font-mono">
                    <p>1. Đăng ký tài khoản miễn phí tại <span className="text-cyan-300">mapbox.com</span> (free 50,000 lượt load/tháng).</p>
                    <p>2. Đăng nhập và copy chuỗi <span className="text-emerald-300">Default public token</span> (bắt đầu bằng <code className="text-cyan-200">pk.eyJ...</code>).</p>
                    <p>3. Dán mã token vào file <code className="text-cyan-300">frontend/.env</code> với tên biến <code className="text-cyan-300">VITE_MAPBOX_TOKEN</code>.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-white/70 mb-1">Dán token tạm thời vào ô bên dưới:</label>
                    <input
                      type="text"
                      placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHgxMjM0NTY3ODkwIn0..."
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      className="w-full liquid-glass-inner rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={!tokenInput.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                    >
                      Lưu &amp; Kích Hoạt
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
