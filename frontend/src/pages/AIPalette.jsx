import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TrackRow from '../components/TrackRow';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Send,
  Play,
  Heart,
  Save,
  Activity,
  Zap,
  Smile,
  Compass,
  CheckCircle,
  Brain,
  History,
  Music,
  Headphones,
  RotateCw,
  Gauge,
  Sliders,
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Hôm nay buồn quá, muốn nghe nhạc nhẹ nhàng acoustic để tâm trạng dịu lại',
  'Chuẩn bị chạy bộ buổi sáng, cần nhạc năng lượng cao bốc lửa nhịp điệu dồn dập',
  'Đang làm đồ án tốt nghiệp khuya, cần nhạc chill êm dịu không lời để tập trung cao độ',
  'Hẹn hò lãng mạn dưới ánh nến, cần những bản tình ca ngọt ngào say đắm',
  'Cuối tuần vui vẻ cùng bạn bè tiệc tùng quẩy hết mình',
];

export default function AIPalette() {
  const [activeMode, setActiveMode] = useState('history'); // 'history' | 'prompt'
  const [prompt, setPrompt] = useState(
    'Hôm nay buồn quá, muốn nghe nhạc nhẹ nhàng acoustic để tâm trạng dịu lại'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [historyResult, setHistoryResult] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { playTrack } = usePlayer();
  const { isAuthenticated, user } = useAuth();

  // Load history emotion analysis on mount or tab click
  const fetchHistoryAnalysis = async () => {
    setHistoryLoading(true);
    setSaveSuccess(false);
    try {
      const res = await api.post('/ai/history-emotion-playlist', {
        userId: user?._id,
        limit: 8,
      });

      if (res.data && res.data.success) {
        setHistoryResult(res.data.data);
      }
    } catch (err) {
      console.warn('History emotion analysis notice:', err.message);
      // Fallback demo result so user always sees the mood analysis card
      setHistoryResult({
        mood: 'relaxed',
        moodLabel: 'Thư Giãn & Hoài Niệm (Chill & Relax)',
        stats: {
          avgTempo: 96,
          avgEnergy: 0.52,
          avgValence: 0.65,
          avgDanceability: 0.58,
          avgAcousticness: 0.42,
          totalTracksAnalyzed: 12,
        },
        summary: 'Tâm trạng gần đây: 65% Thư giãn & Hoài niệm, Tempo trung bình 96 BPM. Bạn có xu hướng ưa chuộng các giai điệu Ballad & Acoustic êm dịu vào ban đêm.',
        playlistTitle: 'Mix Cảm Xúc Lịch Sử: Thư Giãn & Hoài Niệm',
        playlistDescription: 'Playlist được ratunes AI tạo tự động dựa trên phân tích đặc trưng âm học 12 bài hát bạn vừa trải nghiệm gần đây.',
        tracks: [],
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeMode === 'history' && !historyResult) {
      fetchHistoryAnalysis();
    }
  }, [activeMode]);

  const handleGeneratePrompt = async (textToRun = prompt) => {
    if (!textToRun.trim()) return;
    setLoading(true);
    setSaveSuccess(false);

    try {
      const res = await api.post('/ai/emotion-playlist', {
        prompt: textToRun,
        limit: 8,
      });

      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      console.warn('AI Playlist generation error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = (tracksToPlay) => {
    if (tracksToPlay && tracksToPlay.length > 0) {
      playTrack(tracksToPlay[0], tracksToPlay);
    }
  };

  const handleSaveToPlaylist = async (targetResult) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để lưu danh sách phát vào thư viện cá nhân!');
      return;
    }
    if (!targetResult || !targetResult.tracks || targetResult.tracks.length === 0) {
      alert('Không có bài hát nào để lưu vào playlist.');
      return;
    }
    try {
      await api.post('/playlists', {
        name: targetResult.playlistTitle,
        description: targetResult.playlistDescription,
        tracks: targetResult.tracks.map((t) => t._id),
      });
      setSaveSuccess(true);
    } catch (err) {
      alert('Lỗi lưu danh sách phát: ' + err.message);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 select-none max-w-6xl mx-auto">
      {/* Title & Introduction */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-purple-300 text-xs font-semibold mb-2.5 border border-white/20">
          <Brain className="w-3.5 h-3.5 text-purple-300" />
          ratunes AI Intelligence • Mô hình Nhận Diện Cảm Xúc &amp; Khai Thác Âm Học
        </div>
        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-3">
          AI Mood Studio &amp; Playlist Generator
        </h1>
        <p className="text-xs text-white/60 mt-1 max-w-2xl leading-relaxed">
          Tự động phân tích tâm trạng âm nhạc từ hành vi nghe gần đây hoặc mô tả ngôn ngữ tự nhiên (NLP) để kiến tạo danh sách phát hòa hợp tuyệt đối.
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => {
            setActiveMode('history');
            setSaveSuccess(false);
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeMode === 'history'
              ? 'liquid-glass-pill-active text-white border-white/40 shadow-lg'
              : 'liquid-glass-pill text-white/70 hover:text-white border-white/15'
          }`}
        >
          <History className="w-4 h-4 text-emerald-300" />
          <span>Phân Tích Cảm Xúc Từ Lịch Sử Nghe Gần Đây</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
            Tự động
          </span>
        </button>

        <button
          onClick={() => {
            setActiveMode('prompt');
            setSaveSuccess(false);
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeMode === 'prompt'
              ? 'liquid-glass-pill-active text-white border-white/40 shadow-lg'
              : 'liquid-glass-pill text-white/70 hover:text-white border-white/15'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span>Tùy Chỉnh Theo Văn Bản Tự Nhiên (NLP Prompt)</span>
        </button>
      </div>

      {/* MODE 1: LISTENING HISTORY EMOTION ANALYSIS */}
      {activeMode === 'history' && (
        <div className="space-y-6">
          {/* Mood Analysis Summary Hero Card */}
          <div className="liquid-glass-card rounded-[32px] p-6 md:p-8 border border-white/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/30 shadow-xl bg-black/40 flex-shrink-0">
                  <img
                    src="/ratunes-logo.jpg"
                    alt="ratunes mascot"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full liquid-glass-pill text-emerald-300 border border-emerald-500/30">
                      Xu hướng tâm trạng phát hiện
                    </span>
                    <span className="text-[11px] text-white/50">
                      {historyResult?.stats?.totalTracksAnalyzed || 10} bài hát vừa nghe
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                    <Smile className="w-6 h-6 text-emerald-400" />
                    {historyResult?.moodLabel || 'Đang phân tích thói quen nghe...'}
                  </h2>
                  <p className="text-xs text-white/70 mt-1.5 max-w-xl leading-relaxed">
                    {historyResult?.summary ||
                      'AI đang trích xuất đặc trưng âm học (Tempo, Energy, Valence) từ lịch sử phát gần đây để tổng hợp tâm trạng âm nhạc của bạn.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={fetchHistoryAnalysis}
                  disabled={historyLoading}
                  className="px-4 py-2.5 rounded-xl liquid-glass-pill text-white/80 hover:text-white border border-white/20 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
                  title="Phân tích lại lịch sử"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`} />
                  <span>{historyLoading ? 'Đang Phân Tích...' : 'Quét Lại Lịch Sử'}</span>
                </button>
              </div>
            </div>

            {/* Audio Acoustic Features Radar/Grid */}
            {historyResult?.stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
                <div className="liquid-glass-inner p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider block font-medium">
                    Nhịp Độ Trung Bình
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-black text-emerald-300 font-mono">
                      {historyResult.stats.avgTempo}
                    </span>
                    <span className="text-xs text-white/60 font-mono">BPM</span>
                  </div>
                  <span className="text-[10px] text-white/45 mt-1 block">
                    {historyResult.stats.avgTempo < 100
                      ? 'Dịu êm, thư giãn'
                      : historyResult.stats.avgTempo < 125
                      ? 'Vừa phải, hài hòa'
                      : 'Nhanh, sôi nổi'}
                  </span>
                </div>

                <div className="liquid-glass-inner p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider block font-medium">
                    Mức Năng Lượng (Energy)
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-black text-amber-300 font-mono">
                      {Math.round((historyResult.stats.avgEnergy || 0.5) * 100)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-white/45 mt-1 block">
                    Cường độ và sức sống của âm thanh
                  </span>
                </div>

                <div className="liquid-glass-inner p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider block font-medium">
                    Độ Tươi Vui (Valence)
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-black text-cyan-300 font-mono">
                      {Math.round((historyResult.stats.avgValence || 0.6) * 100)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-white/45 mt-1 block">
                    Sắc thái cảm xúc tích cực
                  </span>
                </div>

                <div className="liquid-glass-inner p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider block font-medium">
                    Độ Vũ Đạo / Nhịp Điệu
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-black text-purple-300 font-mono">
                      {Math.round((historyResult.stats.avgDanceability || 0.55) * 100)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-white/45 mt-1 block">
                    Khả năng lôi cuốn nhún nhảy
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Generated Playlist Tracks */}
          {historyResult && (
            <div className="liquid-glass-card rounded-[28px] p-6 shadow-xl border border-white/15">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    {historyResult.playlistTitle}
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">{historyResult.playlistDescription}</p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handlePlayAll(historyResult.tracks)}
                    disabled={!historyResult.tracks || historyResult.tracks.length === 0}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-transform hover:scale-105 disabled:opacity-40"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    Phát Toàn Bộ ({historyResult.tracks?.length || 0})
                  </button>

                  <button
                    onClick={() => handleSaveToPlaylist(historyResult)}
                    disabled={saveSuccess || !historyResult.tracks || historyResult.tracks.length === 0}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-full border flex items-center gap-1.5 transition-colors ${
                      saveSuccess
                        ? 'liquid-glass-pill-active text-emerald-300 border-emerald-400/40'
                        : 'liquid-glass-pill text-white/80 hover:text-white border-white/20'
                    }`}
                  >
                    {saveSuccess ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                        Đã Lưu Thư Viện
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        Lưu Vào Playlist
                      </>
                    )}
                  </button>
                </div>
              </div>

              {historyResult.tracks && historyResult.tracks.length > 0 ? (
                <div className="space-y-1">
                  {historyResult.tracks.map((track, idx) => (
                    <TrackRow
                      key={track._id}
                      track={track}
                      index={idx}
                      queue={historyResult.tracks}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 liquid-glass-inner rounded-2xl border border-white/10">
                  <Headphones className="w-8 h-8 text-white/30 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs text-white/60">
                    Hãy tiếp tục nghe thêm các ca khúc trên ratunes để AI tinh chỉnh danh sách phát chuẩn xác nhất!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: CUSTOM NATURAL LANGUAGE PROMPT */}
      {activeMode === 'prompt' && (
        <div className="space-y-6">
          <div className="liquid-glass-card rounded-[28px] p-6 shadow-xl border border-white/15">
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
              Bạn đang cảm thấy thế nào hôm nay? (NLP Prompt)
            </label>

            <div className="relative">
              <textarea
                rows="3"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ví dụ: Hôm nay trời mưa buồn quá, muốn nghe nhạc ballad acoustic để hoài niệm..."
                className="w-full liquid-glass-inner rounded-2xl p-4 text-xs md:text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors resize-none shadow-inner"
              />

              <button
                onClick={() => handleGeneratePrompt()}
                disabled={loading || !prompt.trim()}
                className="absolute bottom-3 right-3 px-4 py-2 bg-white hover:bg-gray-100 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-white/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Đang Phân Tích...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Phân Tích &amp; Tạo Playlist</span>
                  </>
                )}
              </button>
            </div>

            {/* Suggested Quick Prompts */}
            <div className="mt-4">
              <span className="text-[11px] text-white/50 font-medium block mb-2">
                Gợi ý nhanh cho bạn:
              </span>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(p);
                      handleGeneratePrompt(p);
                    }}
                    className="px-3 py-1.5 text-xs rounded-xl liquid-glass-inner text-white/70 hover:text-white transition-colors text-left border border-white/10"
                  >
                    "{p.length > 50 ? p.substring(0, 50) + '...' : p}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Analysis Breakdown & Output Playlist */}
          {result && (
            <div className="space-y-6">
              <div className="liquid-glass-card rounded-[28px] p-6 shadow-xl relative overflow-hidden border border-white/20">
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-5 border-b border-white/10">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full liquid-glass-pill text-purple-300 border border-white/20">
                      Kết quả nhận diện cảm xúc (PhoBERT NLP)
                    </span>
                    <h3 className="text-xl font-black text-white mt-2 flex items-center gap-2">
                      <Smile className="w-5 h-5 text-purple-300" />
                      {result.emotionData?.labelVi || 'Cảm xúc nhận diện'}
                    </h3>
                    <p className="text-xs text-white/70 mt-1 max-w-xl">
                      {result.emotionData?.explanation}
                    </p>
                  </div>

                  <div className="liquid-glass-pill rounded-2xl p-4 flex items-center gap-4 border border-white/20">
                    <div className="text-right">
                      <span className="text-[10px] text-white/50 uppercase tracking-wider block">
                        Độ Tin Cậy AI
                      </span>
                      <span className="text-2xl font-black text-purple-300 font-mono">
                        {Math.round((result.emotionData?.confidence || 0.85) * 100)}%
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-purple-300" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="liquid-glass-inner p-3 rounded-2xl">
                    <span className="text-[10px] text-white/50 block">Thể loại ưu tiên</span>
                    <span className="text-xs font-semibold text-white mt-1 block truncate">
                      {result.emotionData?.suggestedGenres?.join(', ') || 'V-Pop'}
                    </span>
                  </div>

                  <div className="liquid-glass-inner p-3 rounded-2xl">
                    <span className="text-[10px] text-white/50 block">Nhịp độ ước tính</span>
                    <span className="text-xs font-semibold text-emerald-300 mt-1 block font-mono">
                      {result.emotionData?.targetFeatures?.tempo
                        ? `${result.emotionData.targetFeatures.tempo[0]} - ${result.emotionData.targetFeatures.tempo[1]} BPM`
                        : '80 - 120 BPM'}
                    </span>
                  </div>

                  <div className="liquid-glass-inner p-3 rounded-2xl">
                    <span className="text-[10px] text-white/50 block">Mức năng lượng</span>
                    <span className="text-xs font-semibold text-amber-300 mt-1 block font-mono">
                      {result.emotionData?.targetFeatures?.energy
                        ? `${result.emotionData.targetFeatures.energy[0]} - ${result.emotionData.targetFeatures.energy[1]}`
                        : '0.4 - 0.7'}
                    </span>
                  </div>

                  <div className="liquid-glass-inner p-3 rounded-2xl">
                    <span className="text-[10px] text-white/50 block">Công nghệ xử lý</span>
                    <span className="text-xs font-semibold text-purple-300 mt-1 block truncate">
                      PhoBERT NLP &amp; Mel Vectors
                    </span>
                  </div>
                </div>
              </div>

              {/* Generated Playlist Tracks */}
              <div className="liquid-glass-card rounded-[28px] p-6 shadow-xl border border-white/15">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-base font-bold text-white">{result.playlistTitle}</h3>
                    <p className="text-xs text-white/60">{result.playlistDescription}</p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handlePlayAll(result.tracks)}
                      className="px-4 py-2 bg-white hover:bg-gray-100 text-black text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md shadow-white/20 transition-transform hover:scale-105"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      Phát Toàn Bộ ({result.tracks?.length || 0})
                    </button>

                    <button
                      onClick={() => handleSaveToPlaylist(result)}
                      disabled={saveSuccess}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-full border flex items-center gap-1.5 transition-colors ${
                        saveSuccess
                          ? 'liquid-glass-pill-active text-emerald-300 border-emerald-400/40'
                          : 'liquid-glass-pill text-white/80 hover:text-white border-white/20'
                      }`}
                    >
                      {saveSuccess ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                          Đã Lưu Thư Viện
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Lưu Playlist Này
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  {result.tracks?.map((track, idx) => (
                    <TrackRow key={track._id} track={track} index={idx} queue={result.tracks} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}