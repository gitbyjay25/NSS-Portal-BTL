import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ANNOUNCEMENT_CONFIG } from '../config/announcementConfig';
import logger from '../utils/logger';
import errorHandler from '../utils/errorHandler';
import {
  Megaphone,
  Search,
  Filter,
  Calendar,
  Users,
  Pin,
  Clock,
  ChevronDown
} from 'lucide-react';

const Announcements = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: response, isLoading, error } = useQuery(
    ['announcements', searchTerm, categoryFilter],
    () => {
      try {
        return axios.get('/api/announcements', {
          params: { 
            search: searchTerm, 
            category: categoryFilter === 'all' ? undefined : categoryFilter 
          }
        }).then(res => {
          return res.data;
        });
      } catch (error) {
        errorHandler.handleError(error, 'Announcements fetch');
        throw error;
      }
    },
    {
      onError: (error) => {
        errorHandler.handleError(error, 'Announcements query');
      }
    }
  );

  // Filter out expired announcements
  const isAnnouncementExpired = (announcement) => {
    if (!announcement.expiresAt) return false;
    const now = new Date();
    const expiryDate = new Date(announcement.expiresAt);
    return now > expiryDate;
  };

  const allAnnouncements = response?.announcements || [];
  const announcements = ANNOUNCEMENT_CONFIG.AUTO_HIDE_EXPIRED 
    ? allAnnouncements.filter(announcement => !isAnnouncementExpired(announcement))
    : allAnnouncements;
  
  // Count expired announcements for display
  const expiredCount = allAnnouncements.filter(announcement => isAnnouncementExpired(announcement)).length;

  // Mark announcement as read mutation
  const markAsReadMutation = useMutation(
    (announcementId) => axios.post(`/api/announcements/${announcementId}/read`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('announcements');
      },
      onError: (error) => {
        errorHandler.handleError(error, 'Mark announcement as read');
      }
    }
  );

  // Function to mark announcement as read
  const markAsRead = (announcementId) => {
    markAsReadMutation.mutate(announcementId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      event: 'bg-green-100 text-green-800',
      reminder: 'bg-yellow-100 text-yellow-800',
      achievement: 'bg-purple-100 text-purple-800',
      emergency: 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      general: '📢',
      event: '🎉',
      reminder: '⏰',
      achievement: '🏆',
      emergency: '🚨'
    };
    return icons[category] || '📢';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Announcements</h3>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  const announcementList = announcements;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Megaphone className="h-8 w-8 text-blue-600 mr-3" />
                Announcements
              </h1>
              <p className="text-gray-600 mt-1">Stay updated with latest NSS news and updates</p>
              {ANNOUNCEMENT_CONFIG.SHOW_EXPIRED_COUNT && expiredCount > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {expiredCount} {expiredCount > 1 ? ANNOUNCEMENT_CONFIG.EXPIRED_MESSAGE_PLURAL : ANNOUNCEMENT_CONFIG.EXPIRED_MESSAGE} {ANNOUNCEMENT_CONFIG.HIDDEN_MESSAGE}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Categories</option>
                <option value="general">General</option>
                <option value="event">Event</option>
                <option value="reminder">Reminder</option>
                <option value="achievement">Achievement</option>
                <option value="emergency">Emergency</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          {(searchTerm || categoryFilter !== 'all') && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Announcements List */}
        {announcementList.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements found</h3>
            <p className="text-gray-600">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Check back later for new announcements'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {announcementList.map((announcement) => (
              <div
                key={announcement._id}
                onClick={() => markAsRead(announcement._id)}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer ${
                  announcement.isPinned ? 'ring-2 ring-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getCategoryIcon(announcement.category)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        {announcement.title}
                        {announcement.isPinned && (
                          <Pin className="h-4 w-4 text-blue-600 ml-2" />
                        )}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(announcement.category)}`}>
                          {announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(announcement.createdAt)}
                        </div>
                        {announcement.createdBy && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="h-4 w-4 mr-1" />
                            {announcement.createdBy.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {announcement.content}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{announcement.readBy?.length || 0} read</span>
                  </div>
                </div>

                {announcement.expiresAt && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      Expires: {formatDate(announcement.expiresAt)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
