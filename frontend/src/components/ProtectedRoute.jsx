import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated, role } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role) && role !== 'admin') {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-lg font-bold text-rose-300 mb-2">Truy cập bị từ chối (403)</h2>
        <p className="text-xs text-white/60">
          Tài khoản của bạn ({role}) không có quyền truy cập vào chức năng này.
        </p>
      </div>
    );
  }

  return children;
}
