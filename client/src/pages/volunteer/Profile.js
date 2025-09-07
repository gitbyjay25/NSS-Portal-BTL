import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import logger from '../../utils/logger';
import errorHandler from '../../utils/errorHandler';
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
  Camera
} from 'lucide-react';
import axios from 'axios';
import pinCodeService from '../../services/pinCodeService';
import { useAuth } from '../../contexts/AuthContext';

const VolunteerProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    college: '',
    department: '',
    year: '',
    universityRollNo: '',
    bloodGroup: '',
    fatherName: '',
    motherName: '',
    address: '',
    state: '',
    district: '',
    skills: []
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationData, setLocationData] = useState(null);

  // Load profile data
  useEffect(() => {
    if (user) {
      
      setProfile(user);
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        college: user.college || 'Graphic Era Hill University, Bhimtal',
        department: user.department || '',
        year: user.year || '',
        universityRollNo: user.universityRollNo || '',
        bloodGroup: user.bloodGroup || '',
        fatherName: user.fatherName || '',
        motherName: user.motherName || '',
        address: user.address || '',
        pinCode: user.pinCode || '',
        state: user.state || '',
        district: user.district || '',
        skills: user.skills || []
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'pinCode') {
      // Handle PIN code input
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Auto-fetch location data when PIN code is complete (6 digits)
      if (value.length === 6 && pinCodeService.validatePinCode(value)) {
        fetchLocationData(value);
      } else if (value.length < 6) {
        // Clear location data if PIN code is incomplete
        setLocationData(null);
        setFormData(prev => ({
          ...prev,
          state: '',
          district: ''
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const fetchLocationData = async (pinCode) => {
    setIsLoadingLocation(true);
    try {
      const data = await pinCodeService.getLocationByPinCode(pinCode);
      setLocationData(data);
      setFormData(prev => ({
        ...prev,
        state: data.state,
        district: data.district
      }));
      
      // Clear PIN code error if any
      if (errors.pinCode) {
        setErrors(prev => ({
          ...prev,
          pinCode: ''
        }));
      }
    } catch (error) {
      errorHandler.handleError(error, 'Location fetch');
      setErrors(prev => ({
        ...prev,
        pinCode: error.message
      }));
      setLocationData(null);
      setFormData(prev => ({
        ...prev,
        state: '',
        district: ''
      }));
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSkillChange = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      
      const response = await axios.put('/api/volunteers/profile', formData);
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        // Update both local state and AuthContext
        setProfile(prev => ({ ...prev, ...formData }));
        updateUser(formData); // This updates the AuthContext
        
        // Also refresh user data from server to ensure consistency
        try {
          const userResponse = await axios.get('/api/auth/me');
          if (userResponse.data.success) {
            updateUser(userResponse.data.user);
            setProfile(userResponse.data.user);
          }
        } catch (refreshError) {
          errorHandler.handleError(refreshError, 'User data refresh');
        }
        
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/change-password', passwordData);
      if (response.data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
      const formData = new FormData();
      formData.append('profilePicture', file);
        const response = await axios.put('/api/volunteers/profile-picture', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data.success) {
          toast.success('Profile picture updated successfully!');
          setProfile(prev => ({ ...prev, profilePicture: response.data.profilePicture }));
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update profile picture');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
      college: profile?.college || 'Graphic Era Hill University, Bhimtal',
      department: profile?.department || '',
      year: profile?.year || '',
      universityRollNo: profile?.universityRollNo || '',
      bloodGroup: profile?.bloodGroup || '',
      fatherName: profile?.fatherName || '',
      motherName: profile?.motherName || '',
      address: profile?.address || '',
      skills: profile?.skills || []
    });
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-2">Manage your personal information and achievements</p>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture & Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Profile Picture */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mx-auto">
                    {profile?.profilePicture ? (
                      <img
                        src={profile.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {!isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>
                {isUploading && (
                  <p className="text-sm text-gray-500 mt-2">Uploading...</p>
                )}
              </div>

              {/* Basic Stats */}
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{profile?.eventsAttended || 0}</p>
                  <p className="text-sm text-blue-800">Events Attended</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{profile?.totalHours || 0}</p>
                  <p className="text-sm text-green-800">Total Hours</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{profile?.achievements?.length || 0}</p>
                  <p className="text-sm text-purple-800">Achievements</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.name}</p>
                    )}
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="flex items-center text-gray-900">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {profile?.email}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      <div className="flex items-center text-gray-900">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        {profile?.phone || 'Not provided'}
                      </div>
                    )}
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* College */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      College
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="college"
                        value={formData.college}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      <div className="flex items-center text-gray-900">
                        <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                        {profile?.college}
                      </div>
                    )}
                    {errors.college && (
                      <p className="text-red-500 text-sm mt-1">{errors.college}</p>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course
                    </label>
                    {isEditing ? (
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Course</option>
                        <option value="B.Tech">B.Tech</option>
                        <option value="BCA">BCA</option>
                        <option value="BBA">BBA</option>
                        <option value="B.Com">B.Com</option>
                        <option value="Nursing">Nursing</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{profile?.department}</p>
                    )}
                    {errors.department && (
                      <p className="text-red-500 text-sm mt-1">{errors.department}</p>
                    )}
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year of Study
                    </label>
                    {isEditing ? (
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Year</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{profile?.year} Year</p>
                    )}
                    {errors.year && (
                      <p className="text-red-500 text-sm mt-1">{errors.year}</p>
                    )}
                  </div>

                  {/* University Roll Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      University Roll Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="universityRollNo"
                        value={formData.universityRollNo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your university roll number"
                        required
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.universityRollNo || 'Not provided'}</p>
                    )}
                    {errors.universityRollNo && (
                      <p className="text-red-500 text-sm mt-1">{errors.universityRollNo}</p>
                    )}
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group
                    </label>
                    {isEditing ? (
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{profile?.bloodGroup || 'Not provided'}</p>
                    )}
                    {errors.bloodGroup && (
                      <p className="text-red-500 text-sm mt-1">{errors.bloodGroup}</p>
                    )}
                  </div>

                  {/* Father's Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Father's Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.fatherName || 'Not provided'}</p>
                    )}
                    {errors.fatherName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fatherName}</p>
                    )}
                  </div>

                  {/* Mother's Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mother's Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="motherName"
                        value={formData.motherName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.motherName || 'Not provided'}</p>
                    )}
                    {errors.motherName && (
                      <p className="text-red-500 text-sm mt-1">{errors.motherName}</p>
                    )}
                  </div>

                  {/* PIN Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIN Code
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="text"
                          name="pinCode"
                          value={formData.pinCode}
                          onChange={handleInputChange}
                          maxLength="6"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter 6-digit PIN code"
                        />
                        {isLoadingLocation && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900">{profile?.pinCode || 'Not provided'}</p>
                    )}
                    {errors.pinCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.pinCode}</p>
                    )}
                    {locationData && isEditing && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-800">
                          <strong>Location:</strong> {locationData.city}, {locationData.district}, {locationData.state}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Auto-filled from PIN code"
                        readOnly
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.state || 'Not provided'}</p>
                    )}
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                    )}
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Auto-filled from PIN code"
                        readOnly
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.district || 'Not provided'}</p>
                    )}
                    {errors.district && (
                      <p className="text-red-500 text-sm mt-1">{errors.district}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Enter your complete address"
                        required
                      />
                    ) : (
                      <p className="text-gray-900">{profile?.address || 'Not provided'}</p>
                    )}
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills & Interests
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        'Photography', 'Videography', 'Aipan Art', 'Drawing', 'Painting',
                        'Music', 'Dance', 'Public Speaking', 'Leadership', 'Team Management',
                        'Event Planning', 'Social Media', 'Content Writing', 'Teaching',
                        'First Aid', 'Blood Donation', 'Tree Plantation', 'Cleanliness Drive'
                      ].map((skill) => (
                        <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.skills.includes(skill)}
                            onChange={() => handleSkillChange(skill)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{skill}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile?.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No skills listed</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Change Password */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>
              
              <form onSubmit={onPasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>

            {/* Achievements */}
            {profile?.achievements && profile.achievements.length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Award className="h-6 w-6 mr-2 text-yellow-600" />
                  Achievements
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.achievements.map((achievement, index) => (
                    <div key={index} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h3 className="font-medium text-yellow-900">{achievement.title}</h3>
                      <p className="text-sm text-yellow-700 mt-1">{achievement.description}</p>
                      {achievement.date && (
                        <p className="text-xs text-yellow-600 mt-2">
                          {new Date(achievement.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerProfile;
