import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { 
  Upload, 
  Image, 
  FileText, 
  Calendar, 
  MapPin, 
  Tag,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const UploadActivity = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    event: '',
    tags: '',
    imageUrl: ''
  });

  // Fetch events for dropdown
  const { data: eventsData } = useQuery(
    'events-for-upload',
    async () => {
      const response = await fetch('/api/events');
      const data = await response.json();
      return data;
    }
  );
  const [previewImage, setPreviewImage] = useState(null);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, we'll use a placeholder URL
      // In production, you'd upload to a cloud service like Cloudinary
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
        setFormData(prev => ({
          ...prev,
          imageUrl: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.imageUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Activity uploaded successfully! Awaiting admin approval.');
        setFormData({
          title: '',
          description: '',
          category: '',
          event: '',
          tags: '',
          imageUrl: ''
        });
        setPreviewImage(null);
      } else {
        toast.error(data.message || 'Failed to upload activity');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Activity</h1>
          <p className="text-gray-600 mt-2">
            Share your NSS activity photos and experiences with the community
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Photo <span className="text-red-500">*</span>
              </label>
              
              {!previewImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Click to upload your activity photo
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setFormData(prev => ({ ...prev, imageUrl: '' }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Tree Plantation at Eco Garden"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe your activity, what you did, and the impact it had..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Event (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Event (Optional)
              </label>
              <select
                name="event"
                value={formData.event}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an event (optional)</option>
                {eventsData && eventsData.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title} - {new Date(event.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Select the event this activity is related to. This will help organize photos in the gallery.
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., environment, community, service (separate with commas)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    title: '',
                    description: '',
                    category: '',
                    event: '',
                    tags: '',
                    imageUrl: ''
                  });
                  setPreviewImage(null);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Activity
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Guidelines */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Upload Guidelines
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
              Upload high-quality photos that clearly show your NSS activity
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
              Choose the most appropriate category for your activity
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
              Write a clear, descriptive title and detailed description
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
              All uploads require admin approval before appearing in the gallery
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
              Ensure photos are appropriate and related to NSS activities
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadActivity;
