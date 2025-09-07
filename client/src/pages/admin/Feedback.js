import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search,
  Filter,
  Heart,
  Calendar,
  User,
  Mail,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';

const AdminFeedback = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch feedback data
  const { data: feedbackData, isLoading } = useQuery(
    ['adminFeedback', searchTerm, statusFilter, currentPage],
    () => {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        page: currentPage,
        limit: 10
      });
      return axios.get(`/api/admin/feedback/pending?${params}`).then(res => res.data);
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: true,
    }
  );

  // Approve feedback mutation
  const approveMutation = useMutation(
    (id) => axios.put(`/api/admin/feedback/${id}/approve`),
    {
      onSuccess: () => {
        toast.success('Feedback approved successfully!');
        queryClient.invalidateQueries('adminFeedback');
        setShowModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to approve feedback');
      }
    }
  );

  // Reject feedback mutation
  const rejectMutation = useMutation(
    (id) => axios.delete(`/api/admin/feedback/${id}`),
    {
      onSuccess: () => {
        toast.success('Feedback rejected successfully!');
        queryClient.invalidateQueries('adminFeedback');
        setShowModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to reject feedback');
      }
    }
  );

  const feedback = feedbackData?.feedback || [];
  const totalPages = feedbackData?.totalPages || 1;
  const total = feedbackData?.total || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleViewFeedback = (item) => {
    setSelectedFeedback(item);
    setShowModal(true);
  };

  const handleApprove = (id) => {
    if (window.confirm('Are you sure you want to approve this feedback?')) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (id) => {
    if (window.confirm('Are you sure you want to reject this feedback? This action cannot be undone.')) {
      rejectMutation.mutate(id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
              <p className="text-gray-600 mt-2">Review and manage volunteer testimonials</p>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <span className="text-sm text-gray-600">{total} total feedback</span>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, role, department, or testimonial..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </form>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feedback List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading feedback...</p>
            </div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No feedback submissions yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {feedback.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-gray-600">{item.role}</p>
                          {item.department && (
                            <p className="text-sm text-gray-500">{item.department}</p>
                          )}
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          item.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-700 italic leading-relaxed">
                          "{item.testimonial.length > 200 ? `${item.testimonial.substring(0, 200)}...` : item.testimonial}"
                        </p>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{item.likes?.length || 0} likes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{item.views || 0} views</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleViewFeedback(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {!item.isApproved && (
                        <>
                          <button
                            onClick={() => handleApprove(item._id)}
                            disabled={approveMutation.isLoading}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleReject(item._id)}
                            disabled={rejectMutation.isLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, total)} of {total} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Feedback Details Modal */}
        {showModal && selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Feedback Details</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{selectedFeedback.name}</h3>
                      <p className="text-gray-600">{selectedFeedback.role}</p>
                      {selectedFeedback.department && (
                        <p className="text-sm text-gray-500">{selectedFeedback.department}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedFeedback.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedFeedback.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>

                  {/* Testimonial */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Testimonial</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed italic">"{selectedFeedback.testimonial}"</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedFeedback.likes?.length || 0}</div>
                      <div className="text-sm text-blue-800">Likes</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{selectedFeedback.views || 0}</div>
                      <div className="text-sm text-green-800">Views</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedFeedback.isApproved ? 'Yes' : 'No'}
                      </div>
                      <div className="text-sm text-purple-800">Approved</div>
                    </div>
                  </div>

                  {/* Submission Info */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Submission Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submitted by:</span>
                        <span className="text-gray-900">{selectedFeedback.submittedBy?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="text-gray-900">{selectedFeedback.submittedBy?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submitted on:</span>
                        <span className="text-gray-900">{formatDate(selectedFeedback.createdAt)}</span>
                      </div>
                      {selectedFeedback.isApproved && selectedFeedback.approvedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Approved on:</span>
                          <span className="text-gray-900">{formatDate(selectedFeedback.approvedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!selectedFeedback.isApproved && (
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleApprove(selectedFeedback._id)}
                        disabled={approveMutation.isLoading}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {approveMutation.isLoading ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(selectedFeedback._id)}
                        disabled={rejectMutation.isLoading}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {rejectMutation.isLoading ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
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

export default AdminFeedback;
