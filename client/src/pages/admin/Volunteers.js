import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import {
  Users,
  Mail,
  Phone,
  GraduationCap,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  UserCheck,
  UserX,
  Activity,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const AdminVolunteers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [skillsFilter, setSkillsFilter] = useState([]);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: volunteers, isLoading } = useQuery(
    ['adminVolunteers', debouncedSearchTerm, statusFilter, departmentFilter, yearFilter, skillsFilter],
    () => {
      // Convert skills array to comma-separated string for GET request compatibility
      const skillsParam = skillsFilter.length > 0 ? skillsFilter.join(',') : 'all';
      
      const params = { 
        search: debouncedSearchTerm, 
        status: statusFilter, 
        department: departmentFilter, 
        year: yearFilter, 
        skills: skillsParam 
      };
      
      return axios.get('/api/admin/volunteers', { params }).then(res => res.data);
    }
  );

  const approveVolunteerMutation = useMutation(
    (id) => axios.put(`/api/admin/volunteers/${id}/approve-nss`),
    {
      onSuccess: () => {
        toast.success('NSS application approved successfully!');
        queryClient.invalidateQueries('adminVolunteers');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to approve NSS application');
      }
    }
  );

  const deactivateVolunteerMutation = useMutation(
    (id) => axios.put(`/api/admin/volunteers/${id}/deactivate`),
    {
      onSuccess: () => {
        toast.success('Volunteer deactivated successfully!');
        queryClient.invalidateQueries('adminVolunteers');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to deactivate volunteer');
      }
    }
  );

  const activateVolunteerMutation = useMutation(
    (id) => axios.put(`/api/admin/volunteers/${id}/activate`),
    {
      onSuccess: () => {
        toast.success('Volunteer activated successfully!');
        queryClient.invalidateQueries('adminVolunteers');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to activate volunteer');
      }
    }
  );

  const rejectNSSMutation = useMutation(
    (id) => axios.put(`/api/admin/volunteers/${id}/reject-nss`),
    {
      onSuccess: () => {
        toast.success('NSS application rejected successfully!');
        queryClient.invalidateQueries('adminVolunteers');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to reject NSS application');
      }
    }
  );

  const handleApprove = (volunteerId) => {
    if (window.confirm('Are you sure you want to approve this volunteer?')) {
      approveVolunteerMutation.mutate(volunteerId);
    }
  };

  const handleDeactivate = (volunteerId) => {
    if (window.confirm('Are you sure you want to deactivate this volunteer?')) {
      deactivateVolunteerMutation.mutate(volunteerId);
    }
  };

  const handleActivate = (volunteerId) => {
    if (window.confirm('Are you sure you want to activate this volunteer?')) {
      activateVolunteerMutation.mutate(volunteerId);
    }
  };

  const handleRejectNSS = (volunteerId) => {
    if (window.confirm('Are you sure you want to reject this NSS application?')) {
      rejectNSSMutation.mutate(volunteerId);
    }
  };

  const handleViewDetails = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (volunteer) => {
    if (!volunteer.hasAppliedToNSS) return 'Not Applied to NSS';
    if (volunteer.nssApplicationStatus === 'approved') return 'NSS Approved';
    if (volunteer.nssApplicationStatus === 'pending') return 'Pending NSS Approval';
    if (volunteer.nssApplicationStatus === 'rejected') return 'NSS Rejected';
    return 'Unknown Status';
  };



  const getStatusIcon = (volunteer) => {
    if (!volunteer.hasAppliedToNSS) return <Clock className="w-4 h-4" />;
    if (volunteer.nssApplicationStatus === 'pending') return <Clock className="w-4 h-4" />;
    if (volunteer.nssApplicationStatus === 'approved') return <CheckCircle className="w-4 h-4" />;
    if (volunteer.nssApplicationStatus === 'rejected') return <XCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const getCourseColor = (course) => {
    const colors = {
      'B.Tech': 'bg-blue-100 text-blue-800',
      'BCA': 'bg-green-100 text-green-800',
      'BBA': 'bg-purple-100 text-purple-800',
      'B.Com': 'bg-yellow-100 text-yellow-800',
      'Nursing': 'bg-pink-100 text-pink-800',
      'Pharmacy': 'bg-indigo-100 text-indigo-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[course] || 'bg-gray-100 text-gray-800';
  };

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSkillsDropdown && !event.target.closest('.relative')) {
        setShowSkillsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSkillsDropdown]);

  useEffect(() => {
    // Remove manual invalidation - let React Query handle dependencies naturally
  }, [skillsFilter]);

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading indicator for search
  const isSearching = searchTerm !== debouncedSearchTerm;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Volunteer Management</h1>
              <p className="text-gray-600 mt-2">Manage and approve volunteer registrations</p>
            </div>
            {volunteers?.volunteers?.filter(v => v.hasAppliedToNSS && v.nssApplicationStatus === 'pending').length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 font-medium">
                    {volunteers?.volunteers?.filter(v => v.hasAppliedToNSS && v.nssApplicationStatus === 'pending').length} pending NSS approval(s)
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                             <div className="relative">
                 <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                 <input
                   type="text"
                   placeholder="Search volunteers..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                 />
                 {isSearching && (
                   <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                   </div>
                 )}
                 {searchTerm && !isSearching && (
                   <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                     <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                       {debouncedSearchTerm ? 'Searching...' : 'Ready'}
                     </div>
                   </div>
                 )}
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
                <option value="pending">Pending NSS Approval</option>
                <option value="approved">NSS Approved</option>
                <option value="rejected">NSS Rejected</option>
                <option value="not_applied">Not Applied to NSS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Courses</option>
                <option value="B.Tech">B.Tech</option>
                <option value="BCA">BCA</option>
                <option value="BBA">BBA</option>
                <option value="B.Com">B.Com</option>
                <option value="Nursing">Nursing</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Years</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <div className="relative">
                <div
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white"
                  onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
                >
                  <span className="text-gray-700">
                    {skillsFilter.length === 0 ? 'Select Skills' : `${skillsFilter.length} skill(s) selected`}
                  </span>
                </div>
                {showSkillsDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {skills.map((skill) => (
                      <label key={skill} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={skillsFilter.includes(skill)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSkillsFilter([...skillsFilter, skill]);
                            } else {
                              setSkillsFilter(skillsFilter.filter(s => s !== skill));
                            }
                          }}
                          className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{skill}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDepartmentFilter('all');
                  setYearFilter('all');
                  setSkillsFilter([]);
                }}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Summary Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Volunteers</p>
                <p className="text-2xl font-bold text-gray-900">{volunteers?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {volunteers?.volunteers?.filter(v => v.hasAppliedToNSS && v.nssApplicationStatus === 'pending').length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {volunteers?.volunteers?.filter(v => v.hasAppliedToNSS && v.nssApplicationStatus === 'approved').length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {volunteers?.volunteers?.filter(v => v.hasAppliedToNSS && v.nssApplicationStatus === 'rejected').length || 0}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Volunteers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volunteer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact & College
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course & Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                                 {volunteers?.volunteers && volunteers.volunteers.length > 0 ? (
                   volunteers.volunteers.map((volunteer) => (
                    <tr key={volunteer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {volunteer.profilePicture ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={volunteer.profilePicture}
                                alt={volunteer.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{volunteer.name}</div>
                            <div className="text-sm text-gray-500">{volunteer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {volunteer.nssApplicationData?.phone || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {volunteer.nssApplicationData?.college || 'Not Applied to NSS'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {/* Note: Backend field is 'department' but UI shows as 'Course' */}
                          {volunteer.nssApplicationData?.department || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {volunteer.nssApplicationData?.year ? `${volunteer.nssApplicationData.year} Year` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(volunteer.nssApplicationStatus || 'not_applied')}`}>
                          {getStatusText(volunteer)}
                        </span>
                        {!volunteer.isActive && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Activity className="h-4 w-4 mr-1 text-blue-500" />
                            {volunteer.eventsAttended || 0} events
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-green-500" />
                            {volunteer.totalHours || 0} hours
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(volunteer)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {volunteer.hasAppliedToNSS && volunteer.nssApplicationStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(volunteer._id)}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Approve NSS Application"
                              >
                                <UserCheck className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRejectNSS(volunteer._id)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Reject NSS Application"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {volunteer.isActive ? (
                            <button
                              onClick={() => handleDeactivate(volunteer._id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Deactivate"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(volunteer._id)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Activate"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No volunteers found</p>
                      <p className="text-gray-400 mt-2">No volunteers match your current filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Volunteer Details Modal */}
        {showDetailsModal && selectedVolunteer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Volunteer Details</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="text-sm text-gray-900">{selectedVolunteer.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-sm text-gray-900">{selectedVolunteer.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-sm text-gray-900">{selectedVolunteer.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* NSS Application Status */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">NSS Application Status</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedVolunteer.nssApplicationStatus || 'not_applied')}`}>
                          {getStatusText(selectedVolunteer)}
                        </span>
                      </div>
                      {selectedVolunteer.hasAppliedToNSS && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Applied Date</label>
                            <p className="text-sm text-gray-900">
                              {selectedVolunteer.nssApplicationData?.appliedAt ?
                                new Date(selectedVolunteer.nssApplicationData.appliedAt).toLocaleDateString() :
                                'Not available'
                              }
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* NSS Application Data */}
                  {selectedVolunteer.hasAppliedToNSS && selectedVolunteer.nssApplicationData && (
                    <>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">NSS Application Details</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <p className="text-sm text-gray-900">{selectedVolunteer.nssApplicationData.phone || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">College</label>
                            <p className="text-sm text-gray-900">{selectedVolunteer.nssApplicationData.college || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Course</label>
                            <p className="text-sm text-gray-900">{selectedVolunteer.nssApplicationData.department || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Year</label>
                            <p className="text-sm text-gray-900">{selectedVolunteer.nssApplicationData.year || 'Not provided'} Year</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                            <p className="text-sm text-gray-900">{selectedVolunteer.nssApplicationData.bloodGroup || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                            <p className="text-sm text-gray-900">{selectedVolunteer.nssApplicationData.fatherName || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                            <p className="text-sm text-gray-900">{selectedVolunteer.nssApplicationData.motherName || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <p className="text-sm text-gray-900">{selectedVolunteer.nssApplicationData.address || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">University Roll No</label>
                            <p className="text-sm text-gray-900">{selectedVolunteer.nssApplicationData.universityRollNo || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Skills & Motivation</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Skills</label>
                            <p className="text-sm text-gray-900">
                              {selectedVolunteer.nssApplicationData.skills && selectedVolunteer.nssApplicationData.skills.length > 0 ?
                                selectedVolunteer.nssApplicationData.skills.join(', ') :
                                'No skills listed'
                              }
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Motivation</label>
                            <p className="text-sm text-gray-900">
                              {selectedVolunteer.nssApplicationData.motivation || 'Not provided'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Activity Summary */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{selectedVolunteer.eventsAttended || 0}</div>
                        <div className="text-sm text-blue-800">Events Attended</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{selectedVolunteer.totalHours || 0}</div>
                        <div className="text-sm text-green-800">Total Hours</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{selectedVolunteer.achievements?.length || 0}</div>
                        <div className="text-sm text-purple-800">Achievements</div>
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  {selectedVolunteer.achievements && selectedVolunteer.achievements.length > 0 && (
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Achievements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedVolunteer.achievements.map((achievement, index) => (
                          <div key={index} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h4 className="font-medium text-yellow-900">{achievement.title}</h4>
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

                <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                  {selectedVolunteer.hasAppliedToNSS && selectedVolunteer.nssApplicationStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleApprove(selectedVolunteer._id);
                          setShowDetailsModal(false);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Approve NSS Application
                      </button>
                      <button
                        onClick={() => {
                          handleRejectNSS(selectedVolunteer._id);
                          setShowDetailsModal(false);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reject NSS Application
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVolunteers;
