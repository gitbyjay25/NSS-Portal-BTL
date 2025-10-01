import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Save,
  X,
  Upload,
  ExternalLink,
  Calendar,
  GraduationCap,
  Crown,
  Search,
  ChevronDown,
  ChevronUp,
  User
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminLeadership = () => {
  const [leaders, setLeaders] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLeader, setEditingLeader] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBatches, setExpandedBatches] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    academicBatch: '',
    nssLeadershipYear: '',
    role: '',
    course: '',
    linkedinProfile: '',
    order: 0,
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const predefinedRoles = [
    'Head',
    'Vice-Head',
    'Plantation Head',
    'Disha Head',
    'CLP Head',
    'Content Writing Head',
    'Social Media Head',
    'Photography/Videography Head'
  ];

  const predefinedCourses = [
    'B.Tech',
    'BCA',
    'BBA',
    'B.Com',
    'Nursing',
    'Pharmacy',
    'Other'
  ];

  useEffect(() => {
    fetchLeaders();
    fetchBatches();
  }, []);

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leaders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch leaders');
      const data = await response.json();
      setLeaders(data.leaders || []);
    } catch (error) {
      toast.error('Error fetching leaders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/leaders/batches');
      if (!response.ok) throw new Error('Failed to fetch batches');
      const data = await response.json();
      setBatches(data.batches || []);
    } catch (error) {
      toast.error('Error fetching batches: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (photoFile) {
        formDataToSend.append('profilePicture', photoFile);
      }

      const url = editingLeader ? `/api/leaders/${editingLeader._id}` : '/api/leaders';
      const method = editingLeader ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save leader: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      toast.success(data.message);
      
      resetForm();
      fetchLeaders();
      fetchBatches();
    } catch (error) {
      toast.error('Error saving leader: ' + error.message);
    }
  };

  const handleEdit = (leader) => {
    setEditingLeader(leader);
    setFormData({
      name: leader.name,
      academicBatch: leader.academicBatch || '',
      nssLeadershipYear: leader.nssLeadershipYear || '',
      role: leader.role,
      course: leader.course,
      linkedinProfile: leader.linkedinProfile || '',
      order: leader.order,
    });
    setPhotoPreview(leader.profilePicture || '');
    setShowForm(true);
  };

  const handleDelete = async (leaderId) => {
    if (!window.confirm('Are you sure you want to delete this leader?')) return;
    
    try {
      const response = await fetch(`/api/leaders/${leaderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete leader');
      
      const data = await response.json();
      toast.success(data.message);
      fetchLeaders();
      fetchBatches();
    } catch (error) {
      toast.error('Error deleting leader: ' + error.message);
    }
  };


  const resetForm = () => {
    setFormData({
      name: '',
      academicBatch: '',
      nssLeadershipYear: '',
      role: '',
      course: '',
      linkedinProfile: '',
      order: 0,
    });
    setPhotoFile(null);
    setPhotoPreview('');
    setEditingLeader(null);
    setShowForm(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleBatchExpansion = (batch) => {
    const newExpanded = new Set(expandedBatches);
    if (newExpanded.has(batch)) {
      newExpanded.delete(batch);
    } else {
      newExpanded.add(batch);
    }
    setExpandedBatches(newExpanded);
  };

  const filteredLeaders = leaders.filter(leader => {
    const matchesBatch = selectedBatch === 'all' || leader.nssLeadershipYear === selectedBatch;
    const matchesSearch = leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leader.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leader.course.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBatch && matchesSearch;
  });

  const groupedLeaders = filteredLeaders.reduce((acc, leader) => {
    if (!acc[leader.nssLeadershipYear]) {
      acc[leader.nssLeadershipYear] = [];
    }
    acc[leader.nssLeadershipYear].push(leader);
    return acc;
  }, {});

  const sortedBatches = Object.keys(groupedLeaders).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16 sm:pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leaders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Leadership Management</h1>
            <p className="text-gray-600">Manage leadership roles and members batch-wise</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Leader
          </button>
        </div>

        {/* Filters and Statistics */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, role, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-80">
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Academic Years ({leaders.length} Leaders)</option>
                {batches.map(batch => {
                  const batchLeaders = leaders.filter(leader => leader.nssLeadershipYear === batch);
                  return (
                    <option key={batch} value={batch}>
                      {batch} ({batchLeaders.length} Leaders)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700">Total Leaders: {leaders.length}</span>
              </div>
              {batches.map(batch => {
                const batchLeaders = leaders.filter(leader => leader.nssLeadershipYear === batch);
                return (
                  <div key={batch} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">{batch}: {batchLeaders.length}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Leaders List */}
        <div className="space-y-3">
          {sortedBatches.map((batch, index) => (
            <div key={batch} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div 
                className="bg-white border border-gray-200 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleBatchExpansion(batch)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 rounded p-1.5">
                      <Calendar className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h2 className="text-base font-semibold text-gray-800">{batch} NSS Leadership Year</h2>
                      </div>
                      <p className="text-gray-600 text-xs">Leadership Team • {groupedLeaders[batch].length} Members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Total Leaders</div>
                      <div className="text-base font-semibold text-gray-800">{groupedLeaders[batch].length}</div>
                    </div>
                    {expandedBatches.has(batch) ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>
              
              {expandedBatches.has(batch) && (
                <div className="p-6 bg-gray-50">
                  {/* Leadership Hierarchy */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Leadership Team</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {groupedLeaders[batch]
                        .sort((a, b) => a.order - b.order)
                        .map((leader, leaderIndex) => (
                        <div key={leader._id} className="bg-white border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border border-gray-300">
                                {leader.profilePicture && leader.profilePicture !== '/default-avatar.svg' ? (
                                  <img 
                                    src={leader.profilePicture} 
                                    alt={leader.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="h-6 w-6 text-gray-600" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{leader.name}</h3>
                                <div className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                  {leader.role}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEdit(leader)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(leader._id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{leader.course}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">Academic: {leader.academicBatch}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">NSS Year: {leader.nssLeadershipYear}</span>
                            </div>
                            {leader.linkedinProfile && (
                              <div className="flex items-center gap-2">
                                <ExternalLink className="h-4 w-4 text-gray-400" />
                                <a 
                                  href={leader.linkedinProfile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 truncate"
                                >
                                  LinkedIn Profile
                                </a>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">Priority: {leader.order}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Batch Summary */}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-gray-700">NSS Leadership Year {batch}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {groupedLeaders[batch].length} Leadership Positions
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingLeader ? 'Edit Leader' : 'Add New Leader'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter leader's name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Batch *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.academicBatch}
                        onChange={(e) => setFormData({...formData, academicBatch: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 2023-27 (B.Tech duration)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NSS Leadership Year *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nssLeadershipYear}
                        onChange={(e) => setFormData({...formData, nssLeadershipYear: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 2024-25 (NSS leadership year)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role *
                      </label>
                      <select
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Role</option>
                        {predefinedRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course *
                      </label>
                      <select
                        required
                        value={formData.course}
                        onChange={(e) => setFormData({...formData, course: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Course</option>
                        {predefinedCourses.map(course => (
                          <option key={course} value={course}>{course}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        value={formData.linkedinProfile}
                        onChange={(e) => setFormData({...formData, linkedinProfile: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        Choose Photo
                      </label>
                      {photoPreview && (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                      )}
                    </div>
                  </div>


                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {editingLeader ? 'Update Leader' : 'Add Leader'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLeadership;
