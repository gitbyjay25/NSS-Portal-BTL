import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login based on the route being accessed
    const isAdminRoute = location.pathname.startsWith('/admin');
    const loginPath = isAdminRoute ? '/admin/login' : '/volunteer/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    // If user is admin but trying to access volunteer route, redirect to admin dashboard
    if (user.role === 'admin' && role === 'volunteer') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // If user is volunteer but trying to access admin route, redirect to volunteer dashboard
    if (user.role === 'volunteer' && role === 'admin') {
      return <Navigate to="/volunteer/dashboard" replace />;
    }
    // For other cases, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
