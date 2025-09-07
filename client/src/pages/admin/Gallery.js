import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { 
  Image, 
  User, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  Eye,
  Download,
  Tag,
  Heart,
  Eye as EyeIcon,
  Edit3,
  X,
  Save
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const AdminGallery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    event: '',
    image: null
  });
  const queryClient = useQueryClient();

  const { data: galleryItems, isLoading } = useQuery(
    ['adminGallery', searchTerm, statusFilter, categoryFilter],
    () => {
      return axios.get('/api/admin/gallery', {
        params: { search: searchTerm, status: statusFilter, category: categoryFilter }
      }).then(res => res.data);
    },
    {
      refetchInterval: 12000, // Refetch every 12 seconds for real-time updates
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: true,
      staleTime: 8000, // Consider data stale after 8 seconds
    }
  );

  // Fetch events for the edit modal dropdown
  const { data: eventsData, isLoading: eventsLoading } = useQuery(
    'events-for-admin-gallery',
    () => {
      return axios.get('/api/events').then(res => res.data);
    },
    {
      refetchInterval: 60000, // Refetch events every 60 seconds
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: true,
      staleTime: 30000, // Consider events data stale after 30 seconds
    }
  );

  const approveItemMutation = useMutation(
    (id) => {
      return axios.put(`/api/admin/gallery/${id}/approve`);
    },
    {
      onSuccess: (response) => {
        toast.success('Gallery item approved successfully!');
        queryClient.invalidateQueries('adminGallery');
        queryClient.invalidateQueries('adminDashboardStats');
        queryClient.invalidateQueries('adminRecentActivities');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to approve item');
      }
    }
  );

  const rejectItemMutation = useMutation(
    (id) => {
      return axios.delete(`/api/admin/gallery/${id}`);
    },
    {
      onSuccess: (response) => {
        toast.success('Gallery item rejected successfully!');
        queryClient.invalidateQueries('adminGallery');
        queryClient.invalidateQueries('adminDashboardStats');
        queryClient.invalidateQueries('adminRecentActivities');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to reject item');
      }
    }
  );

  const handleApprove = (itemId) => {
    if (window.confirm('Are you sure you want to approve this gallery item?')) {
      approveItemMutation.mutate(itemId);
    }
  };

  const updateItemMutation = useMutation(
    ({ id, data }) => {
      return axios.put(`/api/admin/gallery/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    {
      onSuccess: (response) => {
        toast.success('Gallery item updated successfully!');
        queryClient.invalidateQueries('adminGallery');
        setShowEditModal(false);
        setEditingItem(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update gallery item');
      }
    }
  );

  const handleReject = (itemId) => {
    if (window.confirm('Are you sure you want to reject this gallery item? This action cannot be undone.')) {
      rejectItemMutation.mutate(itemId);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      title: item.title,
      description: item.description || '',
      category: item.category,
      event: item.event?._id || '',
      image: null
    });
    setShowEditModal(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', editForm.title);
    formData.append('description', editForm.description);
    formData.append('category', editForm.category);
    if (editForm.event) formData.append('event', editForm.event);
    if (editForm.image) formData.append('image', editForm.image);
    
    updateItemMutation.mutate({ id: editingItem._id, data: formData });
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'plantation': 'bg-green-100 text-green-800',
      'cleanliness': 'bg-blue-100 text-blue-800',
      'awareness': 'bg-purple-100 text-purple-800',
      'blood-donation': 'bg-red-100 text-red-800',
      'education': 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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
              <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
              <p className="text-gray-600 mt-2">Manage, edit, and approve all gallery items uploaded by volunteers</p>
            </div>
            {/* Real-time status indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Live updates every 12s</span>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search gallery items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="plantation">Plantation</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="awareness">Awareness</option>
                <option value="blood-donation">Blood Donation</option>
                <option value="education">Education</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {galleryItems && galleryItems.gallery && galleryItems.gallery.length > 0 ? (
            galleryItems.gallery.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Image */}
                <div className="relative aspect-square bg-gray-200">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.isApproved ? 'approved' : 'pending')}`}>
                      {item.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 left-2 flex space-x-1">
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="p-1 bg-white bg-opacity-90 rounded-full text-blue-600 hover:bg-opacity-100 transition-all"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1 bg-white bg-opacity-90 rounded-full text-purple-600 hover:bg-opacity-100 transition-all"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {!item.isApproved && (
                      <>
                        <button
                          onClick={() => handleApprove(item._id)}
                          className="p-1 bg-white bg-opacity-90 rounded-full text-green-600 hover:bg-opacity-100 transition-all"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleReject(item._id)}
                          className="p-1 bg-white bg-opacity-90 rounded-full text-red-600 hover:bg-opacity-100 transition-all"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  
                  {/* Uploader Info */}
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <User className="h-4 w-4 mr-1" />
                    <span>{item.uploadedBy?.name || 'Unknown'}</span>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.isApproved 
                        ? 'bg-green-100 text-green-800' 
                        : item.isRejected 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.isApproved ? 'Approved' : item.isRejected ? 'Rejected' : 'Pending'}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      <span>{item.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      <span>{item.views || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                    {item.event && (
                      <span className="text-xs text-gray-500">
                        Event: {item.event.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No gallery items found</p>
              <p className="text-gray-400 mt-2">No items match your current filters or no items have been uploaded yet</p>
            </div>
          )}
        </motion.div>

        {/* Gallery Item Details Modal */}
        {showDetailsModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Gallery Item Details</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Image Section */}
                  <div>
                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                      {selectedItem.imageUrl ? (
                        <img
                          src={selectedItem.imageUrl}
                          alt={selectedItem.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="h-24 w-24 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    {!selectedItem.isApproved && (
                      <div className="flex space-x-3 mt-4">
                        <button
                          onClick={() => {
                            handleApprove(selectedItem._id);
                            setShowDetailsModal(false);
                          }}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            handleReject(selectedItem._id);
                            setShowDetailsModal(false);
                          }}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Details Section */}
                  <div>
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <p className="text-sm text-gray-900">{selectedItem.title}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <p className="text-sm text-gray-900">{selectedItem.description}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(selectedItem.category)}`}>
                              {selectedItem.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Uploader Info */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Uploader Information</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <p className="text-sm text-gray-900">{selectedItem.uploadedBy?.name || 'Unknown'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <p className="text-sm text-gray-900">{selectedItem.uploadedBy?.email || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Department</label>
                            <p className="text-sm text-gray-900">{selectedItem.uploadedBy?.department || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Event Info */}
                      {selectedItem.event && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">Related Event</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Event Title</label>
                              <p className="text-sm text-gray-900">{selectedItem.event.title}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Event Date</label>
                              <p className="text-sm text-gray-900">
                                {new Date(selectedItem.event.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Event Location</label>
                              <p className="text-sm text-gray-900">{selectedItem.event.location}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Statistics</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{selectedItem.likes?.length || 0}</div>
                            <div className="text-sm text-blue-800">Likes</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{selectedItem.views || 0}</div>
                            <div className="text-sm text-green-800">Views</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {selectedItem.isApproved ? 'Yes' : 'No'}
                            </div>
                            <div className="text-sm text-purple-800">Approved</div>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      {selectedItem.tags && selectedItem.tags.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedItem.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Upload Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Upload Date</label>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedItem.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Edit Image</h2>
              </div>
              
              <form onSubmit={handleUpdate} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      <option value="Plantation Drive">Plantation Drive</option>
                      <option value="Cleanliness Drive">Cleanliness Drive</option>
                      <option value="Blood Donation Camp">Blood Donation Camp</option>
                      <option value="Awareness Drive">Awareness Drive</option>
                      <option value="Health Camp">Health Camp</option>
                      <option value="Education Support">Education Support</option>
                      <option value="Disaster Relief">Disaster Relief</option>
                      <option value="Community Service">Community Service</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event (Optional)</label>
                    <select
                      value={editForm.event}
                      onChange={(e) => setEditForm({ ...editForm, event: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Event</option>
                      {eventsData?.map((event) => (
                        <option key={event._id} value={event._id}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Image (Optional)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <Image className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="edit-image-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Choose file</span>
                            <input
                              id="edit-image-upload"
                              type="file"
                              accept="image/*"
                              onChange={(e) => setEditForm({ ...editForm, image: e.target.files[0] })}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        <p className="text-xs text-gray-400">Leave empty to keep current image</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateItemMutation.isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {updateItemMutation.isLoading ? 'Updating...' : 'Update Image'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGallery;
