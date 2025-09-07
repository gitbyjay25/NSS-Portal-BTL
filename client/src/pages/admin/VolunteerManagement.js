import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
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
  Activity,
  Clock,
  Heart,
  MapPin,
  User,
  Download,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const VolunteerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [skillsFilter, setSkillsFilter] = useState([]);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: volunteers, isLoading } = useQuery(
    ['volunteers', debouncedSearchTerm, statusFilter, departmentFilter, yearFilter, bloodGroupFilter, districtFilter, stateFilter, skillsFilter],
    () => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (departmentFilter !== 'all') params.append('department', departmentFilter);
      if (yearFilter !== 'all') params.append('year', yearFilter);
      if (bloodGroupFilter !== 'all') params.append('bloodGroup', bloodGroupFilter);
      if (districtFilter !== 'all') params.append('district', districtFilter);
      if (stateFilter !== 'all') params.append('state', stateFilter);
      if (skillsFilter.length > 0) params.append('skills', skillsFilter.join(','));
      return axios.get(`/api/admin/volunteers?${params}`).then(res => res.data);
    }
  );

  const handleViewDetails = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowDetailsModal(true);
  };

  const handleSkillToggle = (skill) => {
    setSkillsFilter(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDepartmentFilter('all');
    setYearFilter('all');
    setBloodGroupFilter('all');
    setDistrictFilter('all');
    setStateFilter('all');
    setSkillsFilter([]);
  };

  const exportToCSV = () => {
    const filteredVolunteers = managementVolunteers.filter(volunteer => {
      // Apply all filters here
      if (statusFilter === 'active' && !volunteer.isActive) return false;
      if (statusFilter === 'inactive' && volunteer.isActive) return false;
      if (departmentFilter !== 'all' && (volunteer.department || volunteer.nssApplicationData?.department) !== departmentFilter) return false;
      if (yearFilter !== 'all' && (volunteer.year || volunteer.nssApplicationData?.year) !== yearFilter) return false;
      if (bloodGroupFilter !== 'all' && (volunteer.bloodGroup || volunteer.nssApplicationData?.bloodGroup) !== bloodGroupFilter) return false;
      if (districtFilter !== 'all' && (volunteer.district || volunteer.nssApplicationData?.district) !== districtFilter) return false;
      if (stateFilter !== 'all' && (volunteer.state || volunteer.nssApplicationData?.state) !== stateFilter) return false;
      if (skillsFilter.length > 0 && !skillsFilter.some(skill => (volunteer.skills || volunteer.nssApplicationData?.skills || []).includes(skill))) return false;
      return true;
    });

    const csvContent = [
      ['Name', 'Email', 'Phone', 'College', 'Department', 'Year', 'Blood Group', 'Father Name', 'Mother Name', 'PIN Code', 'State', 'District', 'Address', 'Skills', 'Status'],
      ...filteredVolunteers.map(volunteer => [
        volunteer.name,
        volunteer.email,
        volunteer.phone,
        volunteer.college,
        volunteer.department || volunteer.nssApplicationData?.department || '',
        volunteer.year || volunteer.nssApplicationData?.year || '',
        volunteer.bloodGroup || volunteer.nssApplicationData?.bloodGroup || '',
        volunteer.fatherName || volunteer.nssApplicationData?.fatherName || '',
        volunteer.motherName || volunteer.nssApplicationData?.motherName || '',
        volunteer.pinCode || volunteer.nssApplicationData?.pinCode || '',
        volunteer.state || volunteer.nssApplicationData?.state || '',
        volunteer.district || volunteer.nssApplicationData?.district || '',
        volunteer.address || volunteer.nssApplicationData?.address || '',
        (volunteer.skills || volunteer.nssApplicationData?.skills || []).join('; '),
        volunteer.nssApplicationStatus
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'volunteers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const allVolunteers = volunteers?.volunteers || [];
  
  
  // For management section, only show approved volunteers
  const managementVolunteers = allVolunteers.filter(v => 
    v.nssApplicationStatus === 'approved' && v.hasAppliedToNSS === true
  );
  

  // Get unique values for filters (from ALL volunteers to show all possible options)
  const departments = [...new Set(allVolunteers.map(v => v.department || v.nssApplicationData?.department).filter(Boolean))];
  const years = [...new Set(allVolunteers.map(v => v.year || v.nssApplicationData?.year).filter(Boolean))];
  const bloodGroups = [...new Set(allVolunteers.map(v => v.bloodGroup || v.nssApplicationData?.bloodGroup).filter(Boolean))];
  const allSkills = [...new Set(allVolunteers.flatMap(v => v.skills || v.nssApplicationData?.skills || []))];
  const states = [...new Set(allVolunteers.map(v => v.state || v.nssApplicationData?.state).filter(Boolean))];
  const districts = [...new Set(allVolunteers.map(v => v.district || v.nssApplicationData?.district).filter(Boolean))];


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
              <p className="text-gray-600 mt-2">Manage and filter existing volunteers</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <Download className="h-5 w-5 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards - Only for Approved Volunteers Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Approved</p>
                <p className="text-2xl font-bold text-gray-900">{managementVolunteers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Volunteers</p>
                <p className="text-2xl font-bold text-gray-900">{managementVolunteers.filter(v => v.isActive).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{managementVolunteers.reduce((sum, v) => sum + (v.totalHours || 0), 0)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Advanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
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

            {/* Activity Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Activity</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Year Filter */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year} Year</option>
              ))}
            </select>

            {/* Blood Group Filter */}
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Blood Groups</option>
              {bloodGroups.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>

                         {/* District Filter */}
             <select
               value={districtFilter}
               onChange={(e) => setDistrictFilter(e.target.value)}
               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             >
               <option value="all">All Districts</option>
               {districts.map(district => (
                 <option key={district} value={district}>{district}</option>
               ))}
             </select>

             {/* State Filter */}
             <select
               value={stateFilter}
               onChange={(e) => setStateFilter(e.target.value)}
               className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             >
               <option value="all">All States</option>
               {states.map(state => (
                 <option key={state} value={state}>{state}</option>
               ))}
             </select>
          </div>

          {/* Skills Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills Filter</label>
            <div className="relative">
              <button
                onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex justify-between items-center"
              >
                <span>
                  {skillsFilter.length === 0 
                    ? 'Select Skills' 
                    : `${skillsFilter.length} skill(s) selected`
                  }
                </span>
                <Filter className="h-5 w-5" />
              </button>
              
              {showSkillsDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {allSkills.map(skill => (
                    <label key={skill} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={skillsFilter.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                        className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900">{skill}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            {/* Selected Skills */}
            {skillsFilter.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {skillsFilter.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      onClick={() => handleSkillToggle(skill)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
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
                     Blood Group
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Location
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
                 {managementVolunteers
                   .filter(volunteer => {
                     // Apply all filters
                     if (statusFilter === 'active' && !volunteer.isActive) return false;
                     if (statusFilter === 'inactive' && volunteer.isActive) return false;
                     if (departmentFilter !== 'all' && (volunteer.department || volunteer.nssApplicationData?.department) !== departmentFilter) return false;
                     if (yearFilter !== 'all' && (volunteer.year || volunteer.nssApplicationData?.year) !== yearFilter) return false;
                     if (bloodGroupFilter !== 'all' && (volunteer.bloodGroup || volunteer.nssApplicationData?.bloodGroup) !== bloodGroupFilter) return false;
                     if (districtFilter !== 'all' && (volunteer.district || volunteer.nssApplicationData?.district) !== districtFilter) return false;
                     if (stateFilter !== 'all' && (volunteer.state || volunteer.nssApplicationData?.state) !== stateFilter) return false;
                     if (skillsFilter.length > 0 && !skillsFilter.some(skill => (volunteer.skills || volunteer.nssApplicationData?.skills || []).includes(skill))) return false;
                     return true;
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
                        <div className="text-sm text-gray-900">{volunteer.department || volunteer.nssApplicationData?.department || 'Not specified'}</div>
                        <div className="text-sm text-gray-500">{volunteer.year || volunteer.nssApplicationData?.year || 'Not specified'} Year</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-sm text-gray-900">{volunteer.bloodGroup || volunteer.nssApplicationData?.bloodGroup || 'Not specified'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-blue-500 mr-1" />
                          <div>
                            <div className="text-sm text-gray-900">{volunteer.district || volunteer.nssApplicationData?.district || 'Not specified'}</div>
                            <div className="text-sm text-gray-500">{volunteer.state || volunteer.nssApplicationData?.state || 'Not specified'}</div>
                          </div>
                        </div>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                           NSS Approved
                         </span>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Activity className="h-4 w-4 mr-1" />
                          <span>events</span>
                          <Clock className="h-4 w-4 ml-3 mr-1" />
                          <span>0 hours</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(volunteer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
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
                        <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.bloodGroup || selectedVolunteer.nssApplicationData?.bloodGroup || 'Not specified'}</p>
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
                        <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.department || selectedVolunteer.nssApplicationData?.department || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Year</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.year || selectedVolunteer.nssApplicationData?.year || 'Not specified'} Year</p>
                      </div>
                    </div>
                  </div>

                  {/* Family Information */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Family Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.fatherName || selectedVolunteer.nssApplicationData?.fatherName || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.motherName || selectedVolunteer.nssApplicationData?.motherName || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">PIN Code</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.pinCode || selectedVolunteer.nssApplicationData?.pinCode || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.state || selectedVolunteer.nssApplicationData?.state || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">District</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.district || selectedVolunteer.nssApplicationData?.district || 'Not specified'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Full Address</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedVolunteer.address || selectedVolunteer.nssApplicationData?.address || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedVolunteer.skills || selectedVolunteer.nssApplicationData?.skills || []).length > 0 ? (
                        (selectedVolunteer.skills || selectedVolunteer.nssApplicationData?.skills || []).map((skill, index) => (
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerManagement;
