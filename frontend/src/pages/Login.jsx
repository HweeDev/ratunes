import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, KeyRound, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập không thành công');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-md liquid-glass-card rounded-[32px] p-8 shadow-2xl space-y-6 border border-white/20">
        {/* Brand */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-3xl liquid-glass-pill flex items-center justify-center p-2 mx-auto mb-3 shadow-xl border border-white/30">
            <img
              src="/ratunes-logo.png"
              alt="ratunes mascot"
              className="w-full h-full object-contain filter drop-shadow-md transform hover:scale-110 transition-transform duration-300"
            />
          </div>
          <h2 className="text-xl font-black text-white">Đăng Nhập ratunes</h2>
          <p className="text-xs text-white/60 mt-1">
            Apple Spatial Audio & GIS Music Intelligence Platform
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full liquid-glass-inner border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-green-500/60 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Mật Khẩu</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full liquid-glass-inner border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-green-500/60 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-500 hover:bg-green-400 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-green-500/20 transition-transform hover:scale-[1.01]"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Đang Đăng Nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-green-400 font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
