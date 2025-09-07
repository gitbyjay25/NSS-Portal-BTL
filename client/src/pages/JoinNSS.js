import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Building, 
  Calendar,
  CheckCircle,
  ArrowLeft,
  Shield,
  Users,
  Heart
} from 'lucide-react';

const JoinNSS = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm();

  // Populate form with existing data if available
  useEffect(() => {
    if (existingApplication?.data && existingApplication.hasApplied) {
      const appData = existingApplication.data;
      setValue('phone', appData.phone || '');
      setValue('college', appData.college || '');
      setValue('department', appData.department || '');
      setValue('year', appData.year?.toString() || '');
      setValue('bloodGroup', appData.bloodGroup || '');
      setValue('universityRollNo', appData.universityRollNo || '');
      setValue('motivation', appData.motivation || '');
      
      // Handle skills array
      if (appData.skills && Array.isArray(appData.skills)) {
        appData.skills.forEach(skill => {
          setValue(`skills.${skill}`, true);
        });
      }
    }
  }, [existingApplication, setValue]);

  // Check for existing application on component mount
  useEffect(() => {
    const checkExistingApplication = async () => {
      try {
        const response = await axios.get('/api/volunteers/profile');
        if (response.data.success && response.data.user) {
          setExistingApplication({
            hasApplied: response.data.user.hasAppliedToNSS,
            status: response.data.user.nssApplicationStatus,
            data: response.data.user.nssApplicationData
          });
        }
      } catch (error) {
        console.error('Error checking existing application:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      checkExistingApplication();
    }
  }, [user]);

  // Redirect if not logged in
  if (!user) {
    navigate('/volunteer/login');
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      
      // Handle skills array from checkboxes
      let skillsArray = [];
      if (data.skills && Array.isArray(data.skills)) {
        skillsArray = data.skills;
      } else if (data.skills && typeof data.skills === 'object') {
        skillsArray = Object.keys(data.skills).filter(key => data.skills[key]);
      }

      // Validate skills
      if (skillsArray.length === 0) {
        toast.error('Please select at least one skill or interest');
        setIsSubmitting(false);
        return;
      }


      // Prepare the application data
      const applicationData = {
        phone: data.phone,
        college: data.college,
        department: data.department,
        year: parseInt(data.year),
        bloodGroup: data.bloodGroup,
        universityRollNo: data.universityRollNo,
        skills: skillsArray,
        motivation: data.motivation || '' // Make motivation optional
      };


      // Call the API to submit NSS application using axios (which has auth headers set)
      const response = await axios.post('/api/auth/apply-nss', applicationData);
      const result = response.data;

      if (result.success) {
        toast.success('NSS Application Submitted Successfully!');
        toast.info('Your application is now pending admin approval. You will receive an email once approved.', {
          autoClose: 8000
        });

        // Redirect to volunteer dashboard
        navigate('/volunteer/dashboard');
      } else {
        toast.error(result.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('NSS application error:', error);
      toast.error('An error occurred while submitting your application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const courses = [
    'B.Tech',
    'BCA',
    'BBA',
    'B.Com',
    'Nursing',
    'Pharmacy',
    'Other'
  ];

  const bloodGroups = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-'
  ];

  const skills = [
    'Leadership',
    'Communication',
    'Event Management',
    'Social Media',
    'Photography',
    'Videography',
    'Content Writing',
    'Teaching',
    'Healthcare',
    'Environment',
    'Sports',
    'Arts & Culture',
    'Technology',
    'Other'
  ];

  const handleLogout = () => {
    logout();
    navigate('/volunteer/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-6">
            <Link
              to="/volunteer/dashboard"
              className="inline-flex items-center text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center text-gray-600 hover:text-gray-800"
            >
              <Shield className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join NSS as a Volunteer
            </h1>
            <p className="text-gray-600 mb-4">
              {existingApplication?.hasApplied 
                ? existingApplication.status === 'approved' 
                  ? 'You are already a Proud Volunteer of NSS GEHU Bhimtal Unit.'
                  : existingApplication.status === 'rejected'
                  ? 'Your previous application was rejected. You can update and resubmit your application.'
                  : 'Your application is currently under review. You can update your information if needed.'
                : 'Complete your NSS application to start your journey of community service'
              }
            </p>
            
            {/* User Info */}
            <div className="bg-primary-50 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-primary-900">{user.name}</p>
                  <p className="text-sm text-primary-700">{user.email}</p>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Account Verified</span>
                </div>
              </div>
              
              {/* Application Status */}
              {existingApplication?.hasApplied && (
                <div className="mt-4 pt-4 border-t border-primary-200">
                  <div className="flex items-center justify-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      existingApplication.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : existingApplication.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {existingApplication.status === 'approved' && <CheckCircle className="w-4 h-4 mr-2" />}
                      {existingApplication.status === 'rejected' && <Shield className="w-4 h-4 mr-2" />}
                      {existingApplication.status === 'pending' && <Calendar className="w-4 h-4 mr-2" />}
                      <span className="capitalize">
                        {existingApplication.status === 'approved' ? 'Application Approved' :
                         existingApplication.status === 'rejected' ? 'Application Rejected' :
                         'Application Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    {...register('name', { 
                      required: 'Full name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' }
                    })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      {...register('phone', { 
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: 'Please enter a valid 10-digit phone number'
                        }
                      })}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-primary-600" />
                Academic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    College/University <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('college', { 
                      required: 'College/University is required'
                    })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.college ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your college name"
                  />
                  {errors.college && (
                    <p className="text-red-500 text-sm mt-1">{errors.college.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('department', { 
                      required: 'Course is required'
                    })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.department ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Course</option>
                    {courses.map((course, index) => (
                      <option key={index} value={course}>{course}</option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year of Study <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('year', { 
                      required: 'Year of study is required'
                    })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.year ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Year</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                  {errors.year && (
                    <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('bloodGroup', { 
                      required: 'Blood group is required'
                    })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.bloodGroup ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                  {errors.bloodGroup && (
                    <p className="text-red-500 text-sm mt-1">{errors.bloodGroup.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University Roll No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('universityRollNo', { 
                      required: 'University roll no is required'
                    })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.universityRollNo ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your university roll number"
                  />
                  {errors.universityRollNo && (
                    <p className="text-red-500 text-sm mt-1">{errors.universityRollNo.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Skills & Interests Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-primary-600" />
                Skills & Interests
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Your Skills & Interests <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {skills.map((skill) => (
                    <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={skill}
                        {...register('skills')}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">Select at least one skill or interest</p>
              </div>
            </div>

            {/* Motivation Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Why do you want to join NSS?
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Motivation
                </label>
                <textarea
                  {...register('motivation', { 
                    minLength: { value: 50, message: 'Please write at least 50 characters if provided' }
                  })}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.motivation ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tell us about your motivation to join NSS and how you plan to contribute to community service... (Optional)"
                />
                {errors.motivation && (
                  <p className="text-red-500 text-sm mt-1">{errors.motivation.message}</p>
                )}
              </div>
            </div>

            {/* Declaration */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  {...register('declaration', { 
                    required: 'You must agree to the terms and conditions'
                  })}
                  className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Declaration</p>
                  <p>I declare that all the information provided above is true and correct to the best of my knowledge. I understand that providing false information may result in the rejection of my application.</p>
                </div>
              </div>
              {errors.declaration && (
                <p className="text-red-500 text-sm mt-2">{errors.declaration.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || existingApplication?.status === 'approved'}
                onClick={() => {}}
                className={`px-8 py-3 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                  existingApplication?.status === 'approved'
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Application...
                  </>
                ) : existingApplication?.status === 'approved' ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Application Already Approved
                  </>
                ) : existingApplication?.hasApplied ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Update & Resubmit Application
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit NSS Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinNSS;
