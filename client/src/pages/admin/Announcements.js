import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  Megaphone,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  Pin,
  PinOff,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const AdminAnnouncements = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      targetAudience: 'all',
      isPinned: false
    }
  });

  // Global error handler to prevent extension errors
  useEffect(() => {
    const handleGlobalError = (event) => {
      if (event.error && event.error.message && event.error.message.includes('h1-check')) {
        event.preventDefault();
        console.warn('Browser extension error prevented:', event.error.message);
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleGlobalError);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleGlobalError);
    };
  }, []);

  const { data: response, isLoading } = useQuery(
    ['announcements', searchTerm, categoryFilter],
    () => {
      return axios.get('/api/announcements', {
        params: {
          search: searchTerm,
          category: categoryFilter === 'all' ? undefined : categoryFilter
        }
      }).then(res => res.data);
    }
  );

  const announcements = response?.announcements || [];

  const createAnnouncementMutation = useMutation(
    (data) => axios.post('/api/announcements', data),
    {
      onSuccess: () => {
        toast.success('Announcement created successfully!');
        queryClient.invalidateQueries('announcements');
        setShowCreateModal(false);
        reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create announcement');
      }
    }
  );

  const updateAnnouncementMutation = useMutation(
    ({ id, data }) => axios.put(`/api/announcements/${id}`, data),
    {
      onSuccess: () => {
        toast.success('Announcement updated successfully!');
        queryClient.invalidateQueries('announcements');
        setEditingAnnouncement(null);
        reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update announcement');
      }
    }
  );

  const deleteAnnouncementMutation = useMutation(
    (id) => axios.delete(`/api/announcements/${id}`),
    {
      onSuccess: () => {
        toast.success('Announcement deleted successfully!');
        queryClient.invalidateQueries('announcements');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete announcement');
      }
    }
  );

  const pinAnnouncementMutation = useMutation(
    (id) => axios.put(`/api/announcements/${id}/pin`),
    {
      onSuccess: () => {
        toast.success('Announcement pin status updated!');
        queryClient.invalidateQueries('announcements');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update pin status');
      }
    }
  );

  // Mark announcement as read mutation
  const markAsReadMutation = useMutation(
    (announcementId) => axios.post(`/api/announcements/${announcementId}/read`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('announcements');
      },
      onError: (error) => {
        // Silent error handling
      }
    }
  );

  // Function to mark announcement as read
  const markAsRead = (announcementId) => {
    markAsReadMutation.mutate(announcementId);
  };

  const onSubmit = (data) => {
    const cleanData = {
      title: data?.title || '',
      content: data?.content || '',
      category: data?.category || 'general',
      targetAudience: data?.targetAudience || 'all',
      expiresAt: data?.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      isPinned: Boolean(data?.isPinned)
    };
    
    if (editingAnnouncement) {
      updateAnnouncementMutation.mutate({ id: editingAnnouncement._id, data: cleanData });
    } else {
      createAnnouncementMutation.mutate(cleanData);
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    reset(announcement);
    setShowCreateModal(true);
  };

  const handleDelete = (announcementId) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      deleteAnnouncementMutation.mutate(announcementId);
    }
  };

  const handlePinToggle = (announcementId, isPinned) => {
    pinAnnouncementMutation.mutate(announcementId);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingAnnouncement(null);
    reset();
  };


  const getCategoryColor = (category) => {
    const colors = {
      'general': 'bg-blue-100 text-blue-800',
      'event': 'bg-purple-100 text-purple-800',
      'reminder': 'bg-orange-100 text-orange-800',
      'achievement': 'bg-green-100 text-green-800',
      'emergency': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Announcement Management</h1>
              <p className="text-gray-600 mt-2">Create and manage announcements for volunteers</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Announcement
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="general">General</option>
                <option value="event">Event</option>
                <option value="reminder">Reminder</option>
                <option value="achievement">Achievement</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                }}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Announcements List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {announcements && announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div 
                key={announcement._id} 
                onClick={() => markAsRead(announcement._id)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                        {announcement.isPinned && (
                          <Pin className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{announcement.content}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePinToggle(announcement._id, announcement.isPinned)}
                        className={`p-2 rounded-lg transition-colors ${
                          announcement.isPinned 
                            ? 'text-yellow-600 hover:bg-yellow-50' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        title={announcement.isPinned ? 'Unpin' : 'Pin'}
                      >
                        {announcement.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(announcement._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Megaphone className="h-4 w-4 mr-2" />
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(announcement.category)}`}>
                        {announcement.category}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{announcement.targetAudience || 'All Volunteers'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{announcement.readBy?.length || 0} read</span>
                      </div>
                      {announcement.expiresAt && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      {announcement.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      )}
                      <span className={announcement.isActive ? 'text-green-600' : 'text-gray-500'}>
                        {announcement.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No announcements found</p>
              <p className="text-gray-400 mt-2">Create your first announcement to get started</p>
            </div>
          )}
        </motion.div>

        {/* Create/Edit Announcement Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      {...register('title', { required: 'Title is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      <option value="general">General</option>
                      <option value="event">Event</option>
                      <option value="reminder">Reminder</option>
                      <option value="achievement">Achievement</option>
                      <option value="emergency">Emergency</option>
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <select
                      {...register('targetAudience')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue="all"
                    >
                      <option value="all">All Volunteers</option>
                      <option value="volunteers">Volunteers Only</option>
                      <option value="admins">Admins Only</option>
                      <option value="specific">Specific Recipients</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="datetime-local"
                      {...register('expiresAt')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('isPinned')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Pin this announcement
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      {...register('content', { required: 'Content is required' })}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.content && (
                      <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createAnnouncementMutation.isLoading || updateAnnouncementMutation.isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-600-dark transition-colors disabled:opacity-50"
                  >
                    {createAnnouncementMutation.isLoading || updateAnnouncementMutation.isLoading
                      ? 'Saving...'
                      : editingAnnouncement ? 'Update Announcement' : 'Create Announcement'
                    }
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncements;
