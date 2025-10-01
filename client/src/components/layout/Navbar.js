import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ANNOUNCEMENT_CONFIG } from '../../config/announcementConfig';
import logger from '../../utils/logger';
import errorHandler from '../../utils/errorHandler';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Calendar, 
  Image, 
  Users,
  Bell,
  Home,
  Info,
  BarChart3,
  Camera,
  MessageSquare
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [hasNewAnnouncements, setHasNewAnnouncements] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    try {
      logout();
      navigate('/');
      setIsOpen(false);
    } catch (error) {
      errorHandler.handleError(error, 'Navbar handleLogout');
    }
  };

  // Simple function to check if announcement is expired
  const isAnnouncementExpired = (announcement) => {
    // If no expiry date, it's never expired
    if (!announcement.expiresAt) return false;
    
    // Check if current time is past expiry date
    const now = new Date();
    const expiryDate = new Date(announcement.expiresAt);
    return now > expiryDate;
  };

  // Fetch announcements for notification dot
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        
        const response = await fetch(`/api/announcements?limit=${ANNOUNCEMENT_CONFIG.FETCH_LIMIT}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.announcements.length > 0) {
            // Filter out expired announcements
            const activeAnnouncements = data.announcements.filter(announcement => 
              !isAnnouncementExpired(announcement)
            );
            
            setAnnouncements(activeAnnouncements);
            setHasNewAnnouncements(activeAnnouncements.length > 0);
            
          } else {
            setHasNewAnnouncements(false);
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        errorHandler.handleError(error, 'Navbar fetchAnnouncements');
        setHasNewAnnouncements(false);
      }
    };

    fetchAnnouncements();
    
    // Check for expired announcements based on config
    const interval = setInterval(fetchAnnouncements, ANNOUNCEMENT_CONFIG.CHECK_INTERVAL_MINUTES * 60 * 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Announcements', path: user?.role === 'admin' ? '/admin/announcements' : '/announcements', icon: Bell },
    { name: 'Cells', path: '/cells', icon: Users },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Gallery', path: '/gallery', icon: Camera },
    { name: 'Teams', path: '/teams', icon: Users },
  ];

  const volunteerMenuItems = [
    { name: 'Dashboard', path: '/volunteer/dashboard', icon: User },
    { name: 'Profile', path: '/volunteer/profile', icon: Settings },
  ];

  const adminMenuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: User },
    { name: 'Announcements', path: '/admin/announcements', icon: Bell },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Left Side - Branding with images.png Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Logo using images.png */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
              <img 
                src="/images.png" 
                alt="NSS Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Brand Text */}
            <div className="text-left">
              <div className="text-sm sm:text-lg font-serif font-semibold text-white">National Service Scheme</div>
              <div className="text-xs sm:text-sm text-gray-300 font-medium hidden sm:block">GRAPHIC ERA HILL UNIVERSITY, BHIMTAL</div>
            </div>
          </div>
          
          {/* Right Side - Navigation Links - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link to="/" className={`text-white ${isActive('/') ? 'border-b-2 border-white pb-1' : ''} font-medium`}>
              Home
            </Link>
            <Link to="/cells" className="text-gray-300 hover:text-white transition-colors duration-300">
              Cells
            </Link>
            <Link to="/about" className={`text-gray-300 hover:text-white transition-colors duration-300 ${isActive('/about') ? 'text-white border-b-2 border-white pb-1' : ''}`}>
              About
            </Link>
            <Link to="/events" className={`text-gray-300 hover:text-white transition-colors duration-300 ${isActive('/events') ? 'text-white border-b-2 border-white pb-1' : ''}`}>
              Events
            </Link>
            <Link 
              to={user?.role === 'admin' ? '/admin/gallery' : '/gallery'} 
              className={`text-gray-300 hover:text-white transition-colors duration-300 ${isActive('/gallery') || (user?.role === 'admin' && isActive('/admin/gallery')) ? 'text-white border-b-2 border-white pb-1' : ''}`}
            >
              Gallery
            </Link>
            <Link to="/teams" className="text-gray-300 hover:text-white transition-colors duration-300">
              Teams
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-3">
            {/* Announcements Bell Icon - Mobile */}
            <Link 
              to={user?.role === 'admin' ? '/admin/announcements' : '/announcements'} 
              className="relative text-white hover:text-gray-300 focus:outline-none p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Bell className="w-6 h-6" />
              {hasNewAnnouncements && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </Link>

            {/* Show user info on mobile if authenticated */}
            {isAuthenticated && (
              <div className="flex items-center space-x-2">
                <img
                  className="h-8 w-8 rounded-full border-2 border-white/20"
                  src={user?.profilePicture?.startsWith('/') ? `http://localhost:5002${user.profilePicture}` : (user?.profilePicture || 'https://via.placeholder.com/32x32')}
                  alt="Profile"
                />
                <span className="text-sm font-medium text-white hidden sm:block">
                  {user?.name}
                </span>
              </div>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gray-300 focus:outline-none p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Right side - Auth buttons or user menu - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Announcements Bell Icon */}
            <Link 
              to={user?.role === 'admin' ? '/admin/announcements' : '/announcements'} 
              className="relative text-white hover:text-gray-300 focus:outline-none p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Bell className="w-6 h-6" />
              {hasNewAnnouncements && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center space-x-2 text-white hover:text-gray-300 focus:outline-none"
                >
                  <img
                      className="h-8 w-8 rounded-full border-2 border-white/20"
                      src={user?.profilePicture?.startsWith('/') ? `http://localhost:5002${user.profilePicture}` : (user?.profilePicture || 'https://via.placeholder.com/32x32')}
                      alt="Profile"
                    />
                  <span className="hidden md:block text-sm font-medium">
                    {user?.name}
                  </span>
                  <Menu className="w-4 h-4" />
                </button>

                {/* Dropdown menu */}
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm text-gray-900 font-medium">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                        {user?.role}
                      </span>
                    </div>
                    
                    {user?.role === 'volunteer' && (
                      <>
                        {volunteerMenuItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              to={item.path}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsOpen(false)}
                            >
                              <Icon className="w-4 h-4 mr-2" />
                              {item.name}
                            </Link>
                          );
                        })}
                      </>
                    )}

                    {user?.role === 'admin' && (
                      <>
                        {adminMenuItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              to={item.path}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsOpen(false)}
                            >
                              <Icon className="w-4 h-4 mr-2" />
                              {item.name}
                            </Link>
                          );
                        })}
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/volunteer/login"
                  className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/admin/login"
                  className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium transition-colors duration-200 border border-white/30 rounded-lg"
                >
                  Admin
                </Link>
                <Link
                  to="/volunteer/register"
                  className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-lg"
                >
                  Create Account
                </Link>
                <Link
                  to="/volunteer/join-nss"
                  className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-lg"
                >
                  Join NSS
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Menu content */}
          <div className="relative z-50 px-4 pt-2 pb-3 space-y-1 bg-black/90 backdrop-blur-md border-t border-white/20">
            {/* Mobile menu header with close button */}
            <div className="flex items-center justify-between py-2 mb-2">
              <h3 className="text-lg font-semibold text-white">Navigation</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-300 focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User profile section for authenticated users */}
            {isAuthenticated && (
              <div className="bg-white/10 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-3">
                  <img
                      className="h-10 w-10 rounded-full border-2 border-white/20"
                      src={user?.profilePicture?.startsWith('/') ? `http://localhost:5002${user.profilePicture}` : (user?.profilePicture || 'https://via.placeholder.com/40x40')}
                      alt="Profile"
                    />
                  <div>
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-gray-300">{user?.email}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white mt-1">
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {navItems.map((item) => {
              // Special handling for Gallery - redirect admin to admin gallery
              const galleryPath = item.name === 'Gallery' && user?.role === 'admin' ? '/admin/gallery' : item.path;
              const isGalleryActive = item.name === 'Gallery' && user?.role === 'admin' ? isActive('/admin/gallery') : isActive(item.path);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={galleryPath}
                  className={`flex items-center px-3 py-3 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors duration-200 ${
                    isGalleryActive
                      ? 'bg-white/20 border-l-2 border-white'
                      : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
            
            {!isAuthenticated && (
              <>
                <div className="border-t border-white/20 pt-2 mt-2">
                  <p className="px-3 py-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Authentication
                  </p>
                  <Link
                    to="/volunteer/login"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Volunteer Login
                  </Link>
                  <Link
                    to="/admin/login"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Login
                  </Link>
                </div>
              </>
            )}
            
            {isAuthenticated && user?.role === 'volunteer' && (
              <>
                <div className="border-t border-white/20 pt-2 mt-2">
                  <p className="px-3 py-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Volunteer Menu
                  </p>
                  {volunteerMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <>
                <div className="border-t border-white/20 pt-2 mt-2">
                  <p className="px-3 py-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Admin Menu
                  </p>
                  {adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

            {isAuthenticated && (
              <div className="border-t border-white/20 pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
