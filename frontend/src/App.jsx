import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';

import SpatialDock from './components/SpatialDock';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Player from './components/Player';
import ProtectedRoute from './components/ProtectedRoute';
import AIChatBot from './components/AIChatBot';

import Home from './pages/Home';
import Search from './pages/Search';
import GISMap from './pages/GISMap';
import AIPalette from './pages/AIPalette';
import TrackDetail from './pages/TrackDetail';
import ArtistDashboard from './pages/ArtistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Playlists from './pages/Playlists';
import History from './pages/History';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  const [theme, setTheme] = useState('ocean'); // 'ocean' | 'lagoon' | 'aurora'

  const themeGradients = {
    ocean: {
      bg: 'from-[#07131b] via-[#0b1c26] to-[#04090e]',
      orb1: 'bg-teal-500/25',
      orb2: 'bg-cyan-600/20',
      orb3: 'bg-emerald-600/20',
      waterLight: 'from-cyan-400/10 via-teal-300/5 to-transparent',
    },
    lagoon: {
      bg: 'from-[#051614] via-[#09221f] to-[#030d0c]',
      orb1: 'bg-emerald-500/25',
      orb2: 'bg-teal-500/20',
      orb3: 'bg-green-600/20',
      waterLight: 'from-emerald-400/10 via-teal-300/5 to-transparent',
    },
    aurora: {
      bg: 'from-[#0d1021] via-[#121630] to-[#080914]',
      orb1: 'bg-indigo-600/25',
      orb2: 'bg-purple-600/20',
      orb3: 'bg-sky-500/20',
      waterLight: 'from-purple-400/10 via-indigo-300/5 to-transparent',
    },
  };

  const currentT = themeGradients[theme] || themeGradients.ocean;

  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          {/* Spatial Ambient Canvas */}
          <div
            className={`min-h-screen bg-gradient-to-br ${currentT.bg} text-gray-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden`}
          >
            {/* Animated Fluid Ambient Blobs & Water Refraction Effect */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
              {/* Organic fluid orbs */}
              <div
                className={`absolute top-[-10%] left-[10%] w-[650px] h-[650px] rounded-full blur-[140px] animate-fluid-1 ${currentT.orb1}`}
              />
              <div
                className={`absolute bottom-[5%] right-[5%] w-[700px] h-[700px] rounded-full blur-[160px] animate-fluid-2 ${currentT.orb2}`}
              />
              <div
                className={`absolute top-[35%] right-[25%] w-[550px] h-[550px] rounded-full blur-[130px] animate-fluid-3 ${currentT.orb3}`}
              />

              {/* Water Surface Sun Refraction Ripple Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${currentT.waterLight} opacity-70`}
              />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_70%)]" />
            </div>

            {/* Left Spatial Floating Dock Capsule */}
            <SpatialDock />

            {/* Top Floating Glass Header Pill */}
            <div className="relative z-30 pt-3 md:pl-24">
              <Header currentTheme={theme} setTheme={setTheme} />
            </div>

            {/* Main Spatial Glass Window Container */}
            <div className="relative z-20 flex-1 px-4 md:px-8 md:pl-28 py-3 pb-28 flex flex-col max-w-[1600px] w-full mx-auto">
              <div className="liquid-glass-window rounded-[36px] flex flex-1 overflow-hidden shadow-2xl relative min-h-[750px]">
                {/* Left Sub-Sidebar: Library All Music */}
                <Sidebar />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto relative flex flex-col">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/gis-map" element={<GISMap />} />
                    <Route path="/ai-playlist" element={<AIPalette />} />
                    <Route path="/track/:id" element={<TrackDetail />} />
                    <Route path="/playlists" element={<Playlists />} />
                    <Route path="/history" element={<History />} />
                    <Route
                      path="/settings"
                      element={<Settings currentTheme={theme} setTheme={setTheme} />}
                    />

                    {/* Role Protected Routes */}
                    <Route
                      path="/artist-studio"
                      element={
                        <ProtectedRoute allowedRoles={['artist', 'admin']}>
                          <ArtistDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                  </Routes>
                </main>
              </div>
            </div>

            {/* Floating AI Raccoon Chat Assistant */}
            <AIChatBot />

            {/* Bottom Floating Sticky Player */}
            <Player />
          </div>
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
