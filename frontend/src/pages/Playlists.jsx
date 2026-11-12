import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TrackRow from '../components/TrackRow';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { ListMusic, Plus, Play, Trash2, Music } from 'lucide-react';

export default function Playlists() {
  const { isAuthenticated } = useAuth();
  const { playTrack } = usePlayer();
  const [playlists, setPlaylists] = useState([]);
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    fetchPlaylists();

    const handleLikesChanged = () => {
      fetchPlaylists();
    };
    window.addEventListener('ratunes_likes_changed', handleLikesChanged);
    return () => window.removeEventListener('ratunes_likes_changed', handleLikesChanged);
  }, [isAuthenticated]);

  const fetchPlaylists = async () => {
    try {
      const publicRes = await api.get('/playlists/public');
      setPublicPlaylists(publicRes.data.data || []);

      if (isAuthenticated) {
        const userRes = await api.get('/playlists/me');
        setPlaylists(userRes.data.data || []);
        if (userRes.data.data?.length > 0 && !selectedPlaylist) {
          setSelectedPlaylist(userRes.data.data[0]);
        }
      } else if (publicRes.data.data?.length > 0 && !selectedPlaylist) {
        setSelectedPlaylist(publicRes.data.data[0]);
      }
    } catch (err) {
      console.warn('Playlists fetch error:', err.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const res = await api.post('/playlists', {
        name: newTitle,
        description: newDesc,
        isPublic: true,
      });
      if (res.data.success) {
        setShowModal(false);
        setNewTitle('');
        setNewDesc('');
        fetchPlaylists();
      }
    } catch (err) {
      alert('Lỗi tạo danh sách phát: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa playlist này?')) return;
    try {
      await api.delete(`/playlists/${id}`);
      fetchPlaylists();
      setSelectedPlaylist(null);
    } catch (err) {
      alert('Lỗi xóa playlist: ' + err.message);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white">Danh Sách Phát Âm Nhạc</h1>
          <p className="text-xs text-white/60">Bộ sưu tập playlist cá nhân và danh sách tuyển chọn từ cộng đồng</p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-white hover:bg-gray-100 text-black text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md shadow-white/20 transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            Tạo Playlist Mới
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playlists Selector Column */}
        <div className="space-y-5">
          {isAuthenticated && (
            <div>
              <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2.5 px-1">
                Playlist Của Bạn ({playlists.length})
              </h3>
              <div className="space-y-2">
                {playlists.map((pl) => (
                  <div
                    key={pl._id}
                    onClick={() => setSelectedPlaylist(pl)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedPlaylist?._id === pl._id
                        ? 'liquid-glass-pill-active border-white/40 text-white'
                        : 'liquid-glass-card border-white/10 text-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {pl.name === 'Bài hát đã thích' ? (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center border border-white/20 shadow-md">
                          <Heart className="w-4 h-4 fill-white text-white" />
                        </div>
                      ) : (
                        <img
                          src={pl.coverUrl || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop'}
                          className="w-9 h-9 rounded-xl object-cover border border-white/20"
                        />
                      )}
                      <div>
                        <h4 className="text-xs font-bold truncate max-w-[140px] flex items-center gap-1.5">
                          {pl.name}
                          {pl.name === 'Bài hát đã thích' && (
                            <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded-full border border-rose-500/30">Auto</span>
                          )}
                        </h4>
                        <span className="text-[10px] text-white/50">{pl.tracks?.length || 0} bài hát</span>
                      </div>
                    </div>

                    {pl.name !== 'Bài hát đã thích' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(pl._id);
                        }}
                        className="text-white/40 hover:text-red-400 p-1"
                        title="Xóa playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2.5 px-1">
              Tuyển Chọn Nổi Bật ({publicPlaylists.length})
            </h3>
            <div className="space-y-2">
              {publicPlaylists.map((pl) => (
                <div
                  key={pl._id}
                  onClick={() => setSelectedPlaylist(pl)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    selectedPlaylist?._id === pl._id
                      ? 'liquid-glass-pill-active border-white/40 text-white'
                      : 'liquid-glass-card border-white/10 text-white/80'
                  }`}
                >
                  <img
                    src={pl.coverUrl}
                    className="w-9 h-9 rounded-xl object-cover border border-white/20"
                  />
                  <div>
                    <h4 className="text-xs font-bold truncate max-w-[160px]">{pl.name}</h4>
                    <span className="text-[10px] text-white/50">{pl.tracks?.length || 0} bài hát</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Playlist Content */}
        <div className="lg:col-span-2">
          {selectedPlaylist ? (
            <div className="liquid-glass-card rounded-[28px] p-6 shadow-xl border border-white/15">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-5 border-b border-white/10 mb-5">
                {selectedPlaylist.name === 'Bài hát đã thích' ? (
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-red-600 flex items-center justify-center shadow-2xl border border-white/30">
                    <Heart className="w-16 h-16 fill-white text-white drop-shadow-lg" />
                  </div>
                ) : (
                  <img
                    src={selectedPlaylist.coverUrl}
                    className="w-32 h-32 rounded-2xl object-cover shadow-2xl border border-white/30"
                  />
                )}
                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full liquid-glass-pill text-emerald-300 border border-white/20">
                    Playlist
                  </span>
                  <h2 className="text-xl font-black text-white mt-2 mb-1">{selectedPlaylist.name}</h2>
                  <p className="text-xs text-white/60 mb-4">{selectedPlaylist.description || 'Tuyển tập bài hát phát hành trực tuyến.'}</p>

                  <button
                    onClick={() => {
                      if (selectedPlaylist.tracks?.length > 0) {
                        playTrack(selectedPlaylist.tracks[0], selectedPlaylist.tracks);
                      }
                    }}
                    className="px-5 py-2 bg-white hover:bg-gray-100 text-black text-xs font-bold rounded-full flex items-center gap-2 shadow-lg shadow-white/20 transition-all hover:scale-105"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    Phát Toàn Bộ ({selectedPlaylist.tracks?.length || 0} bài)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                {selectedPlaylist.tracks?.map((track, idx) => (
                  <TrackRow key={track._id} track={track} index={idx} queue={selectedPlaylist.tracks} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 liquid-glass-inner rounded-[28px] border border-white/10">
              <Music className="w-8 h-8 text-white/40 mx-auto mb-2" />
              <p className="text-xs text-white/50">Chọn một danh sách phát để xem chi tiết bài hát.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal create playlist */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCreate}
            className="liquid-glass-window rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-white/25"
          >
            <h3 className="text-sm font-bold text-white">Tạo Danh Sách Phát Mới</h3>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Tên playlist *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Nhạc Lofi Làm Việc..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full liquid-glass-inner rounded-xl px-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">Mô tả</label>
              <textarea
                rows="2"
                placeholder="Mô tả nội dung playlist..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full liquid-glass-inner rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-medium text-white/60 hover:text-white"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-white hover:bg-gray-100 text-black text-xs font-bold rounded-xl"
              >
                Tạo Ngay
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
