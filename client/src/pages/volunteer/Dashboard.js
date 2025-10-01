import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  TrendingUp, 
  Award,
  Upload,
  CheckCircle,
  Shield,
  ClipboardList,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  
  // Custom CSS for 3D effects
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .card-3d {
        transform-style: preserve-3d;
        perspective: 1000px;
      }
      .card-3d:hover {
        transform: translateY(-8px) rotateX(5deg) rotateY(5deg);
        box-shadow: 0 25px 50px rgba(0,0,0,0.15);
      }
      .icon-3d {
        transition: all 0.3s ease;
      }
      .icon-3d:hover {
        transform: scale(1.1) rotate(5deg);
      }
      .floating {
        animation: float 6s ease-in-out infinite;
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      /* Hollywood-Level 3D Background Animations */
      .bg-3d-animation {
        position: relative;
        overflow: hidden;
        background: 
          linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(226, 232, 240, 0.9) 50%, rgba(203, 213, 225, 0.9) 100%),
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="%23e2e8f0" stroke-width="1" opacity="0.3"/></pattern><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="%2360a5fa" opacity="0.2"/></pattern></defs><rect width="100%" height="100%" fill="%23f8fafc"/><rect width="100%" height="100%" fill="url(%23grid)"/><rect width="100%" height="100%" fill="url(%23dots)"/></svg>');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
      }
      
      .dynamic-gradient {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          linear-gradient(45deg, 
            rgba(59, 130, 246, 0.1) 0%, 
            rgba(16, 185, 129, 0.1) 25%, 
            rgba(139, 92, 246, 0.1) 50%, 
            rgba(245, 158, 11, 0.1) 75%, 
            rgba(239, 68, 68, 0.1) 100%);
        background-size: 400% 400%;
        animation: gradientShift 4s ease-in-out infinite;
        z-index: -1;
      }
      
      .gradient-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 60% 60%, rgba(245, 158, 11, 0.08) 0%, transparent 50%);
        animation: gradientMove 4s ease-in-out infinite;
        z-index: -1;
      }
      
      .bg-3d-animation::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.15) 0%, transparent 60%),
          radial-gradient(circle at 60% 60%, rgba(245, 158, 11, 0.1) 0%, transparent 60%);
        animation: cinematicFloat 8s ease-in-out infinite;
        z-index: -1;
      }
      
      .particle-system {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: -1;
      }
      
      .particle {
        position: absolute;
        width: 3px;
        height: 3px;
        background: #60a5fa;
        border-radius: 50%;
        box-shadow: 0 0 10px #60a5fa, 0 0 20px #60a5fa, 0 0 30px #60a5fa;
        animation: particleFloat 6s linear infinite;
      }
      
      .particle:nth-child(1) { left: 5%; animation-delay: 0s; }
      .particle:nth-child(2) { left: 15%; animation-delay: 1s; }
      .particle:nth-child(3) { left: 25%; animation-delay: 2s; }
      .particle:nth-child(4) { left: 35%; animation-delay: 3s; }
      .particle:nth-child(5) { left: 45%; animation-delay: 4s; }
      .particle:nth-child(6) { left: 55%; animation-delay: 5s; }
      .particle:nth-child(7) { left: 65%; animation-delay: 6s; }
      .particle:nth-child(8) { left: 75%; animation-delay: 7s; }
      .particle:nth-child(9) { left: 85%; animation-delay: 8s; }
      .particle:nth-child(10) { left: 95%; animation-delay: 9s; }
      
      .floating-elements {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: -1;
      }
      
      .floating-icon {
        position: absolute;
        opacity: 0.6;
        animation: hollywoodFloat 6s ease-in-out infinite;
        text-shadow: 0 0 20px currentColor;
        filter: drop-shadow(0 0 10px currentColor);
      }
      
      .floating-icon:nth-child(1) { 
        top: 10%; 
        left: 8%; 
        font-size: 32px;
        animation-delay: 0s; 
        color: #60a5fa;
      }
      .floating-icon:nth-child(2) { 
        top: 20%; 
        right: 12%; 
        font-size: 28px;
        animation-delay: 3s; 
        color: #10b981;
      }
      .floating-icon:nth-child(3) { 
        top: 50%; 
        left: 15%; 
        font-size: 36px;
        animation-delay: 6s; 
        color: #8b5cf6;
      }
      .floating-icon:nth-child(4) { 
        top: 30%; 
        right: 8%; 
        font-size: 24px;
        animation-delay: 9s; 
        color: #f59e0b;
      }
      .floating-icon:nth-child(5) { 
        bottom: 20%; 
        left: 10%; 
        font-size: 30px;
        animation-delay: 12s; 
        color: #ef4444;
      }
      .floating-icon:nth-child(6) { 
        bottom: 40%; 
        right: 15%; 
        font-size: 26px;
        animation-delay: 15s; 
        color: #06b6d4;
      }
      
      .geometric-patterns {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: -1;
      }
      
      .pattern {
        position: absolute;
        opacity: 0.2;
        animation: hollywoodRotate 8s linear infinite;
        filter: drop-shadow(0 0 15px currentColor);
      }
      
      .pattern-1 {
        top: 8%;
        left: 3%;
        width: 100px;
        height: 100px;
        background: linear-gradient(45deg, #3b82f6, #1d4ed8);
        clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        animation-delay: 0s;
        box-shadow: 0 0 30px #3b82f6;
      }
      
      .pattern-2 {
        top: 18%;
        right: 6%;
        width: 80px;
        height: 80px;
        background: linear-gradient(45deg, #10b981, #059669);
        border-radius: 50%;
        animation-delay: 6s;
        box-shadow: 0 0 30px #10b981;
      }
      
      .pattern-3 {
        bottom: 12%;
        left: 8%;
        width: 90px;
        height: 90px;
        background: linear-gradient(45deg, #8b5cf6, #7c3aed);
        clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
        animation-delay: 12s;
        box-shadow: 0 0 30px #8b5cf6;
      }
      
      .pattern-4 {
        bottom: 22%;
        right: 8%;
        width: 70px;
        height: 70px;
        background: linear-gradient(45deg, #f59e0b, #d97706);
        clip-path: polygon(50% 0%, 0% 50%, 50% 100%, 100% 50%);
        animation-delay: 18s;
        box-shadow: 0 0 30px #f59e0b;
      }
      
      .light-rays {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: -1;
        background: 
          linear-gradient(45deg, transparent 45%, rgba(59, 130, 246, 0.1) 50%, transparent 55%),
          linear-gradient(-45deg, transparent 45%, rgba(16, 185, 129, 0.1) 50%, transparent 55%);
        animation: lightRays 6s ease-in-out infinite;
      }
      
      .floating-shapes {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: -1;
      }
      
      .floating-shape {
        position: absolute;
        opacity: 0.1;
        animation: shapeFloat 8s ease-in-out infinite;
      }
      
      .floating-shape:nth-child(1) {
        top: 5%;
        left: 5%;
        width: 60px;
        height: 60px;
        background: linear-gradient(45deg, #3b82f6, #1d4ed8);
        clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
        animation-delay: 0s;
      }
      
      .floating-shape:nth-child(2) {
        top: 15%;
        right: 10%;
        width: 40px;
        height: 40px;
        background: linear-gradient(45deg, #10b981, #059669);
        border-radius: 50%;
        animation-delay: 8s;
      }
      
      .floating-shape:nth-child(3) {
        bottom: 10%;
        left: 15%;
        width: 50px;
        height: 50px;
        background: linear-gradient(45deg, #8b5cf6, #7c3aed);
        clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
        animation-delay: 16s;
      }
      
      @keyframes shapeFloat {
        0%, 100% { 
          transform: translateY(0px) rotate(0deg) scale(1); 
          opacity: 0.1;
        }
        25% { 
          transform: translateY(-20px) rotate(5deg) scale(1.1); 
          opacity: 0.15;
        }
        50% { 
          transform: translateY(-35px) rotate(0deg) scale(1); 
          opacity: 0.1;
        }
        75% { 
          transform: translateY(-20px) rotate(-5deg) scale(1.1); 
          opacity: 0.15;
        }
      }
      
      @keyframes cinematicFloat {
        0%, 100% { 
          transform: translateY(0px) rotate(0deg) scale(1); 
          filter: hue-rotate(0deg);
        }
        25% { 
          transform: translateY(-20px) rotate(1deg) scale(1.02); 
          filter: hue-rotate(90deg);
        }
        50% { 
          transform: translateY(-40px) rotate(0deg) scale(1); 
          filter: hue-rotate(180deg);
        }
        75% { 
          transform: translateY(-20px) rotate(-1deg) scale(1.02); 
          filter: hue-rotate(270deg);
        }
      }
      
      @keyframes particleFloat {
        0% { 
          transform: translateY(100vh) rotate(0deg) scale(0); 
          opacity: 0; 
        }
        10% { 
          opacity: 1; 
          transform: translateY(90vh) rotate(36deg) scale(1);
        }
        90% { 
          opacity: 1; 
          transform: translateY(10vh) rotate(324deg) scale(1);
        }
        100% { 
          transform: translateY(-100px) rotate(360deg) scale(0); 
          opacity: 0; 
        }
      }
      
      @keyframes hollywoodFloat {
        0%, 100% { 
          transform: translateY(0px) rotate(0deg) scale(1); 
          opacity: 0.6;
          filter: drop-shadow(0 0 10px currentColor);
        }
        25% { 
          transform: translateY(-30px) rotate(8deg) scale(1.15); 
          opacity: 0.8;
          filter: drop-shadow(0 0 20px currentColor);
        }
        50% { 
          transform: translateY(-50px) rotate(0deg) scale(1); 
          opacity: 0.6;
          filter: drop-shadow(0 0 10px currentColor);
        }
        75% { 
          transform: translateY(-30px) rotate(-8deg) scale(1.15); 
          opacity: 0.8;
          filter: drop-shadow(0 0 20px currentColor);
        }
      }
      
      @keyframes hollywoodRotate {
        0% { 
          transform: rotate(0deg) scale(1) translateY(0px); 
          filter: drop-shadow(0 0 15px currentColor);
        }
        25% { 
          transform: rotate(90deg) scale(1.1) translateY(-15px); 
          filter: drop-shadow(0 0 25px currentColor);
        }
        50% { 
          transform: rotate(180deg) scale(1) translateY(0px); 
          filter: drop-shadow(0 0 15px currentColor);
        }
        75% { 
          transform: rotate(270deg) scale(1.1) translateY(-15px); 
          filter: drop-shadow(0 0 25px currentColor);
        }
        100% { 
          transform: rotate(360deg) scale(1) translateY(0px); 
          filter: drop-shadow(0 0 15px currentColor);
        }
      }
      
      @keyframes lightRays {
        0%, 100% { 
          opacity: 0.1; 
          transform: rotate(0deg) scale(1);
        }
        50% { 
          opacity: 0.3; 
          transform: rotate(180deg) scale(1.1);
        }
      }
      
      @keyframes gradientShift {
        0% { 
          background-position: 0% 50%; 
          filter: hue-rotate(0deg);
        }
        25% { 
          background-position: 100% 50%; 
          filter: hue-rotate(90deg);
        }
        50% { 
          background-position: 100% 100%; 
          filter: hue-rotate(180deg);
        }
        75% { 
          background-position: 0% 100%; 
          filter: hue-rotate(270deg);
        }
        100% { 
          background-position: 0% 50%; 
          filter: hue-rotate(360deg);
        }
      }
      
      @keyframes gradientMove {
        0% { 
          transform: scale(1) rotate(0deg); 
          opacity: 0.08;
        }
        25% { 
          transform: scale(1.1) rotate(90deg); 
          opacity: 0.12;
        }
        50% { 
          transform: scale(1) rotate(180deg); 
          opacity: 0.08;
        }
        75% { 
          transform: scale(1.1) rotate(270deg); 
          opacity: 0.12;
        }
        100% { 
          transform: scale(1) rotate(360deg); 
          opacity: 0.08;
        }
      }
      
      .depth-layer {
        position: relative;
        z-index: 1;
      }
      
      .glass-effect {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.4);
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.2),
          0 0 0 1px rgba(255, 255, 255, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const { data: upcomingEvents, isLoading: eventsLoading } = useQuery(
    'upcomingEvents',
    () => axios.get('/api/volunteers/events/upcoming').then(res => res.data)
  );

  const { data: recentActivities, isLoading: activitiesLoading } = useQuery(
    'recentActivities',
    () => {
      if (!user || !user._id) {
        throw new Error('User not loaded');
      }
      return axios.get(`/api/attendance/volunteer/${user._id}`).then(res => res.data);
    },
    {
      enabled: !!user && !!user._id // Only run query when user and _id are available
    }
  );

  if (eventsLoading || activitiesLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 relative overflow-hidden pt-16 sm:pt-20">

      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 depth-layer">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 floating-3d">Welcome back!</h1>
          <p className="text-gray-600 mt-2 floating-3d">Here's what's happening with your NSS activities</p>
        </motion.div>

        {/* NSS Status Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          {!user.hasAppliedToNSS ? (
            // Show if user hasn't applied yet
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-blue-900">
                      Ready to Join NSS?
                    </h3>
                    <p className="text-blue-700 mt-1">
                      Complete your NSS application to start participating in community service activities
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Link
                    to="/volunteer/join-nss"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Apply Now
                  </Link>
                </div>
              </div>
            </div>
          ) : user.nssApplicationStatus === 'pending' ? (
            // Show if application is pending
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-yellow-900">
                      NSS Application Pending
                    </h3>
                    <p className="text-yellow-700 mt-1">
                      Your application is under review. You will be notified once approved.
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Link
                    to="/volunteer/join-nss"
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium text-sm"
                  >
                    Update Application
                  </Link>
                </div>
              </div>
            </div>
          ) : user.nssApplicationStatus === 'rejected' ? (
            // Show if application is rejected - allow reapplication
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Shield className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-red-900">
                      NSS Application Rejected
                    </h3>
                    <p className="text-red-700 mt-1">
                      Your previous application was rejected. You can update and resubmit your application.
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Link
                    to="/volunteer/join-nss"
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                  >
                    Reapply Now
                  </Link>
                </div>
              </div>
            </div>
          ) : user.nssApplicationStatus === 'approved' ? (
            // Show if application is approved
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-green-900">
                      NSS Application Approved!
                    </h3>
                    <p className="text-green-700 mt-1">
                      Welcome to NSS! You can now participate in community service activities.
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Approved
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 card-3d glass-effect"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl shadow-md hover:rotate-12 transition-transform duration-300 icon-3d">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-3xl font-bold text-gray-900">{user.totalHours || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 card-3d"
          >
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
                <Link
                  to="/events"
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-8">
              {upcomingEvents && upcomingEvents.length > 0 ? (
                <div className="space-y-5">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div key={event._id} className="flex items-center space-x-6 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white">
                          <Calendar className="h-8 w-8 text-white drop-shadow-sm" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{event.title}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(event.startDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming events</p>
                  <Link
                    to="/events"
                    className="text-primary hover:text-primary-dark text-sm font-medium mt-2 inline-block"
                  >
                    Browse all events
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 card-3d glass-effect"
          >
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
                <Link
                  to="/volunteer/attendance"
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-8">
              {recentActivities && recentActivities.length > 0 ? (
                <div className="space-y-5">
                  {recentActivities.slice(0, 3).map((activity) => (
                    <div key={activity.eventId} className="flex items-center space-x-4 p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:rotate-1 transform perspective-1000" style={{ transformStyle: 'preserve-3d' }}>
                      <div className="flex-shrink-0">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm hover:scale-110 transition-transform duration-300 ${
                          activity.status === 'present' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {activity.status === 'present' ? (
                            <CheckCircle className="h-7 w-7 text-green-600" />
                          ) : (
                            <XCircle className="h-7 w-7 text-red-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{activity.eventTitle}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(activity.eventDate).toLocaleDateString()} • {activity.location}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium hover:scale-110 transition-transform duration-300 ${
                          activity.status === 'present' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {activity.status === 'present' ? 'Present' : 'Absent'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No activities yet</p>
                  <Link
                    to="/volunteer/attendance"
                    className="text-primary hover:text-primary-dark text-sm font-medium mt-2 inline-block"
                  >
                    View attendance history
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10 bg-white rounded-xl shadow-lg border border-gray-200 p-8 card-3d"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/events"
              className="flex items-center p-5 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100"
            >
              <Calendar className="h-6 w-6 text-blue-600 mr-3" />
              <span className="font-medium text-blue-900">Browse Events</span>
            </Link>
            <Link
              to="/volunteer/upload"
              className="flex items-center p-5 bg-green-50 rounded-xl hover:bg-green-100 transition-colors border border-green-100"
            >
              <Upload className="h-6 w-6 text-green-600 mr-3" />
              <span className="font-medium text-green-900">Upload Activity</span>
            </Link>
            <Link
              to="/volunteer/profile"
              className="flex items-center p-5 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors border border-purple-100"
            >
              <Users className="h-6 w-6 text-purple-600 mr-3" />
              <span className="font-medium text-purple-900">Update Profile</span>
            </Link>
            <Link
              to="/volunteer/attendance"
              className="flex items-center p-5 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors border border-teal-100"
            >
              <ClipboardList className="h-6 w-6 text-teal-600 mr-3" />
              <span className="font-medium text-teal-900">Attendance History</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
