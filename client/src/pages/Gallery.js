import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { 
  Camera, 
  Filter, 
  Search, 
  Calendar,
  User,
  X,
  Plus,
  Edit3,
  Trash2,
  Upload,
  RefreshCw,
  ArrowUp
} from 'lucide-react';

const Gallery = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin';
  
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    event: '',
    month: ''
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: '',
    event: '',
    image: null
  });

  // Fetch gallery images with real-time updates
  const { data: galleryData, isLoading, error } = useQuery(
    ['gallery', filters],
    async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.event) params.append('event', filters.event);
      if (filters.month) params.append('month', filters.month);
      
      const response = await axios.get(`/api/gallery?${params.toString()}`);
      return response.data;
    },
    {
      keepPreviousData: true,
      refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
      refetchIntervalInBackground: true, // Continue refetching even when tab is not active
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  );

  // Fetch events for filter dropdown with real-time updates
  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useQuery(
    'events-for-gallery',
    async () => {
      try {
        const response = await axios.get('/api/events');
        return response.data;
      } catch (error) {
        console.error('❌ [REAL-TIME] Events API error:', error);
        throw error;
      }
    },
    {
      refetchInterval: 60000, // Refetch events every 60 seconds
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: true,
      staleTime: 30000, // Consider events data stale after 30 seconds
    }
  );

  const gallery = galleryData?.gallery || [];
  

  const categories = [
    'Plantation Drive',
    'Cleanliness Drive',
    'Blood Donation Camp',
    'Awareness Drive',
    'Health Camp',
    'Education Support',
    'Disaster Relief',
    'Community Service',
    'Other'
  ];

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      event: '',
      month: ''
    });
  };


  // Show scroll to top button when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Generate months for filter
  const generateMonths = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      months.push({ key: monthKey, label: monthLabel });
    }
    
    return months;
  };

  const months = generateMonths();
  // Events API returns array directly, not wrapped in object
  const events = eventsData || [];
  

  // Mutations for admin actions with real-time logging
  const uploadMutation = useMutation(
    (formData) => {
      return axios.post('/api/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    {
      onSuccess: (response) => {
        toast.success('Image uploaded successfully!');
        queryClient.invalidateQueries('gallery');
        setShowUploadModal(false);
        setUploadForm({ title: '', description: '', category: '', event: '', image: null });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to upload image');
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => {
      return axios.put(`/api/gallery/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    {
      onSuccess: (response) => {
        toast.success('Image updated successfully!');
        queryClient.invalidateQueries('gallery');
        setShowEditModal(false);
        setEditingItem(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update image');
      }
    }
  );

  const deleteMutation = useMutation(
    (id) => {
      return axios.delete(`/api/gallery/${id}`);
    },
    {
      onSuccess: (response) => {
        toast.success('Image deleted successfully!');
        queryClient.invalidateQueries('gallery');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete image');
      }
    }
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Plantation Drive': 'bg-green-100 text-green-800',
      'Cleanliness Drive': 'bg-blue-100 text-blue-800',
      'Blood Donation Camp': 'bg-red-100 text-red-800',
      'Awareness Drive': 'bg-purple-100 text-purple-800',
      'Health Camp': 'bg-pink-100 text-pink-800',
      'Education Support': 'bg-yellow-100 text-yellow-800',
      'Disaster Relief': 'bg-orange-100 text-orange-800',
      'Community Service': 'bg-indigo-100 text-indigo-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['Other'];
  };

  // Admin handler functions
  const handleUpload = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('description', uploadForm.description);
    formData.append('category', uploadForm.category);
    if (uploadForm.event) formData.append('event', uploadForm.event);
    if (uploadForm.image) formData.append('image', uploadForm.image);
    
    uploadMutation.mutate(formData);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setUploadForm({
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
    formData.append('title', uploadForm.title);
    formData.append('description', uploadForm.description);
    formData.append('category', uploadForm.category);
    if (uploadForm.event) formData.append('event', uploadForm.event);
    if (uploadForm.image) formData.append('image', uploadForm.image);
    
    updateMutation.mutate({ id: editingItem._id, data: formData });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm({ ...uploadForm, image: file });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="spinner w-12 h-12 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading gallery...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">Error loading gallery. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="relative">
            {/* Title Section - Perfectly Centered */}
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                Photo Gallery
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mt-2 px-4">
                Explore moments from our community service activities and events
              </p>
              {/* Real-time status indicator */}
              <div className="flex items-center justify-center mt-2 space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-gray-500">Live updates every 30s</span>
              </div>
            </div>
            
            {/* Upload Activity Button - Responsive positioning */}
            <div className="absolute top-0 right-0 hidden sm:block">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center px-3 py-2 sm:px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg text-sm sm:text-base"
              >
                <Upload className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden md:inline">Upload Activity</span>
                <span className="md:hidden">Upload</span>
              </button>
            </div>
          </div>
          
          {/* Mobile Upload Button */}
          <div className="sm:hidden mt-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center justify-center w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Activity
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search images..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Event Filter */}
            <div>
              <select
                value={filters.event}
                onChange={(e) => setFilters({ ...filters, event: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                style={{ backgroundColor: 'white', color: 'black' }}
              >
                <option value="" style={{ backgroundColor: 'white', color: 'black' }}>All Events</option>
                {events && events.length > 0 ? (
                  events.map((event) => {
                    return (
                      <option 
                        key={event._id} 
                        value={event._id}
                        style={{ backgroundColor: 'white', color: 'black' }}
                      >
                        {event.title}
                      </option>
                    );
                  })
                ) : (
                  <option disabled style={{ backgroundColor: 'white', color: 'black' }}>Loading events...</option>
                )}
              </select>
              <div className="text-xs text-gray-500 mt-1">
                Events loaded: {events.length}
                {events.length > 0 && (
                  <div>
                    First event: {events[0]?.title}
                  </div>
                )}
              </div>
            </div>

            {/* Month Filter */}
            <div>
              <select
                value={filters.month}
                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Months</option>
                {months.map((month) => (
                  <option key={month.key} value={month.key}>{month.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters and Refresh */}
          <div className="mt-4 flex justify-between">
            <button
              onClick={() => {
                queryClient.invalidateQueries('gallery');
                queryClient.invalidateQueries('events-for-gallery');
                toast.success('Gallery refreshed!');
              }}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh Gallery
            </button>
            
            {(filters.category || filters.search || filters.event || filters.month) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        {gallery.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later for new uploads.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gallery.map((item) => (
              <div 
                key={item._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedImage(item)}
              >
                {/* Image */}
                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                  <img
                    src={item.imageUrl || 'https://via.placeholder.com/300x300?text=Image'}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 flex flex-col space-y-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                    {isAdmin && (
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item);
                          }}
                          className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item._id);
                          }}
                          className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}



                  {/* Event Info */}
                  {item.event && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Calendar className="w-3 h-3 mr-1" />
                        {item.event.title}
                      </span>
                    </div>
                  )}

                  {/* Uploader and Date */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        <span>{item.uploadedBy?.name || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {galleryData?.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-2">
              <span className="text-gray-600">
                Page {galleryData.currentPage} of {galleryData.totalPages}
              </span>
            </nav>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedImage.title}
              </h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <img
                  src={selectedImage.imageUrl || 'https://via.placeholder.com/800x600?text=Image'}
                  alt={selectedImage.title}
                  className="w-full max-h-96 object-contain rounded-lg"
                />
              </div>
              
              {selectedImage.description && (
                <p className="text-gray-700 mb-4">
                  {selectedImage.description}
                </p>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Category:</span>
                  <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedImage.category)}`}>
                    {selectedImage.category}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Uploaded by:</span>
                  <span className="ml-2 text-gray-600">{selectedImage.uploadedBy?.name || 'Anonymous'}</span>
                </div>
                {selectedImage.event && (
                  <div>
                    <span className="font-medium text-gray-900">Event:</span>
                    <span className="ml-2 text-gray-600">{selectedImage.event.title}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-900">Date:</span>
                  <span className="ml-2 text-gray-600">{formatDate(selectedImage.createdAt)}</span>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Upload New Image</h2>
            </div>
            
            <form onSubmit={handleUpload} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event (Optional)</label>
                  <select
                    value={uploadForm.event}
                    onChange={(e) => setUploadForm({ ...uploadForm, event: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Event</option>
                    {events.map((event) => (
                      <option key={event._id} value={event._id}>{event.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploadMutation.isLoading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </form>
          </div>
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
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event (Optional)</label>
                  <select
                    value={uploadForm.event}
                    onChange={(e) => setUploadForm({ ...uploadForm, event: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Event</option>
                    {events.map((event) => (
                      <option key={event._id} value={event._id}>{event.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Leave empty to keep current image</p>
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
                  disabled={updateMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updateMutation.isLoading ? 'Updating...' : 'Update Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 animate-bounce"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default Gallery;
