import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('soundai_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('soundai_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
          localStorage.setItem('soundai_user', JSON.stringify(res.data.data));
        } catch (err) {
          console.warn('Session expired or invalid token');
          logout();
        }
      }
      setLoading(false);
    };
    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, ...userData } = res.data.data;
    localStorage.setItem('soundai_token', receivedToken);
    localStorage.setItem('soundai_user', JSON.stringify(userData));
    setToken(receivedToken);
    setUser(userData);
    return res.data;
  };

  const register = async (username, email, password, role = 'user') => {
    const res = await api.post('/auth/register', { username, email, password, role });
    const { token: receivedToken, ...userData } = res.data.data;
    localStorage.setItem('soundai_token', receivedToken);
    localStorage.setItem('soundai_user', JSON.stringify(userData));
    setToken(receivedToken);
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('soundai_token');
    localStorage.removeItem('soundai_user');
    setToken(null);
    setUser(null);
  };

  const updateUserData = (newUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...newUserData };
      localStorage.setItem('soundai_user', JSON.stringify(merged));
      return merged;
    });
  };

  const isRole = (requiredRole) => {
    if (!user) return false;
    if (user.role === 'admin') return true; // admin has superuser access
    return user.role === requiredRole;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        role: user?.role || 'guest',
        login,
        register,
        logout,
        updateUserData,
        isRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
