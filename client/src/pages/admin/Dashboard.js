import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Image, 
  AlertCircle, 
  TrendingUp, 
  Clock,
  BarChart3,
  Plus,
  Settings,
  ClipboardList,
  MessageSquare,
  Megaphone,
  Bell
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [announcements, setAnnouncements] = useState([]);
  const [hasNewAnnouncements, setHasNewAnnouncements] = useState(false);

  // Fetch announcements for notification dot
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements?limit=1');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.announcements.length > 0) {
            setAnnouncements(data.announcements);
            setHasNewAnnouncements(true);
          }
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    fetchAnnouncements();
  }, []);

  const { data: dashboardData, isLoading } = useQuery(
    'adminDashboardStats',
    () => {
      return axios.get('/api/admin/dashboard').then(res => res.data);
    },
    {
      refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: true,
      staleTime: 5000, // Consider data stale after 5 seconds
    }
  );


  // Fetch recent activities with real-time updates
  const { data: activitiesData, isLoading: activitiesLoading } = useQuery(
    'adminRecentActivities',
    () => {
      return axios.get('/api/admin/activities').then(res => res.data);
    },
    {
      refetchInterval: 8000, // Refetch every 8 seconds for most recent activities
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: true,
      staleTime: 3000, // Consider activities stale after 3 seconds
    }
  );


  // Extract stats from the response
  const stats = dashboardData?.stats || {};
  const recentVolunteers = dashboardData?.recentVolunteers || [];
  const recentEvents = dashboardData?.recentEvents || [];
  const recentActivities = activitiesData?.activities || [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your NSS unit and monitor activities</p>
            </div>
            {/* Right side - Bell icon and status */}
            <div className="flex items-center space-x-4">
              {/* Announcements Bell Icon */}
              <Link 
                to="/admin/announcements" 
                className="relative text-gray-600 hover:text-gray-900 focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-6 h-6" />
                {hasNewAnnouncements && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </Link>

              {/* Real-time status indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live updates every 8s</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Volunteers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVolunteers || 0}</p>
                <p className="text-xs text-green-600 mt-1">
                  +{stats.newVolunteersThisMonth || 0} this month
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents || 0}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats.upcomingEvents || 0} upcoming
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Image className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gallery Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalGalleryItems || 0}</p>
                <p className="text-xs text-orange-600 mt-1">
                  {stats.pendingGalleryApprovals || 0} pending
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVolunteerHours || 0}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.averageHoursPerVolunteer || 0} avg/volunteer
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pending Approvals */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Pending Volunteer Approvals</h2>
                <Link
                  to="/admin/volunteers?status=pending"
                  className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {stats.pendingApprovals > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-yellow-900">Volunteer Applications</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        {stats.pendingApprovals} volunteer(s) waiting for approval
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center pt-4">
                    <Link
                      to="/admin/volunteers?status=pending"
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      Review all pending applications
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending approvals</p>
                  <p className="text-sm text-gray-400 mt-1">All volunteer applications are up to date!</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Live</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              {activitiesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading activities...</p>
                    </div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activities</p>
                  <p className="text-sm text-gray-400 mt-1">Activities will appear here in real-time</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.slice(0, 5).map((activity, index) => (
                    <div key={activity._id || index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'volunteer_approval' ? 'bg-blue-100' :
                          activity.type === 'event_created' ? 'bg-green-100' :
                          activity.type === 'gallery_approved' ? 'bg-purple-100' :
                          activity.type === 'attendance_marked' ? 'bg-orange-100' :
                          activity.type === 'feedback_approved' ? 'bg-pink-100' :
                          'bg-gray-100'
                        }`}>
                          {activity.type === 'volunteer_approval' ? <Users className="h-4 w-4 text-blue-600" /> :
                           activity.type === 'event_created' ? <Calendar className="h-4 w-4 text-green-600" /> :
                           activity.type === 'gallery_approved' ? <Image className="h-4 w-4 text-purple-600" /> :
                           activity.type === 'attendance_marked' ? <ClipboardList className="h-4 w-4 text-orange-600" /> :
                           activity.type === 'feedback_approved' ? <MessageSquare className="h-4 w-4 text-pink-600" /> :
                           <Clock className="h-4 w-4 text-gray-600" />}
                    </div>
                  </div>
                  <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          activity.type === 'volunteer_approval' ? 'text-blue-900' :
                          activity.type === 'event_created' ? 'text-green-900' :
                          activity.type === 'gallery_approved' ? 'text-purple-900' :
                          activity.type === 'attendance_marked' ? 'text-orange-900' :
                          activity.type === 'feedback_approved' ? 'text-pink-900' :
                          'text-gray-900'
                        }`}>
                          {activity.title}
                        </p>
                        <p className={`text-xs mt-1 ${
                          activity.type === 'volunteer_approval' ? 'text-blue-700' :
                          activity.type === 'event_created' ? 'text-green-700' :
                          activity.type === 'gallery_approved' ? 'text-purple-700' :
                          activity.type === 'attendance_marked' ? 'text-orange-700' :
                          activity.type === 'feedback_approved' ? 'text-pink-700' :
                          'text-gray-700'
                        }`}>
                          {activity.description}
                        </p>
                  </div>
                      <div className="flex-shrink-0">
                        <span className="text-xs text-gray-500">
                          {formatDate(activity.timestamp)}
                        </span>
                </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Pending Approvals Alert */}
        {stats.pendingApprovals > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-yellow-800">
                    Pending Volunteer Approvals
                  </h3>
                  <p className="text-yellow-700 mt-1">
                    You have <span className="font-semibold">{stats.pendingApprovals}</span> volunteer(s) waiting for approval.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Link
                    to="/admin/volunteers?status=pending"
                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors font-medium"
                  >
                    Review Now
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/events"
              className="flex flex-col items-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <Plus className="h-8 w-8 text-blue-600 mb-3" />
              <span className="font-medium text-blue-900">Create Event</span>
              <span className="text-sm text-blue-700 mt-1">Add new NSS activity</span>
            </Link>

            <Link
              to="/admin/volunteer-approval"
              className="flex flex-col items-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <Users className="h-8 w-8 text-green-600 mb-3" />
              <span className="font-medium text-green-900">Volunteer Approval</span>
              <span className="text-sm text-green-700 mt-1">Approve new registrations</span>
            </Link>

            <Link
              to="/admin/volunteer-management"
              className="flex flex-col items-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <Users className="h-8 w-8 text-blue-600 mb-3" />
              <span className="font-medium text-blue-900">Volunteer Management</span>
              <span className="text-sm text-blue-700 mt-1">Filter & manage existing</span>
            </Link>

            <Link
              to="/admin/gallery"
              className="flex flex-col items-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              <Image className="h-8 w-8 text-purple-600 mb-3" />
              <span className="font-medium text-purple-900">Gallery Management</span>
              <span className="text-sm text-purple-700 mt-1">Manage & edit all gallery items</span>
            </Link>

            <Link
              to="/admin/teams"
              className="flex flex-col items-center p-6 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-center"
            >
              <Users className="h-8 w-8 text-indigo-600 mb-3" />
              <span className="font-medium text-indigo-900">Manage Teams</span>
              <span className="text-sm text-indigo-700 mt-1">Team structure & members</span>
            </Link>

            <Link
              to="/admin/leadership"
              className="flex flex-col items-center p-6 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-center"
            >
              <Users className="h-8 w-8 text-indigo-600 mb-3" />
              <span className="font-medium text-indigo-900">Manage Leadership</span>
              <span className="text-sm text-indigo-700 mt-1">Add roles by year</span>
            </Link>

            <Link
              to="/admin/attendance"
              className="flex flex-col items-center p-6 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors text-center"
            >
              <ClipboardList className="h-8 w-8 text-teal-600 mb-3" />
              <span className="font-medium text-teal-900">Attendance</span>
              <span className="text-sm text-teal-700 mt-1">Mark & manage attendance</span>
            </Link>

            <Link
              to="/admin/attendance-analytics"
              className="flex flex-col items-center p-6 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center"
            >
              <BarChart3 className="h-8 w-8 text-orange-600 mb-3" />
              <span className="font-medium text-orange-900">Attendance Analytics</span>
              <span className="text-sm text-orange-700 mt-1">Year & month-wise insights</span>
            </Link>

            <Link
              to="/admin/profile"
              className="flex flex-col items-center p-6 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors text-center"
            >
              <Settings className="h-8 w-8 text-pink-600 mb-3" />
              <span className="font-medium text-pink-900">My Profile</span>
              <span className="text-sm text-pink-700 mt-1">Update personal info & password</span>
            </Link>

            <Link
              to="/admin/feedback"
              className="flex flex-col items-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              <MessageSquare className="h-8 w-8 text-purple-600 mb-3" />
              <span className="font-medium text-purple-900">Manage Feedback</span>
              <span className="text-sm text-purple-700 mt-1">Review & approve testimonials</span>
            </Link>

            <Link
              to="/admin/announcements"
              className="flex flex-col items-center p-6 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center"
            >
              <Megaphone className="h-8 w-8 text-orange-600 mb-3" />
              <span className="font-medium text-orange-900">Announcements</span>
              <span className="text-sm text-orange-700 mt-1">Create & manage announcements</span>
            </Link>
          </div>
        </motion.div>


        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-700">Database Connection</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-700">File Upload System</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-700">Email Service</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AdminDashboard;
