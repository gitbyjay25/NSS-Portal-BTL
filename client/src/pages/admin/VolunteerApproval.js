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
  Clock,
  Heart,
  MapPin,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const VolunteerApproval = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const queryClient = useQueryClient();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: volunteers, isLoading } = useQuery(
    ['volunteers', debouncedSearchTerm, statusFilter],
    () => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      return axios.get(`/api/admin/volunteers?${params}`).then(res => res.data);
    }
  );

  const approveMutation = useMutation(
    (volunteerId) => axios.put(`/api/admin/volunteers/${volunteerId}/approve`),
    {
      onSuccess: () => {
        toast.success('Volunteer approved successfully!');
        queryClient.invalidateQueries('volunteers');
        setShowDetailsModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to approve volunteer');
      }
    }
  );

  const rejectMutation = useMutation(
    (volunteerId) => axios.put(`/api/admin/volunteers/${volunteerId}/reject`),
    {
      onSuccess: () => {
        toast.success('Volunteer rejected successfully!');
        queryClient.invalidateQueries('volunteers');
        setShowDetailsModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to reject volunteer');
      }
    }
  );

  const handleApprove = (volunteerId) => {
    approveMutation.mutate(volunteerId);
  };

  const handleReject = (volunteerId) => {
    if (window.confirm('Are you sure you want to reject this volunteer?')) {
      rejectMutation.mutate(volunteerId);
    }
  };

  const handleViewDetails = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowDetailsModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter volunteers for approval (only those who have applied to NSS)
  const approvalVolunteers = volunteers?.volunteers?.filter(v => v.hasAppliedToNSS) || [];
  const pendingVolunteers = approvalVolunteers.filter(v => v.nssApplicationStatus === 'pending');
  const approvedVolunteers = approvalVolunteers.filter(v => v.nssApplicationStatus === 'approved');
  const rejectedVolunteers = approvalVolunteers.filter(v => v.nssApplicationStatus === 'rejected');

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
              <h1 className="text-3xl font-bold text-gray-900">Volunteer Registration Approval</h1>
              <p className="text-gray-600 mt-2">Review and approve new volunteer registrations</p>
            </div>
            {pendingVolunteers.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 font-medium">
                    {pendingVolunteers.length} pending approval(s)
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{approvalVolunteers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{pendingVolunteers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{approvedVolunteers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{rejectedVolunteers.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search volunteers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Volunteers List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {approvalVolunteers
                  .filter(volunteer => {
                    if (statusFilter === 'all') return true;
                    return volunteer.nssApplicationStatus === statusFilter;
                  })
                  .map((volunteer) => (
                    <tr key={volunteer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={volunteer.profilePicture || '/default-avatar.svg'}
                              alt={volunteer.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{volunteer.name}</div>
                            <div className="text-sm text-gray-500">{volunteer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{volunteer.phone}</div>
                        <div className="text-sm text-gray-500">{volunteer.college}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{volunteer.department}</div>
                        <div className="text-sm text-gray-500">{volunteer.year} Year</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          volunteer.nssApplicationStatus === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : volunteer.nssApplicationStatus === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {volunteer.nssApplicationStatus === 'approved' ? 'NSS Approved' :
                           volunteer.nssApplicationStatus === 'rejected' ? 'NSS Rejected' : 'Pending Approval'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(volunteer)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {volunteer.nssApplicationStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(volunteer._id)}
                                className="text-green-600 hover:text-green-900"
                                disabled={approveMutation.isLoading}
                              >
                                <UserCheck className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleReject(volunteer._id)}
                                className="text-red-600 hover:text-red-900"
                                disabled={rejectMutation.isLoading}
                              >
                                <UserX className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Volunteer Details Modal */}
        {showDetailsModal && selectedVolunteer && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Volunteer Details</h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.bloodGroup || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Academic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">College</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.college}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.department}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Year</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.year} Year</p>
                      </div>
                    </div>
                  </div>

                  {/* Family Information */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Family Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.fatherName || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.motherName || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Address</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Address</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.address || 'Not specified'}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedVolunteer.skills && selectedVolunteer.skills.length > 0 ? (
                        selectedVolunteer.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No skills specified</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedVolunteer.nssApplicationStatus === 'pending' && (
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => handleReject(selectedVolunteer._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      disabled={rejectMutation.isLoading}
                    >
                      {rejectMutation.isLoading ? 'Rejecting...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => handleApprove(selectedVolunteer._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={approveMutation.isLoading}
                    >
                      {approveMutation.isLoading ? 'Approving...' : 'Approve'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerApproval;
