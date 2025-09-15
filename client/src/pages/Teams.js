import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  UserCheck,
  Globe,
  Loader2,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  UserPlus,
  Upload,
  Image,
  ArrowUp,
  User,
  UserCircle,
  Users2,
  UserX
} from 'lucide-react';
import { toast } from 'react-toastify';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [error, setError] = useState(null);
  const [activeTeam, setActiveTeam] = useState(0);
  const [activeView, setActiveView] = useState('teams'); // 'teams' | 'leadership'
  const [selectedLeadershipYear, setSelectedLeadershipYear] = useState('2023-24');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [editingImagePreview, setEditingImagePreview] = useState(null);
  const [newMemberImagePreview, setNewMemberImagePreview] = useState(null);
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    department: '',
    experience: '',
    photo: '',
    achievements: [],
    socialLinks: { instagram: '', linkedin: '' }
  });

  useEffect(() => {
    fetchTeams();
    checkAdminStatus();
  }, []);

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

  const checkAdminStatus = () => {
    const token = localStorage.getItem('token');
    if (token) {
      // Check if user is admin
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user.role === 'admin') {
          setIsAdmin(true);
        }
      })
      .catch(err => {});
    }
  };

  const fetchTeams = async () => {
    try {
      setLoading(true);
      // Add cache-busting parameter to ensure fresh data
      const response = await fetch('/api/teams?t=' + Date.now());
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      const data = await response.json();
      setTeams(data);
    } catch (err) {
      setError(err.message);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  // Image Upload Handlers
  const handleEditingImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditingImagePreview(e.target.result);
        setEditingMember({...editingMember, photo: e.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewMemberImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewMemberImagePreview(e.target.result);
        setNewMember({...newMember, photo: e.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  // Leadership derived dynamically from Teams where name follows "Leadership <year>"
  const leadershipTeams = teams.filter((t) => /^(Leadership)\s+\d{4}-\d{2}/i.test(t.name || ''));
  const leadershipYears = leadershipTeams
    .map((t) => {
      const match = (t.name || '').match(/\b(\d{4}-\d{2})\b/);
      return match ? match[1] : null;
    })
    .filter(Boolean);

  useEffect(() => {
    if (leadershipYears.length > 0) {
      // If current selection not in available years, set to first
      if (!selectedLeadershipYear || !leadershipYears.includes(selectedLeadershipYear)) {
        setSelectedLeadershipYear(leadershipYears[0]);
      }
    }
  }, [teams]);

  // Admin Functions
  const handleEditMember = (teamIndex, memberIndex) => {
    setEditingMember({ teamIndex, memberIndex, ...teams[teamIndex].members[memberIndex] });
    setEditingImagePreview(null); // Reset image preview
  };

  const handleSaveMember = async () => {
    try {
      const token = localStorage.getItem('token');
      const updatedTeams = [...teams];
      updatedTeams[editingMember.teamIndex].members[editingMember.memberIndex] = {
        name: editingMember.name,
        role: editingMember.role,
        department: editingMember.department,
        experience: editingMember.experience,
        photo: editingMember.photo,
        achievements: editingMember.achievements,
        socialLinks: editingMember.socialLinks
      };

      // Get the actual team object with MongoDB _id
      const teamToUpdate = teams[editingMember.teamIndex];
      
      if (!teamToUpdate._id) {
        console.error('No _id found in team:', teamToUpdate);
        throw new Error('Team ID not found. Please refresh the page and try again.');
      }

      const response = await fetch(`/api/teams/${teamToUpdate._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedTeams[editingMember.teamIndex])
      });

      if (response.ok) {
        setTeams(updatedTeams);
        setEditingMember(null);
        setEditingImagePreview(null);
        toast.success('Member updated successfully!');
      } else {
        throw new Error('Failed to update member');
      }
    } catch (error) {
      toast.error('Error updating member: ' + error.message);
    }
  };

  const handleDeleteMember = async (teamIndex, memberIndex) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const updatedTeams = [...teams];
      updatedTeams[teamIndex].members.splice(memberIndex, 1);

      // Get the actual team object with MongoDB _id
      const teamToUpdate = teams[teamIndex];
      if (!teamToUpdate._id) {
        throw new Error('Team ID not found');
      }

      const response = await fetch(`/api/teams/${teamToUpdate._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedTeams[teamIndex])
      });

      if (response.ok) {
        setTeams(updatedTeams);
        toast.success('Member deleted successfully!');
      } else {
        throw new Error('Failed to delete member');
      }
    } catch (error) {
      toast.error('Error deleting member: ' + error.message);
    }
  };

  const handleAddMember = async () => {
    try {
      const token = localStorage.getItem('token');
      const updatedTeams = [...teams];
      updatedTeams[activeTeam].members.push(newMember);

      // Get the actual team object with MongoDB _id
      const teamToUpdate = teams[activeTeam];
      
      if (!teamToUpdate._id) {
        console.error('No _id found in team:', teamToUpdate);
        throw new Error('Team ID not found. Please refresh the page and try again.');
      }

      const response = await fetch(`/api/teams/${teamToUpdate._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedTeams[activeTeam])
      });

      if (response.ok) {
        setTeams(updatedTeams);
        setShowAddMemberForm(false);
        setNewMemberImagePreview(null);
        setNewMember({
          name: '',
          role: '',
          department: '',
          experience: '',
          photo: '',
          achievements: [],
          socialLinks: { instagram: '', linkedin: '' }
        });
        toast.success('Member added successfully!');
      } else {
        throw new Error('Failed to add member');
      }
    } catch (error) {
      toast.error('Error adding member: ' + error.message);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background Design - Same as header section */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50"></div>
      
      {/* Floating Elements - Enhanced version */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-purple-200/60 to-pink-200/60 rounded-full opacity-70 blur-2xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-blue-200/50 to-cyan-200/50 rounded-full opacity-60 blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-40 left-1/4 w-28 h-28 bg-gradient-to-br from-green-200/40 to-emerald-200/40 rounded-full opacity-50 blur-lg animate-pulse delay-2000"></div>
      <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-br from-violet-200/50 to-purple-200/50 rounded-full opacity-45 blur-lg animate-pulse delay-3000"></div>
      <div className="absolute bottom-1/3 right-1/4 w-20 h-20 bg-gradient-to-br from-indigo-200/40 to-blue-200/40 rounded-full opacity-40 blur-md animate-pulse delay-4000"></div>
      
      {/* Additional Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-10 left-20 w-3 h-3 bg-indigo-300/30 rounded-full opacity-40"></div>
        <div className="absolute top-32 left-40 w-2 h-2 bg-purple-300/40 rounded-full opacity-50"></div>
        <div className="absolute top-16 right-32 w-4 h-4 bg-blue-300/25 rounded-full opacity-35"></div>
        <div className="absolute top-48 right-16 w-3 h-3 bg-cyan-300/35 rounded-full opacity-45"></div>
        <div className="absolute bottom-32 left-32 w-2 h-2 bg-emerald-300/30 rounded-full opacity-40"></div>
        <div className="absolute bottom-20 right-40 w-3 h-3 bg-violet-300/25 rounded-full opacity-35"></div>
        <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-pink-300/30 rounded-full opacity-30"></div>
        <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-rose-300/25 rounded-full opacity-25"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Amazing Teams</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the talented individuals who make our NSS community extraordinary. 
            Each team member brings unique skills and passion to create positive change.
          </p>
        </div>
      </div>

      {/* Team / Leadership Section */}
      <section className="py-8 sm:py-12 md:py-16 relative">
        {/* Section Background - Enhanced with gradient and effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/60 to-purple-50/60 backdrop-blur-md rounded-2xl sm:rounded-3xl mx-2 sm:mx-4 shadow-2xl border border-white/40 relative overflow-hidden">
          {/* Inner decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-4 left-4 w-20 h-20 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-lg"></div>
            <div className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-br from-purple-200/25 to-pink-200/25 rounded-full blur-md"></div>
            <div className="absolute bottom-6 left-1/3 w-12 h-12 bg-gradient-to-br from-indigo-200/20 to-blue-200/20 rounded-full blur-sm"></div>
            <div className="absolute bottom-4 right-1/4 w-14 h-14 bg-gradient-to-br from-cyan-200/25 to-blue-200/25 rounded-full blur-md"></div>
          </div>
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          {/* View Toggle - minimal controls */}
          <div className="flex justify-center gap-3 mb-6">
            <button
              onClick={() => setActiveView('teams')}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${activeView === 'teams' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Teams
            </button>
            <button
              onClick={() => setActiveView('leadership')}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${activeView === 'leadership' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Leadership
            </button>
          </div>
          
          {activeView === 'teams' && (
            <>
              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading teams...</p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">Error: {error}</p>
                  <button 
                    onClick={fetchTeams}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Team Tabs */}
              {!loading && !error && teams.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 relative">
                  {/* Tabs background enhancement */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl -m-2"></div>
                  {teams.map((team, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTeam(index)}
                      className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 relative overflow-hidden text-sm sm:text-base ${
                        activeTeam === index
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                          : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200/50'
                      }`}
                    >
                      {/* Button decorative elements */}
                      {activeTeam === index && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                      )}
                      <span className="relative z-10">{team.name}</span>
                    </button>
                  ))}
                  
                  {/* Admin Add Member Button */}
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAddMemberForm(true)}
                        className="px-6 py-3 rounded-full font-semibold bg-green-600 text-white hover:bg-green-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                      >
                        <UserPlus className="w-5 h-5" />
                        Add Member
                      </button>
                      <button
                        onClick={fetchTeams}
                        className="px-6 py-3 rounded-full font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                      >
                        🔄 Refresh Data
                      </button>
                    </div>
                  )}
                </div>
              )}
          
              {/* Team Members Grid */}
              {!loading && !error && teams.length > 0 && teams[activeTeam] && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
                  {/* Grid background enhancement */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-50/20 to-purple-50/20 rounded-2xl -m-4"></div>
                  {teams[activeTeam].members && teams[activeTeam].members.map((member, index) => (
                    <div key={index} className="group relative">
                  {/* Admin Controls */}
                  {isAdmin && (
                    <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditMember(activeTeam, index)}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        title="Edit Member"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(activeTeam, index)}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        title="Delete Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-blue-200/40 h-full relative group">
                    {/* Card decorative elements */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-200/15 to-pink-200/15 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="p-6 text-center flex flex-col justify-between h-full">
                      {/* Member Photo */}
                      <div className="w-36 h-44 mx-auto mb-4 rounded-lg overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={member.photo || '/Am.jpg'} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/Am.jpg';
                          }}
                        />
                      </div>
                      
                      {/* Member Details */}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                          {member.name}
                        </h3>
                        
                        <p className="text-blue-600 font-semibold mb-2 text-lg">
                          {member.role}
                        </p>
                        
                        <p className="text-gray-600 text-sm mb-4">
                          {member.department}
                        </p>
                        
                        <p className="text-gray-500 text-sm mb-4">
                          Experience: {member.experience}
                        </p>
                        
                        {/* Achievements */}
                        {member.achievements && member.achievements.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Achievements</h4>
                            <div className="flex flex-wrap justify-center gap-2">
                              {member.achievements.map((achievement, idx) => (
                                <span 
                                  key={idx}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                                >
                                  {achievement}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Social Links */}
                      {member.socialLinks && (
                        <div className="flex justify-center space-x-4 pt-4 border-t border-gray-100">
                          {member.socialLinks.instagram && (
                            <a 
                              href={member.socialLinks.instagram}
                              className="text-pink-600 hover:text-pink-700 transition-colors duration-300"
                              title="Instagram"
                            >
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                            </a>
                          )}
                          {member.socialLinks.linkedin && (
                            <a 
                              href={member.socialLinks.linkedin}
                              className="text-blue-600 hover:text-blue-700 transition-colors duration-300"
                              title="LinkedIn"
                            >
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Bottom Decoration */}
                    <div className="h-1 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </>
          )}

          {activeView === 'leadership' && (
            <div className="relative">
              {/* Year selector */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
                {leadershipYears.length > 0 ? (
                  leadershipYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedLeadershipYear(year)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${selectedLeadershipYear === year ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border'}`}
                    >
                      {year}
                    </button>
                  ))
                ) : (
                  <span className="text-sm text-gray-600">No leadership data found. Create a team named like "Leadership 2023-24" in Admin & add members.</span>
                )}
              </div>
              {/* Roles list */}
              {(() => {
                // Find leadership team for selected year
                const currentTeam = leadershipTeams.find((t) => (t.name || '').includes(selectedLeadershipYear));
                if (currentTeam) {
                  const members = currentTeam.members || [];
                  return (
                    <div className="max-w-3xl mx-auto">
                      <ul className="divide-y divide-gray-200 bg-white/80 rounded-lg border">
                        {members.map((m, idx) => (
                          <li key={idx} className="flex items-center justify-between px-4 py-3">
                            <span className="font-medium text-gray-800 mr-4">{m.role || 'Role'}</span>
                            <div className="flex items-center gap-3 ml-auto">
                              <img
                                src={m.photo || '/Am.jpg'}
                                alt={m.name}
                                className="w-10 h-10 rounded-full object-cover border"
                                onError={(e) => { e.target.src = '/Am.jpg'; }}
                              />
                              <div className="text-right">
                                <div className="text-gray-800 font-semibold leading-tight">{m.name}</div>
                                {m.department ? (
                                  <div className="text-xs text-gray-500">{m.department}</div>
                                ) : null}
                              </div>
                              {m.socialLinks?.linkedin ? (
                                <a
                                  href={m.socialLinks.linkedin}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:text-blue-700"
                                  title="LinkedIn"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                  </svg>
                                </a>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}

          {/* Inline Member Editing Form */}
          {editingMember && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Member</h2>
                    <button
                      onClick={() => setEditingMember(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleSaveMember(); }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                        <input
                          type="text"
                          value={editingMember.name}
                          onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                        <input
                          type="text"
                          value={editingMember.role}
                          onChange={(e) => setEditingMember({...editingMember, role: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
                        <select
                          value={editingMember.department}
                          onChange={(e) => setEditingMember({...editingMember, department: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="B.Tech">B.Tech</option>
                          <option value="BCA">BCA</option>
                          <option value="BBA">BBA</option>
                          <option value="B.Com">B.Com</option>
                          <option value="Nursing">Nursing</option>
                          <option value="Pharmacy">Pharmacy</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience *</label>
                        <input
                          type="text"
                          value={editingMember.experience}
                          onChange={(e) => setEditingMember({...editingMember, experience: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Member Photo</label>
                        
                        {/* Image Upload Section */}
                        <div className="space-y-4">
                          {/* Upload Button */}
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleEditingImageUpload}
                              className="hidden"
                              id="editing-image-upload"
                            />
                            <label
                              htmlFor="editing-image-upload"
                              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Image
                            </label>
                            <span className="text-sm text-gray-500">or</span>
                            <input
                              type="text"
                              value={editingMember.photo}
                              onChange={(e) => setEditingMember({...editingMember, photo: e.target.value})}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter image URL"
                            />
                          </div>
                          
                          {/* Image Preview */}
                          {(editingImagePreview || editingMember.photo) && (
                            <div className="relative">
                              <img
                                src={editingImagePreview || editingMember.photo}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  e.target.src = '/Am.jpg';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingImagePreview(null);
                                  setEditingMember({...editingMember, photo: ''});
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Achievements */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Achievements (comma-separated)</label>
                        <input
                          type="text"
                          value={editingMember.achievements ? editingMember.achievements.join(', ') : ''}
                          onChange={(e) => setEditingMember({
                            ...editingMember, 
                            achievements: e.target.value.split(',').map(item => item.trim()).filter(item => item)
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Award 1, Award 2, Award 3"
                        />
                      </div>
                      
                      {/* Social Links */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
                        <input
                          type="url"
                          value={editingMember.socialLinks?.instagram || ''}
                          onChange={(e) => setEditingMember({
                            ...editingMember, 
                            socialLinks: { ...editingMember.socialLinks, instagram: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://instagram.com/username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                        <input
                          type="url"
                          value={editingMember.socialLinks?.linkedin || ''}
                          onChange={(e) => setEditingMember({
                            ...editingMember, 
                            socialLinks: { ...editingMember.socialLinks, linkedin: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t">
                      <button
                        type="button"
                        onClick={() => setEditingMember(null)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Add Member Form */}
          {showAddMemberForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Add New Member</h2>
                    <button
                      onClick={() => setShowAddMemberForm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleAddMember(); }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                        <input
                          type="text"
                          value={newMember.name}
                          onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                        <input
                          type="text"
                          value={newMember.role}
                          onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
                        <select
                          value={newMember.department}
                          onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Experience *</label>
                        <input
                          type="text"
                          value={newMember.experience}
                          onChange={(e) => setNewMember({...newMember, experience: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Member Photo</label>
                        
                        {/* Image Upload Section */}
                        <div className="space-y-4">
                          {/* Upload Button */}
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleNewMemberImageUpload}
                              className="hidden"
                              id="new-member-image-upload"
                            />
                            <label
                              htmlFor="new-member-image-upload"
                              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Image
                            </label>
                            <span className="text-sm text-gray-500">or</span>
                            <input
                              type="text"
                              value={newMember.photo}
                              onChange={(e) => setNewMember({...newMember, photo: e.target.value})}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Enter image URL"
                            />
                          </div>
                          
                          {/* Image Preview */}
                          {(newMemberImagePreview || newMember.photo) && (
                            <div className="relative">
                              <img
                                src={newMemberImagePreview || newMember.photo}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  e.target.src = '/Am.jpg';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setNewMemberImagePreview(null);
                                  setNewMember({...newMember, photo: ''});
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Achievements */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Achievements (comma-separated)</label>
                        <input
                          type="text"
                          value={newMember.achievements ? newMember.achievements.join(', ') : ''}
                          onChange={(e) => setNewMember({
                            ...newMember, 
                            achievements: e.target.value.split(',').map(item => item.trim()).filter(item => item)
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Award 1, Award 2, Award 3"
                        />
                      </div>
                      
                      {/* Social Links */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
                        <input
                          type="url"
                          value={newMember.socialLinks?.instagram || ''}
                          onChange={(e) => setNewMember({
                            ...newMember, 
                            socialLinks: { ...newMember.socialLinks, instagram: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://instagram.com/username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                        <input
                          type="url"
                          value={newMember.socialLinks?.linkedin || ''}
                          onChange={(e) => setNewMember({
                            ...newMember, 
                            socialLinks: { ...newMember.socialLinks, linkedin: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t">
                      <button
                        type="button"
                        onClick={() => setShowAddMemberForm(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Member
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

            {/* Team Stats */}
      <section className="py-16 relative">
        {/* Section Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
        
        {/* Background Pattern */}
        <div className="absolute -inset-10 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute top-32 left-40 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute top-16 right-32 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute top-48 right-16 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute bottom-32 left-32 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute bottom-20 right-40 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute top-64 left-1/3 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute top-80 right-1/4 w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Community Impact
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Together we're building a stronger, more connected community through dedicated service and collaboration
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                {teams.length > 0 ? teams.length : 0}
              </h3>
              <p className="text-blue-100 text-lg font-medium">Active Teams</p>
              <p className="text-blue-200 text-sm mt-2">Working together for change</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                {teams.length > 0 ? teams.reduce((total, team) => total + (team.members ? team.members.length : 0), 0) : 0}
              </h3>
              <p className="text-blue-100 text-lg font-medium">Team Members</p>
              <p className="text-blue-200 text-sm mt-2">Passionate volunteers</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">24/7</h3>
              <p className="text-blue-100 text-lg font-medium">Community Support</p>
              <p className="text-blue-200 text-sm mt-2">Always here to help</p>
            </div>
          </div>
          
          {/* Community Impact Photos */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Our Impact in Action</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Photo 1 - Classroom Scene */}
              <div className="relative group">
                <div className="relative transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-white p-3 rounded-lg shadow-xl">
                    <img 
                      src="/nss-activities/classroom-activity.jpg" 
                      alt="NSS students in classroom"
                      className="w-full h-48 object-cover rounded-md"
                      onError={(e) => {
                        e.target.src = '/gt.jpeg';
                      }}
                    />
                    <div className="mt-3 text-center">
                      <p className="text-sm text-gray-700 font-medium">Educational Outreach</p>
                      <p className="text-xs text-gray-500">Students learning together</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo 2 - Tree Planting */}
              <div className="relative group">
                <div className="relative transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-white p-3 rounded-lg shadow-xl">
                    <img 
                      src="/nss-activities/tree-planting.jpg" 
                      alt="NSS volunteers planting trees"
                      className="w-full h-48 object-cover rounded-md"
                      onError={(e) => {
                        e.target.src = 'kh.png';
                      }}
                    />
                    <div className="mt-3 text-center">
                      <p className="text-sm text-gray-700 font-medium">Environmental Care</p>
                      <p className="text-xs text-gray-500">Tree planting drive</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo 3 - Group Activity */}
              <div className="relative group">
                <div className="relative transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-white p-3 rounded-lg shadow-xl">
                    <img 
                      src="/nss-activities/group-activity.jpg" 
                      alt="NSS team group activity"
                      className="w-full h-48 object-cover rounded-md"
                      onError={(e) => {
                        e.target.src = '/all.webp';
                      }}
                    />
                    <div className="mt-3 text-center">
                      <p className="text-sm text-gray-700 font-medium">Team Building</p>
                      <p className="text-xs text-gray-500">Collaborative projects</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo 4 - Community Service */}
              <div className="relative group">
                <div className="relative transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-white p-3 rounded-lg shadow-xl">
                    <img 
                      src="/nss-activities/community-service.jpg" 
                      alt="NSS community service"
                      className="w-full h-48 object-cover rounded-md"
                      onError={(e) => {
                        e.target.src = '/im.heic';
                      }}
                    />
                    <div className="mt-3 text-center">
                      <p className="text-sm text-gray-700 font-medium">Community Service</p>
                      <p className="text-xs text-gray-500">Helping others</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

export default Teams;
