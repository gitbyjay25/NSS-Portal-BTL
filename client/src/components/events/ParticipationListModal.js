import React, { useState, useEffect } from 'react';
import { X, Users, Download, Search, Mail, Phone, Calendar, User, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const ParticipationListModal = ({ event, isOpen, onClose }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredParticipants, setFilteredParticipants] = useState([]);

  useEffect(() => {
    if (isOpen && event) {
      fetchParticipants();
    }
  }, [isOpen, event]);

  useEffect(() => {
    // Filter participants based on search term
    if (!searchTerm.trim()) {
      setFilteredParticipants(participants);
      return;
    }

    const filtered = participants.filter(participant => {
      const volunteer = participant.volunteer;
      if (!volunteer) {
        return false;
      }
      
      const searchLower = searchTerm.toLowerCase();
      return (
        (volunteer.name && volunteer.name.toLowerCase().includes(searchLower)) ||
        (volunteer.email && volunteer.email.toLowerCase().includes(searchLower)) ||
        (volunteer.phone && volunteer.phone.toLowerCase().includes(searchLower)) ||
        (volunteer.universityRollNo && volunteer.universityRollNo.toLowerCase().includes(searchLower)) ||
        (participant.role && participant.role.toLowerCase().includes(searchLower))
      );
    });
    
    setFilteredParticipants(filtered);
  }, [participants, searchTerm]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5002/api/events/${event._id}/participants`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch participants');
      }

      const data = await response.json();
      setParticipants(data.participants || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error(error.message || 'Failed to fetch participants');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Role', 'NSS Status', 'University Roll No', 'Registration Date', 'Attended'],
      ...filteredParticipants.map(participant => [
        participant.volunteer?.name || 'N/A',
        participant.volunteer?.email || 'N/A',
        participant.volunteer?.phone || 'N/A',
        participant.role,
        participant.participantType === 'nss_volunteer' && participant.volunteer?.nssApplicationStatus === 'approved' 
          ? 'NSS Volunteer' 
          : participant.participantType === 'external'
          ? 'External'
          : 'Pending NSS',
        participant.volunteer?.universityRollNo || 'N/A',
        new Date(participant.registrationDate).toLocaleDateString(),
        participant.attended ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}_participants.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Participants list exported successfully!');
  };

  const exportAttendanceReport = () => {
    const attendedParticipants = participants.filter(p => p.attended);
    const notAttendedParticipants = participants.filter(p => !p.attended);
    
    const reportContent = [
      ['EVENT ATTENDANCE REPORT'],
      ['Event:', event.title],
      ['Date:', new Date().toLocaleDateString()],
      [''],
      ['SUMMARY'],
      ['Total Registered:', participants.length],
      ['Attended:', attendedParticipants.length],
      ['Not Attended:', notAttendedParticipants.length],
      ['Attendance Rate:', `${Math.round((attendedParticipants.length / participants.length) * 100)}%`],
      [''],
      ['ATTENDED PARTICIPANTS'],
      ['Name', 'Email', 'Phone', 'Role', 'NSS Status', 'University Roll No', 'Registration Date'],
      ...attendedParticipants.map(participant => [
        participant.volunteer?.name || 'N/A',
        participant.volunteer?.email || 'N/A',
        participant.volunteer?.phone || 'N/A',
        participant.role,
        participant.participantType === 'nss_volunteer' && participant.volunteer?.nssApplicationStatus === 'approved' 
          ? 'NSS Volunteer' 
          : participant.participantType === 'external'
          ? 'External'
          : 'Pending NSS',
        participant.volunteer?.universityRollNo || 'N/A',
        new Date(participant.registrationDate).toLocaleDateString()
      ]),
      [''],
      ['NOT ATTENDED PARTICIPANTS'],
      ['Name', 'Email', 'Phone', 'Role', 'NSS Status', 'University Roll No', 'Registration Date'],
      ...notAttendedParticipants.map(participant => [
        participant.volunteer?.name || 'N/A',
        participant.volunteer?.email || 'N/A',
        participant.volunteer?.phone || 'N/A',
        participant.role,
        participant.participantType === 'nss_volunteer' && participant.volunteer?.nssApplicationStatus === 'approved' 
          ? 'NSS Volunteer' 
          : participant.participantType === 'external'
          ? 'External'
          : 'Pending NSS',
        participant.volunteer?.universityRollNo || 'N/A',
        new Date(participant.registrationDate).toLocaleDateString()
      ])
    ];

    const csvString = reportContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '_')}_attendance_report.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Attendance report exported successfully!');
  };

  const exportAttendedOnly = () => {
    const attendedParticipants = participants.filter(p => p.attended);
    
    const csvContent = [
      ['ATTENDED PARTICIPANTS LIST'],
      ['Event:', event.title],
      ['Date:', new Date().toLocaleDateString()],
      ['Total Attended:', attendedParticipants.length],
      [''],
      ['Name', 'Email', 'Phone', 'Role', 'NSS Status', 'University Roll No', 'Registration Date', 'Attended At'],
      ...attendedParticipants.map(participant => [
        participant.volunteer?.name || 'N/A',
        participant.volunteer?.email || 'N/A',
        participant.volunteer?.phone || 'N/A',
        participant.role,
        participant.participantType === 'nss_volunteer' && participant.volunteer?.nssApplicationStatus === 'approved' 
          ? 'NSS Volunteer' 
          : participant.participantType === 'external'
          ? 'External'
          : 'Pending NSS',
        participant.volunteer?.universityRollNo || 'N/A',
        new Date(participant.registrationDate).toLocaleDateString(),
        participant.attendanceDate ? new Date(participant.attendanceDate).toLocaleDateString() : 'N/A'
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '_')}_attended_participants.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Attended participants list exported successfully!');
  };

  const handleAttendanceToggle = async (participant) => {
    try {
      const newAttendedStatus = !participant.attended;
      const token = localStorage.getItem('token');
      
      
      // Update local state immediately for better UX
      setParticipants(prev => 
        prev.map(p => 
          p._id === participant._id 
            ? { ...p, attended: newAttendedStatus, attendanceDate: newAttendedStatus ? new Date() : null }
            : p
        )
      );
      
      // Update in database
      const volunteerId = participant._id;
      
      const response = await fetch(`http://localhost:5002/api/events/${event._id}/simple-attendance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          volunteerId: volunteerId,
          attended: newAttendedStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update attendance');
      }

      toast.success(`Attendance ${newAttendedStatus ? 'marked' : 'unmarked'} successfully!`);
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Failed to update attendance');
      
      // Revert local state on error
      setParticipants(prev => 
        prev.map(p => 
          p._id === participant._id 
            ? { ...p, attended: participant.attended }
            : p
        )
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-2">Event Participants</h2>
              <p className="text-blue-100">{event.title}</p>
              <p className="text-sm text-blue-200">
                {participants.length} of {event.maxParticipants} participants
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors bg-black bg-opacity-20 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search and Export */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, phone, university ID, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>

          {/* Participants List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading participants...</p>
            </div>
          ) : filteredParticipants.length > 0 ? (
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NSS Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        University Roll No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredParticipants.map((participant, index) => (
                      <tr key={participant._id || `participant-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {participant.volunteer?.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {participant.volunteer?.college || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {participant.volunteer?.email || 'N/A'}
                          </div>
                          {participant.volunteer?.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {participant.volunteer.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            participant.role === 'Student' 
                              ? 'bg-green-100 text-green-800' 
                              : participant.role === 'Staff'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {participant.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              participant.participantType === 'nss_volunteer' && participant.volunteer?.nssApplicationStatus === 'approved'
                                ? 'bg-green-100 text-green-800' 
                                : participant.participantType === 'external'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {participant.participantType === 'nss_volunteer' && participant.volunteer?.nssApplicationStatus === 'approved' 
                                ? 'NSS Volunteer' 
                                : participant.participantType === 'external'
                                ? 'External'
                                : 'Pending NSS'
                              }
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {participant.volunteer?.universityRollNo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(participant.registrationDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              participant.attended 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {participant.attended ? 'Attended' : 'Not Attended'}
                            </span>
                            {/* Only show toggle button for public events */}
                            {event.registrationType === 'public' && (
                              <button
                                onClick={() => handleAttendanceToggle(participant)}
                                className={`p-1 rounded-full transition-colors ${
                                  participant.attended
                                    ? 'bg-red-100 hover:bg-red-200 text-red-600'
                                    : 'bg-green-100 hover:bg-green-200 text-green-600'
                                }`}
                                title={participant.attended ? 'Mark as Not Attended' : 'Mark as Attended'}
                              >
                                {participant.attended ? (
                                  <X className="w-4 h-4" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Participants Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'No participants match your search criteria.' : 'No one has registered for this event yet.'}
              </p>
            </div>
          )}

          {/* Summary Stats */}
          {participants.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{participants.length}</div>
                <div className="text-sm text-blue-800">Total Participants</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {participants.filter(p => p.attended).length}
                </div>
                <div className="text-sm text-green-800">Attended</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((participants.length / event.maxParticipants) * 100)}%
                </div>
                <div className="text-sm text-purple-800">Capacity Filled</div>
              </div>
            </div>
          )}

          {/* Attended Participants Section - Only for Public Events */}
          {event.registrationType === 'public' && participants.filter(p => p.attended).length > 0 && (
            <div className="mt-6 bg-green-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Check className="w-5 h-5 mr-2 text-green-600" />
                  Attended Participants ({participants.filter(p => p.attended).length})
                </h3>
                <button
                  onClick={exportAttendedOnly}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Attended List
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NSS Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University Roll No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attended At</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participants.filter(p => p.attended).map((participant, index) => (
                      <tr key={participant._id || `attended-${index}`} className="hover:bg-green-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {participant.volunteer?.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {participant.volunteer?.college || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {participant.volunteer?.email && (
                              <div className="flex items-center text-sm text-gray-900">
                                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                {participant.volunteer.email}
                              </div>
                            )}
                            {participant.volunteer?.phone && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                {participant.volunteer.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            participant.role === 'Student' 
                              ? 'bg-green-100 text-green-800' 
                              : participant.role === 'Staff'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {participant.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            participant.participantType === 'nss_volunteer' && participant.volunteer?.nssApplicationStatus === 'approved'
                              ? 'bg-green-100 text-green-800' 
                              : participant.participantType === 'external'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {participant.participantType === 'nss_volunteer' && participant.volunteer?.nssApplicationStatus === 'approved' 
                              ? 'NSS Volunteer' 
                              : participant.participantType === 'external'
                              ? 'External'
                              : 'Pending NSS'
                            }
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {participant.volunteer?.universityRollNo || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {participant.attendanceDate ? formatDate(participant.attendanceDate) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Event Report Section */}
          {participants.length > 0 && (
            <div className="mt-6 bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Event Report
                  {event.registrationType === 'public' && (
                    <span className="ml-2 text-sm text-gray-500">(Public Event - Attendance Tracking Enabled)</span>
                  )}
                  {event.registrationType === 'internal' && (
                    <span className="ml-2 text-sm text-gray-500">(Internal Event - NSS Volunteers Only)</span>
                  )}
                </h3>
                <button
                  onClick={exportAttendanceReport}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Attendance Statistics */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">
                    {event.registrationType === 'public' ? 'Attendance Statistics' : 'Registration Statistics'}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Registered:</span>
                      <span className="font-medium">{participants.length}</span>
                    </div>
                    {event.registrationType === 'public' ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Attended:</span>
                          <span className="font-medium text-green-600">{participants.filter(p => p.attended).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Not Attended:</span>
                          <span className="font-medium text-red-600">{participants.filter(p => !p.attended).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Attendance Rate:</span>
                          <span className="font-medium text-blue-600">
                            {Math.round((participants.filter(p => p.attended).length / participants.length) * 100)}%
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">NSS Volunteers:</span>
                          <span className="font-medium text-blue-600">{participants.filter(p => p.participantType === 'nss_volunteer').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Approved Volunteers:</span>
                          <span className="font-medium text-green-600">
                            {participants.filter(p => p.participantType === 'nss_volunteer' && p.volunteer?.nssApplicationStatus === 'approved').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Pending Approval:</span>
                          <span className="font-medium text-yellow-600">
                            {participants.filter(p => p.participantType === 'nss_volunteer' && p.volunteer?.nssApplicationStatus !== 'approved').length}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Participant Breakdown */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Participant Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">NSS Volunteers:</span>
                      <span className="font-medium">{participants.filter(p => p.participantType === 'nss_volunteer').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">External Participants:</span>
                      <span className="font-medium">{participants.filter(p => p.participantType === 'external').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Students:</span>
                      <span className="font-medium">{participants.filter(p => p.role === 'Student').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Staff:</span>
                      <span className="font-medium">{participants.filter(p => p.role === 'Staff').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipationListModal;
