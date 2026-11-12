import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Music,
  ChevronDown,
  Trash2,
  Headphones,
} from 'lucide-react';

const QUICK_SUGGESTIONS = [
  'Gợi ý cho tôi bài hát sôi động',
  'Ai là nghệ sĩ hot nhất hôm nay?',
  'Giải thích chỉ số âm phổ MFCC',
  'Tìm nhạc chill thư giãn học bài',
];

const FALLBACK_RESPONSES = {
  'sôi động': 'Gợi ý các ca khúc sôi động tràn đầy năng lượng trên ratunes:\n• "Making My Way" - Sơn Tùng M-TP (Tempo 128 BPM, Energy 0.9)\n• "See Tình (Speed Up)" - Hoàng Thùy Linh (Danceability 0.88)\n• "Waiting For You" - MONO (Synthwave Beat 125 BPM)\nBạn có thể nhấn vào mục Tìm Kiếm hoặc yêu cầu tôi tạo Playlist ngay nhé!',
  'nghệ sĩ': 'Hiện tại trên Bản đồ số GIS của ratunes, các nghệ sĩ nổi bật nhất gồm:\n• Sơn Tùng M-TP (Thái Bình / TP.HCM) - Kỷ lục lượt nghe & tương tác\n• Hoàng Thùy Linh (Hà Nội) - Âm hưởng dân gian đương đại\n• Đen Vâu (Quảng Ninh) - Triết lý cuộc sống mộc mạc\nBạn hãy mở tab "Bản Đồ GIS Nghệ Sĩ" ở thanh bên trái để xem tọa độ thực địa nhé!',
  'mfcc': 'Chỉ số MFCC (Mel-Frequency Cepstral Coefficients) là "dấu vân tay âm học" đặc trưng của bài hát. Trên ratunes, hệ thống trích xuất 8 hệ số MFCC để phân tích màu âm (timbre), phổ tần số giọng hát và nhạc cụ, từ đó đối chiếu phát hiện đạo nhạc (AI Plagiarism Check) và gợi ý bài hát đồng điệu chuẩn xác đến từng nốt nhạc!',
  'chill': 'Để tập trung làm việc hoặc học bài khuya, bạn hãy thử:\n• "Nấu Ăn Cho Em" - Đen Vâu (Acoustic nhẹ nhàng)\n• "Bao Tiền Một Mớ Bình Yên" - 14 Casper (Tempo 85 BPM, Valence 0.45)\n• Tuyển tập "Good Vibes Only" trong thư viện Playlist.\nChúc bạn có những giờ phút học tập hiệu quả!',
};

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Xin chào! Mình là ratunes AI Raccoon 🦝🎵. Bạn muốn tìm bài hát theo tâm trạng, tra cứu nghệ sĩ trên bản đồ GIS hay cần giải đáp về công nghệ âm thanh gì hôm nay?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText = input) => {
    const textToSend = messageText.trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: textToSend,
        history: messages.slice(-6).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
      });

      if (res.data && res.data.success && res.data.data) {
        const reply = typeof res.data.data === 'string' ? res.data.data : (res.data.data.reply || res.data.data.message);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: reply,
            timestamp: new Date(),
          },
        ]);
        return;
      }
      throw new Error('No reply in response');
    } catch (err) {
      // Intelligent fallback logic
      const lower = textToSend.toLowerCase();
      let fallbackText = '';

      if (lower.includes('sôi động') || lower.includes('năng lượng') || lower.includes('nhảy')) {
        fallbackText = FALLBACK_RESPONSES['sôi động'];
      } else if (lower.includes('nghệ sĩ') || lower.includes('hot') || lower.includes('ca sĩ')) {
        fallbackText = FALLBACK_RESPONSES['nghệ sĩ'];
      } else if (lower.includes('mfcc') || lower.includes('âm phổ') || lower.includes('chỉ số')) {
        fallbackText = FALLBACK_RESPONSES['mfcc'];
      } else if (lower.includes('chill') || lower.includes('buồn') || lower.includes('học') || lower.includes('ngủ')) {
        fallbackText = FALLBACK_RESPONSES['chill'];
      } else {
        fallbackText = `Tôi đã ghi nhận câu hỏi: "${textToSend}". Với công nghệ Spatial SoundAI và phân tích âm học 8 chiều trên ratunes, bạn có thể khám phá thêm kho nhạc phong phú tại tab Khám Phá hoặc Studio Tạo Playlist AI nhé!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: fallbackText,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: 'Lịch sử trò chuyện đã được làm mới. ratunes AI Raccoon sẵn sàng hỗ trợ bạn!',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* Floating Mascot Trigger Capsule */}
      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-40 select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 p-2 pr-4 rounded-full liquid-glass-dock border border-cyan-400/40 shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:scale-105 active:scale-95 transition-all"
            title="Trò chuyện cùng Trợ lý AI ratunes"
          >
            {/* Mascot Avatar with pulsating halo */}
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-cyan-300/60 shadow-lg flex-shrink-0 bg-black/40 flex items-center justify-center p-1">
              <img
                src="/ratunes-logo.png"
                alt="ratunes AI Assistant"
                className="w-full h-full object-contain filter drop-shadow group-hover:scale-110 transition-transform duration-300"
              />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black" />
            </div>

            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">ratunes AI</span>
                <Sparkles className="w-3 h-3 text-cyan-300 animate-pulse" />
              </div>
              <span className="text-[10px] text-cyan-200/70 font-medium block">
                Hỏi đáp âm nhạc
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Glass Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[94vw] sm:w-[410px] h-[550px] max-h-[82vh] z-50 select-none flex flex-col liquid-glass-window rounded-[32px] shadow-[0_25px_70px_rgba(0,0,0,0.85)] border border-white/25 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-black/20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl overflow-hidden border border-white/30 shadow-md bg-white/10 flex-shrink-0 flex items-center justify-center p-1">
                <img
                  src="/ratunes-logo.png"
                  alt="ratunes Mascot"
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>
              <div>
                <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                  ratunes AI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                </h3>
                <p className="text-[10px] text-white/55">Apple Spatial &amp; GIS Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="w-7 h-7 rounded-full liquid-glass-pill flex items-center justify-center text-white/60 hover:text-white"
                title="Xóa cuộc trò chuyện"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full liquid-glass-pill flex items-center justify-center text-white/60 hover:text-white"
                title="Đóng chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-cyan-400/40 flex-shrink-0 bg-black/50">
                      <img src="/ratunes-logo.jpg" alt="bot" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-line shadow-md ${
                      isUser
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-semibold rounded-tr-none'
                        : 'liquid-glass-inner text-white/95 border border-white/15 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-cyan-400/40 flex-shrink-0 bg-black/50">
                  <img src="/ratunes-logo.jpg" alt="bot" className="w-full h-full object-cover" />
                </div>
                <div className="liquid-glass-inner px-4 py-3 rounded-2xl rounded-tl-none border border-white/15 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions pills */}
          <div className="px-4 py-2 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-black/20">
            {QUICK_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                disabled={loading}
                className="px-2.5 py-1 rounded-full liquid-glass-pill text-[10px] text-white/70 hover:text-white border-white/15 whitespace-nowrap transition-colors flex-shrink-0"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-white/10 bg-black/30 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Hỏi ratunes AI bất cứ điều gì..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 liquid-glass-inner rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 border border-white/15 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black flex items-center justify-center shadow-md disabled:opacity-40 transition-all flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}