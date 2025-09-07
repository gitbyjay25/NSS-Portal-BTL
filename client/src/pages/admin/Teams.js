import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Users,
  Save,
  X,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [{ name: '', role: '', department: '', experience: '', photo: '', achievements: [], socialLinks: { instagram: '', linkedin: '' } }],
    order: 0
  });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    role: '',
    department: '',
    experience: '',
    photo: '',
    achievements: [],
    socialLinks: { instagram: '', linkedin: '' }
  });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teams/admin', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      toast.error('Error fetching teams: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingTeam ? `/api/teams/${editingTeam._id}` : '/api/teams';
      const method = editingTeam ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save team');
      
      toast.success(editingTeam ? 'Team updated successfully!' : 'Team created successfully!');
      setShowForm(false);
      setEditingTeam(null);
      resetForm();
      fetchTeams();
    } catch (error) {
      toast.error('Error saving team: ' + error.message);
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      members: team.members.map(member => ({
        ...member,
        achievements: member.achievements || [],
        socialLinks: member.socialLinks || { instagram: '', linkedin: '' }
      })),
      order: team.order || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete team');
      
      toast.success('Team deleted successfully!');
      fetchTeams();
    } catch (error) {
      toast.error('Error deleting team: ' + error.message);
    }
  };

  const toggleTeamStatus = async (teamId) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to toggle team status');
      
      toast.success('Team status updated!');
      fetchTeams();
    } catch (error) {
      toast.error('Error updating team status: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      members: [{ name: '', role: '', department: '', experience: '', photo: '', achievements: [], socialLinks: { instagram: '', linkedin: '' } }],
      order: 0
    });
  };

  const addMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, { name: '', role: '', department: '', experience: '', photo: '', achievements: [], socialLinks: { instagram: '', linkedin: '' } }]
    }));
  };

  const removeMember = (index) => {
    if (formData.members.length > 1) {
      setFormData(prev => ({
        ...prev,
        members: prev.members.filter((_, i) => i !== index)
      }));
    }
  };

  const updateMember = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const addAchievement = (memberIndex) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map((member, i) => 
        i === memberIndex 
          ? { ...member, achievements: [...(member.achievements || []), ''] }
          : member
      )
    }));
  };

  const removeAchievement = (memberIndex, achievementIndex) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map((member, i) => 
        i === memberIndex 
          ? { ...member, achievements: member.achievements.filter((_, ai) => ai !== achievementIndex) }
          : member
      )
    }));
  };

  const updateAchievement = (memberIndex, achievementIndex, value) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map((member, i) => 
        i === memberIndex 
          ? { 
              ...member, 
              achievements: member.achievements.map((achievement, ai) => 
                ai === achievementIndex ? value : achievement
              )
            }
          : member
      )
    }));
  };

  // Member management functions
  const handleAddMember = (team) => {
    setSelectedTeam(team);
    setEditingMember(null);
    setMemberFormData({
      name: '',
      role: '',
      department: '',
      experience: '',
      photo: '',
      achievements: [],
      socialLinks: { instagram: '', linkedin: '' }
    });
    setShowMemberForm(true);
  };

  const handleEditMember = (team, member, memberIndex) => {
    setSelectedTeam(team);
    setEditingMember({ ...member, index: memberIndex });
    setMemberFormData({
      name: member.name,
      role: member.role,
      department: member.department,
      experience: member.experience,
      photo: member.photo || '',
      achievements: member.achievements || [],
      socialLinks: member.socialLinks || { instagram: '', linkedin: '' }
    });
    setShowMemberForm(true);
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedTeam = { ...selectedTeam };
      
      if (editingMember) {
        // Update existing member
        updatedTeam.members[editingMember.index] = memberFormData;
      } else {
        // Add new member
        updatedTeam.members.push(memberFormData);
      }

      const response = await fetch(`/api/teams/${selectedTeam._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedTeam)
      });

      if (!response.ok) throw new Error('Failed to update team');
      
      toast.success(editingMember ? 'Member updated successfully!' : 'Member added successfully!');
      setShowMemberForm(false);
      setSelectedTeam(null);
      setEditingMember(null);
      fetchTeams();
    } catch (error) {
      toast.error('Error updating member: ' + error.message);
    }
  };

  const handleDeleteMember = async (team, memberIndex) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    
    try {
      const updatedTeam = { ...team };
      updatedTeam.members.splice(memberIndex, 1);
      
      const response = await fetch(`/api/teams/${team._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedTeam)
      });

      if (!response.ok) throw new Error('Failed to update team');
      
      toast.success('Member deleted successfully!');
      fetchTeams();
    } catch (error) {
      toast.error('Error deleting member: ' + error.message);
    }
  };

  const handleDuplicate = (team) => {
    const duplicatedTeam = {
      ...team,
      name: `${team.name} (Copy)`,
      order: team.order + 1
    };
    delete duplicatedTeam._id;
    delete duplicatedTeam.createdAt;
    delete duplicatedTeam.updatedAt;
    
    setFormData(duplicatedTeam);
    setEditingTeam(null);
    setShowForm(true);
  };

  const addMemberAchievement = () => {
    setMemberFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, '']
    }));
  };

  const removeMemberAchievement = (index) => {
    setMemberFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const updateMemberAchievement = (index, value) => {
    setMemberFormData(prev => ({
      ...prev,
      achievements: prev.achievements.map((achievement, i) => 
        i === index ? value : achievement
      )
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-2">Manage NSS team structure and members</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingTeam(null);
              resetForm();
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Team
          </button>
        </div>

        {/* Team Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teams.reduce((total, team) => total + team.members.length, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Teams</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teams.filter(team => team.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search teams by name or member name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  const filtered = teams.filter(team => 
                    team.name.toLowerCase().includes(searchTerm) ||
                    team.members.some(member => 
                      member.name.toLowerCase().includes(searchTerm) ||
                      member.role.toLowerCase().includes(searchTerm)
                    )
                  );
                  setTeams(filtered);
                  if (e.target.value === '') {
                    fetchTeams();
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => {
                  const course = e.target.value;
                  if (course === 'all') {
                    fetchTeams();
                  } else {
                    const filtered = teams.filter(team => 
                      team.members.some(member => member.department === course)
                    );
                    setTeams(filtered);
                  }
                }}
              >
                <option value="all">All Courses</option>
                <option value="B.Tech">B.Tech</option>
                <option value="BCA">BCA</option>
                <option value="BBA">BBA</option>
                <option value="B.Com">B.Com</option>
                <option value="Nursing">Nursing</option>
                <option value="Pharmacy">Pharmacy</option>
              </select>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(teams, null, 2);
                  const dataBlob = new Blob([dataStr], {type: 'application/json'});
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'teams-data.json';
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                title="Export Teams Data"
              >
                📊 Export
              </button>
              <button
                onClick={() => fetchTeams()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Teams List */}
        <div className="grid gap-6">
          {teams.map((team) => (
            <div key={team._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-gray-900">{team.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      team.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {team.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {team.description && (
                    <p className="text-gray-600 mt-1">{team.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {team.members.length} member{team.members.length !== 1 ? 's' : ''} • Order: {team.order}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.from(new Set(team.members.map(m => m.department))).map(course => (
                      <span key={course} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddMember(team)}
                    className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                    title="Add Member"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Member
                  </button>
                  <button
                    onClick={() => toggleTeamStatus(team._id)}
                    className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    title={team.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {team.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleDuplicate(team)}
                    className="p-2 text-green-600 hover:text-green-800 transition-colors"
                    title="Duplicate Team"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(team)}
                    className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                    title="Edit Team"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(team._id)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    title="Delete Team"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Team Members */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {team.members.map((member, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 relative group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                        {member.photo && member.photo !== '/default-avatar.svg' ? (
                          <img 
                            src={member.photo} 
                            alt={member.name}
                            className="w-full h-full object-cover"
                            onClick={() => {
                              setSelectedPhoto(member.photo);
                              setShowPhotoModal(true);
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${member.photo && member.photo !== '/default-avatar.svg' ? 'hidden' : ''}`}>
                          <Users className="w-6 h-6 text-gray-500" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{member.name}</h4>
                        <p className="text-sm text-blue-600">{member.role}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => handleEditMember(team, member, index)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit Member"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(team, index)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Course: {member.department}</p>
                    <p className="text-sm text-gray-500 mb-2">Experience: {member.experience}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {member.role}
                      </span>
                    </div>
                    
                    {member.achievements && member.achievements.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-2">Achievements:</p>
                        <div className="flex flex-wrap gap-1">
                          {member.achievements.map((achievement, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {achievement}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Team Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingTeam ? 'Edit Team' : 'Add New Team'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingTeam(null);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Team Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Team Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order
                      </label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Team Members */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                      <button
                        type="button"
                        onClick={addMember}
                        className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Member
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.members.map((member, memberIndex) => (
                        <div key={memberIndex} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900">Member {memberIndex + 1}</h4>
                            {formData.members.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeMember(memberIndex)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <UserMinus className="w-5 h-5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name *
                              </label>
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => updateMember(memberIndex, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role *
                              </label>
                              <input
                                type="text"
                                value={member.role}
                                onChange={(e) => updateMember(memberIndex, 'role', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Course *
                              </label>
                              <select
                                value={member.department}
                                onChange={(e) => updateMember(memberIndex, 'department', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              >
                                <option value="">Select Course</option>
                                <option value="B.Tech">B.Tech</option>
                                <option value="BCA">BCA</option>
                                <option value="BBA">BBA</option>
                                <option value="B.Com">B.Com</option>
                                <option value="Nursing">Nursing</option>
                                <option value="Pharmacy">Pharmacy</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Experience *
                              </label>
                              <input
                                type="text"
                                value={member.experience}
                                onChange={(e) => updateMember(memberIndex, 'experience', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Photo URL
                              </label>
                              <input
                                type="text"
                                value={member.photo}
                                onChange={(e) => updateMember(memberIndex, 'photo', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="/path/to/photo.jpg"
                              />
                            </div>
                          </div>

                          {/* Social Links */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Instagram
                              </label>
                              <input
                                type="text"
                                value={member.socialLinks?.instagram || ''}
                                onChange={(e) => updateMember(memberIndex, 'socialLinks', { 
                                  ...member.socialLinks, 
                                  instagram: e.target.value 
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://instagram.com/username"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                LinkedIn
                              </label>
                              <input
                                type="text"
                                value={member.socialLinks?.linkedin || ''}
                                onChange={(e) => updateMember(memberIndex, 'socialLinks', { 
                                  ...member.socialLinks, 
                                  linkedin: e.target.value 
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://linkedin.com/in/username"
                              />
                            </div>
                          </div>

                          {/* Achievements */}
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Achievements
                              </label>
                              <button
                                type="button"
                                onClick={() => addAchievement(memberIndex)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                + Add Achievement
                              </button>
                            </div>
                            <div className="space-y-2">
                              {member.achievements.map((achievement, achievementIndex) => (
                                <div key={achievementIndex} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={achievement}
                                    onChange={(e) => updateAchievement(memberIndex, achievementIndex, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Achievement description"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeAchievement(memberIndex, achievementIndex)}
                                    className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingTeam(null);
                        resetForm();
                      }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {editingTeam ? 'Update Team' : 'Create Team'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
                 )}

         {/* Add/Edit Member Form */}
         {showMemberForm && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
               <div className="p-6">
                 <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-bold text-gray-900">
                     {editingMember ? 'Edit Member' : 'Add New Member'}
                   </h2>
                   <button
                     onClick={() => {
                       setShowMemberForm(false);
                       setSelectedTeam(null);
                       setEditingMember(null);
                     }}
                     className="text-gray-500 hover:text-gray-700"
                   >
                     <X className="w-6 h-6" />
                   </button>
                 </div>

                 <form onSubmit={handleMemberSubmit} className="space-y-6">
                   <div className="text-lg font-medium text-gray-700 mb-4">
                     Team: <span className="text-blue-600">{selectedTeam?.name}</span>
                   </div>

                   {/* Member Details */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Name *
                       </label>
                       <input
                         type="text"
                         value={memberFormData.name}
                         onChange={(e) => setMemberFormData(prev => ({ ...prev, name: e.target.value }))}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                         required
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Role *
                       </label>
                       <input
                         type="text"
                         value={memberFormData.role}
                         onChange={(e) => setMemberFormData(prev => ({ ...prev, role: e.target.value }))}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                         required
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Course *
                       </label>
                       <select
                         value={memberFormData.department}
                         onChange={(e) => setMemberFormData(prev => ({ ...prev, department: e.target.value }))}
                         className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                         required
                       >
                         <option value="">Select Course</option>
                         <option value="B.Tech">B.Tech</option>
                         <option value="BCA">BCA</option>
                         <option value="BBA">BBA</option>
                         <option value="B.Com">B.Com</option>
                         <option value="Nursing">Nursing</option>
                         <option value="Pharmacy">Pharmacy</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Experience *
                       </label>
                       <input
                         type="text"
                         value={memberFormData.experience}
                         onChange={(e) => setMemberFormData(prev => ({ ...prev, experience: e.target.value }))}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                         required
                       />
                     </div>
                     <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Photo URL
                       </label>
                       <input
                         type="text"
                         value={memberFormData.photo}
                         onChange={(e) => setMemberFormData(prev => ({ ...prev, photo: e.target.value }))}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                         placeholder="/path/to/photo.jpg"
                       />
                     </div>
                   </div>

                   {/* Social Links */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Instagram
                       </label>
                       <input
                         type="text"
                         value={memberFormData.socialLinks.instagram}
                         onChange={(e) => setMemberFormData(prev => ({ 
                           ...prev, 
                           socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                         }))}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                         placeholder="https://instagram.com/username"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         LinkedIn
                       </label>
                       <input
                         type="text"
                         value={memberFormData.socialLinks.linkedin}
                         onChange={(e) => setMemberFormData(prev => ({ 
                           ...prev, 
                           socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                         }))}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                         placeholder="https://linkedin.com/in/username"
                       />
                     </div>
                   </div>

                   {/* Achievements */}
                   <div>
                     <div className="flex justify-between items-center mb-2">
                       <label className="block text-sm font-medium text-gray-700">
                         Achievements
                       </label>
                       <button
                         type="button"
                         onClick={addMemberAchievement}
                         className="text-blue-600 hover:text-blue-800 text-sm"
                       >
                         + Add Achievement
                       </button>
                     </div>
                     <div className="space-y-2">
                       {memberFormData.achievements.map((achievement, index) => (
                         <div key={index} className="flex gap-2">
                           <input
                             type="text"
                             value={achievement}
                             onChange={(e) => updateMemberAchievement(index, e.target.value)}
                             className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                             placeholder="Achievement description"
                           />
                           <button
                             type="button"
                             onClick={() => removeMemberAchievement(index)}
                             className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors"
                           >
                             <X className="w-4 h-4" />
                           </button>
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* Form Actions */}
                   <div className="flex justify-end gap-4 pt-6 border-t">
                     <button
                       type="button"
                       onClick={() => {
                         setShowMemberForm(false);
                         setSelectedTeam(null);
                         setEditingMember(null);
                       }}
                       className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                     >
                       Cancel
                     </button>
                     <button
                       type="submit"
                       className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                     >
                       <Save className="w-4 h-4" />
                       {editingMember ? 'Update Member' : 'Add Member'}
                     </button>
                   </div>
                 </form>
               </div>
             </div>
           </div>
         )}

         {/* Photo Preview Modal */}
         {showPhotoModal && (
           <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
               <div className="p-6">
                 <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-bold text-gray-900">Photo Preview</h2>
                   <button
                     onClick={() => setShowPhotoModal(false)}
                     className="text-gray-500 hover:text-gray-700"
                   >
                     <X className="w-6 h-6" />
                   </button>
                 </div>
                 <div className="flex justify-center">
                   <img 
                     src={selectedPhoto} 
                     alt="Member Photo"
                     className="max-w-full max-h-96 object-contain rounded-lg"
                     onError={(e) => {
                       e.target.src = '/default-avatar.svg';
                     }}
                   />
                 </div>
               </div>
             </div>
           </div>
         )}
       </div>
     </div>
   );
 };

export default AdminTeams;
