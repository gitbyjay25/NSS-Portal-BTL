import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Award,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Settings,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Server,
  Calendar,
  Image
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const AdminProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const queryClient = useQueryClient();
  const { updateUser, user, isAuthenticated, loading } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();

  const { data: profile, isLoading, error } = useQuery(
    'adminProfile',
    () => axios.get('/api/admin/profile').then(res => res.data.user),
    {
      enabled: isAuthenticated && user?.role === 'admin', // Only run query if user is authenticated admin
      retry: false,
      onError: (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, redirect to login
          window.location.href = '/admin/login';
        }
      }
    }
  );


  const updateProfileMutation = useMutation(
    (data) => axios.put('/api/admin/profile', data),
    {
      onSuccess: () => {
        toast.success('Profile updated successfully!');
        queryClient.invalidateQueries('adminProfile');
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    }
  );

  const updateProfilePictureMutation = useMutation(
    (formData) => axios.put('/api/admin/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    {
      onSuccess: (response) => {
        toast.success('Profile picture updated successfully!');
        queryClient.invalidateQueries('adminProfile');
        // Update AuthContext with new profile picture
        updateUser({ profilePicture: response.data.profilePicture });
        setIsUploading(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile picture');
        setIsUploading(false);
      }
    }
  );

  const changePasswordMutation = useMutation(
    (data) => axios.post('/api/auth/change-password', data),
    {
      onSuccess: () => {
        toast.success('Password changed successfully!');
        reset();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to change password');
      }
    }
  );

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordChange = (data) => {
    // Only validate if user wants to change password
    if (!showPasswordSection) {
      return;
    }
    
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    changePasswordMutation.mutate(data);
  };

  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profilePicture', file);
      setIsUploading(true);
      updateProfilePictureMutation.mutate(formData);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    reset(profile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset(profile);
  };

  const handlePasswordToggle = () => {
    setShowPasswordSection(!showPasswordSection);
    if (showPasswordSection) {
      // Reset password form when closing
      reset({ ...profile, currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  // Show loading if AuthContext is still loading or profile data is loading
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {loading ? 'Checking authentication...' : 'Loading profile data...'}
          </p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and is admin
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <button
            onClick={() => window.location.href = '/admin/login'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">Please log in again to access your profile.</p>
          <button
            onClick={() => window.location.href = '/admin/login'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-600 mt-2">Manage your profile and account settings</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  {profile?.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt={profile.name}
                      className="h-32 w-32 rounded-full object-cover mx-auto border-4 border-blue-100"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto border-4 border-blue-100">
                      <User className="h-16 w-16 text-blue-600" />
                    </div>
                  )}
                  
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mt-4">{profile?.name}</h2>
                <p className="text-gray-600 text-sm">{profile?.email}</p>
                
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200">
                  <Shield className="h-4 w-4 mr-2" />
                  Administrator
                </div>

                <button
                  onClick={handleEdit}
                  className="mt-4 w-full flex items-center justify-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>

                {isUploading && (
                  <div className="mt-3 text-sm text-blue-600 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Uploading...
                  </div>
                )}
              </div>
            </div>


            {/* Admin Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-purple-600" />
                Admin Options
              </h3>
              
              <div className="space-y-3">
                <Link
                  to="/admin/dashboard"
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Admin Dashboard</span>
                  </div>
                  <span className="text-xs text-blue-600">→</span>
                </Link>

                <Link
                  to="/admin/volunteers"
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Manage Volunteers</span>
                  </div>
                  <span className="text-xs text-green-600">→</span>
                </Link>

                <Link
                  to="/admin/events"
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Manage Events</span>
                  </div>
                  <span className="text-xs text-orange-600">→</span>
                </Link>

                <Link
                  to="/admin/gallery"
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Image className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Gallery Management</span>
                  </div>
                  <span className="text-xs text-purple-600">→</span>
                </Link>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Server className="h-5 w-5 mr-2 text-green-600" />
                System Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">Connected</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Status</span>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Login</span>
                  <span className="text-sm text-gray-500">
                    {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Details Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-3 py-2 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit(onSubmit)}
                      disabled={updateProfileMutation.isLoading}
                      className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    {isEditing ? (
                      <input
                        type="text"
                        {...register('name', { required: 'Name is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.name || 'Not provided'}</p>
                    )}
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <p className="text-gray-900">{profile?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        {...register('phone', {
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: 'Please enter a valid 10-digit phone number'
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.phone || 'Not provided'}</p>
                    )}
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <p className="text-gray-900 capitalize">{profile?.role}</p>
                  </div>

                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Change Password
                </h3>
                <button
                  onClick={handlePasswordToggle}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showPasswordSection ? 'Cancel' : 'Change Password'}
                </button>
              </div>
              
              {showPasswordSection ? (
                <form onSubmit={handleSubmit(onPasswordChange)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                    <input
                        type={showCurrentPassword ? "text" : "password"}
                      {...register('currentPassword', { required: 'Current password is required' })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                    <input
                        type={showNewPassword ? "text" : "password"}
                      {...register('newPassword', { 
                        required: 'New password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        {...register('confirmPassword', { 
                          required: 'Please confirm your new password',
                          validate: value => value === newPassword || 'Passwords do not match'
                        })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                    )}
                    {confirmPassword && newPassword && confirmPassword !== newPassword && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Passwords do not match
                      </p>
                    )}
                    {confirmPassword && newPassword && confirmPassword === newPassword && (
                      <p className="text-green-500 text-sm mt-1 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Passwords match
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• At least 6 characters long</li>
                      <li>• Use a combination of letters and numbers</li>
                      <li>• Avoid common passwords</li>
                    </ul>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={changePasswordMutation.isLoading}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {changePasswordMutation.isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Changing...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">Your password is secure and up to date</p>
                  <p className="text-sm text-gray-400">Click "Change Password" above if you want to update it</p>
                </div>
              )}
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
