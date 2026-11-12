import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const audioRef = useRef(new Audio());

  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [hasLoggedCompleted, setHasLoggedCompleted] = useState(false);
  const [likedTrackIds, setLikedTrackIds] = useState(new Set());

  // Load user's liked track IDs on authentication
  useEffect(() => {
    if (!isAuthenticated) {
      setLikedTrackIds(new Set());
      return;
    }
    const fetchLikedIds = async () => {
      try {
        const res = await api.get('/tracks/user/liked-ids');
        if (res.data.success && Array.isArray(res.data.data)) {
          setLikedTrackIds(new Set(res.data.data.map(String)));
        }
      } catch (err) {
        console.warn('Could not fetch liked track IDs:', err.message);
      }
    };
    fetchLikedIds();
  }, [isAuthenticated]);

  const isLikedTrack = (trackId) => {
    if (!trackId) return false;
    return likedTrackIds.has(trackId.toString());
  };

  // Initialize Audio settings
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      // Check if track completed (>= 80% duration or >= 30 seconds) to log history once
      if (
        isAuthenticated &&
        currentTrack &&
        !hasLoggedCompleted &&
        audio.duration > 0 &&
        audio.currentTime / audio.duration >= 0.8
      ) {
        setHasLoggedCompleted(true);
        api.post('/history', {
          trackId: currentTrack._id,
          duration: Math.round(audio.currentTime),
          completed: true,
          action: 'play',
        }).catch(() => {});
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || currentTrack?.duration || 0);
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        nextTrack();
      }
    };

    const handleError = (e) => {
      console.warn('Audio playback notice:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrack, hasLoggedCompleted, repeatMode, isAuthenticated]);

  // Play a specific track
  const playTrack = (track, queue = null) => {
    if (!track) return;
    const audio = audioRef.current;

    if (queue && Array.isArray(queue) && queue.length > 0) {
      setPlaylist(queue);
      const idx = queue.findIndex((t) => t._id === track._id);
      setCurrentIndex(idx !== -1 ? idx : 0);
    } else if (playlist.length === 0 || !playlist.some((t) => t._id === track._id)) {
      setPlaylist([track]);
      setCurrentIndex(0);
    }

    setCurrentTrack(track);
    setHasLoggedCompleted(false);

    audio.src = track.audioUrl;
    audio.play().then(() => {
      setIsPlaying(true);
      // Log initial play event
      if (isAuthenticated) {
        api.post('/history', {
          trackId: track._id,
          duration: 0,
          completed: false,
          action: 'play',
        }).catch(() => {});
      }
    }).catch((err) => {
      console.warn('Auto-play blocked or audio load error:', err.message);
      setIsPlaying(false);
    });
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!currentTrack) {
      if (playlist.length > 0) {
        playTrack(playlist[0], playlist);
      }
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    let nextIdx = currentIndex + 1;

    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * playlist.length);
    } else if (nextIdx >= playlist.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    setCurrentIndex(nextIdx);
    playTrack(playlist[nextIdx], playlist);
  };

  const prevTrack = () => {
    const audio = audioRef.current;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    if (playlist.length === 0) return;
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      prevIdx = playlist.length - 1;
    }

    setCurrentIndex(prevIdx);
    playTrack(playlist[prevIdx], playlist);
  };

  const seek = (time) => {
    const audio = audioRef.current;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const setVolume = (val) => {
    const audio = audioRef.current;
    audio.volume = val;
    setVolumeState(val);
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (isMuted) {
      audio.volume = volume > 0 ? volume : 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);

  const toggleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  const toggleLike = async (trackId) => {
    if (!isAuthenticated || !trackId) return false;
    const strId = trackId.toString();
    const currentlyLiked = likedTrackIds.has(strId);

    // Optimistic UI update
    setLikedTrackIds((prev) => {
      const next = new Set(prev);
      if (currentlyLiked) next.delete(strId);
      else next.add(strId);
      return next;
    });

    if (currentTrack && currentTrack._id === trackId) {
      setCurrentTrack({
        ...currentTrack,
        isLiked: !currentlyLiked,
        likesCount: Math.max(0, (currentTrack.likesCount || 0) + (currentlyLiked ? -1 : 1)),
      });
    }

    try {
      const res = await api.post(`/tracks/${trackId}/like`);
      if (res.data.success && res.data.data) {
        const serverLiked = Boolean(res.data.data.liked);
        setLikedTrackIds((prev) => {
          const next = new Set(prev);
          if (serverLiked) next.add(strId);
          else next.delete(strId);
          return next;
        });

        // Trigger custom event so Playlists page can automatically update "Bài hát đã thích"
        window.dispatchEvent(new CustomEvent('ratunes_likes_changed', { detail: { trackId: strId, liked: serverLiked } }));
      }
      return res.data.data;
    } catch (err) {
      // Revert optimistic update on error
      setLikedTrackIds((prev) => {
        const next = new Set(prev);
        if (currentlyLiked) next.add(strId);
        else next.delete(strId);
        return next;
      });
      return null;
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        playlist,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        likedTrackIds,
        isLikedTrack,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        toggleLike,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
