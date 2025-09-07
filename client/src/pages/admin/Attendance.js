import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  AlertTriangle,
  Download,
  Search,
  Filter,
  Eye,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Attendance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [allVolunteers, setAllVolunteers] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch events and volunteers
  useEffect(() => {
    fetchEvents();
    fetchAllVolunteers();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllVolunteers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/volunteers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch volunteers');
      }
      
      const data = await response.json();
      // Filter only approved NSS volunteers and sort alphabetically
      const approvedVolunteers = data.filter(volunteer => volunteer.nssApplicationStatus === 'approved');
      const sortedVolunteers = approvedVolunteers.sort((a, b) => a.name.localeCompare(b.name));
      setAllVolunteers(sortedVolunteers);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    }
  };

  const fetchAttendanceData = async (eventId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/attendance/event/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }
      
      const data = await response.json();
      setSelectedEvent(data.event);
      
      // Create attendance data for all approved volunteers
      const allVolunteersData = allVolunteers.map(volunteer => {
        const attendanceRecord = data.attendance.find(
          a => a.volunteer._id === volunteer._id
        );
        
        return {
          volunteerId: volunteer._id,
          name: volunteer.name,
          email: volunteer.email,
          phone: volunteer.phone,
          rollNumber: volunteer.rollNumber,
          status: attendanceRecord ? attendanceRecord.status : 'not-marked',
          remarks: attendanceRecord ? attendanceRecord.remarks : '',
          markedAt: attendanceRecord ? attendanceRecord.markedAt : null
        };
      });
      
      setAttendanceData(allVolunteersData);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    fetchAttendanceData(event._id);
  };

  const updateAttendanceStatus = (volunteerId, status) => {
    setAttendanceData(prev => 
      prev.map(record => 
        record.volunteerId === volunteerId 
          ? { ...record, status, remarks: '' }
          : record
      )
    );
  };

  const updateRemarks = (volunteerId, remarks) => {
    setAttendanceData(prev => 
      prev.map(record => 
        record.volunteerId === volunteerId 
          ? { ...record, remarks }
          : record
      )
    );
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      // Mark all volunteers - present ones as marked, others as absent
      const attendanceDataToSend = attendanceData.map(record => ({
        volunteerId: record.volunteerId,
        status: record.status === 'not-marked' ? 'absent' : record.status,
        remarks: record.remarks
      }));

      const response = await fetch(`/api/attendance/event/${selectedEvent._id}/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ attendanceData: attendanceDataToSend })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save attendance');
      }

      toast.success('Attendance saved successfully! All unmarked volunteers marked as absent.');
      fetchAttendanceData(selectedEvent._id); // Refresh data
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error(error.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  // Check if event is in the future
  const isEventInFuture = (event) => {
    if (!event || !event.startDate) return false;
    const eventDate = new Date(event.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    return eventDate > today;
  };

  const exportAttendanceReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/attendance/event/${selectedEvent._id}/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      const report = await response.json();
      
      // Create CSV content
      let csvContent = 'Name,Email,Phone,Roll Number,Status,Remarks,Marked At\n';
      
      report.attendance.forEach(record => {
        const status = record.status === 'not-marked' ? 'absent' : record.status;
        csvContent += `"${record.name}","${record.email}","${record.phone}","${record.rollNumber}","${status}","${record.remarks}","${record.markedAt || ''}"\n`;
      });

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${selectedEvent.title}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Attendance report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100';
      case 'absent': return 'text-red-600 bg-red-100';
      case 'not-marked': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4" />;
      case 'absent': return <XCircle className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const filteredAttendanceData = attendanceData.filter(record => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || record.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  if (loading && !selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Management</h1>
          <p className="text-gray-600">Mark attendance for approved NSS volunteers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Events List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Events</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.map(event => {
                  const isFuture = isEventInFuture(event);
                  return (
                    <button
                      key={event._id}
                      onClick={() => handleEventSelect(event)}
                      className={`w-full text-left p-4 rounded-xl border transition-colors ${
                        selectedEvent?._id === event._id
                          ? 'border-blue-500 bg-blue-50'
                          : isFuture
                          ? 'border-orange-200 bg-orange-50 hover:border-orange-300'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800">{event.title}</h3>
                        {isFuture && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                            Future
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(event.startDate)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {formatTime(event.startTime)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Attendance Management */}
          <div className="lg:col-span-3">
            {selectedEvent ? (
              <div className="space-y-6">
                {/* Future Event Warning */}
                {isEventInFuture(selectedEvent) && (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                      <h3 className="text-lg font-semibold text-orange-800">Future Event</h3>
                    </div>
                    <p className="text-orange-700 mb-2">
                      This event is scheduled for <strong>{formatDate(selectedEvent.startDate)}</strong>. 
                      Attendance can only be marked on or after the event date.
                    </p>
                    <p className="text-sm text-orange-600">
                      You can view the event details and registered volunteers, but attendance marking is disabled until the event date.
                    </p>
                  </div>
                )}

                {/* Event Details */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedEvent.title}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-600">{formatDate(selectedEvent.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-green-600" />
                          <span className="text-gray-600">{formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-red-600" />
                          <span className="text-gray-600">{selectedEvent.location}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={exportAttendanceReport}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export Report
                    </button>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search approved NSS volunteer by name, email, or roll number..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="not-marked">Not Marked</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Attendance Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-800">
                        Approved NSS Volunteers ({filteredAttendanceData.length} volunteers)
                      </h3>
                      <button
                        onClick={saveAttendance}
                        disabled={saving || isEventInFuture(selectedEvent)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors text-lg font-medium ${
                          isEventInFuture(selectedEvent)
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                        }`}
                      >
                        <Save className="w-5 h-5" />
                        {saving ? 'Saving...' : isEventInFuture(selectedEvent) ? 'Future Event - Disabled' : 'Save Attendance'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Volunteer Name
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact Info
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Attendance Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Remarks
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAttendanceData.map((record, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-lg font-medium text-gray-900">{record.name}</div>
                                {record.rollNumber && (
                                  <div className="text-sm text-gray-500">Roll: {record.rollNumber}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{record.email}</div>
                              <div className="text-sm text-gray-500">{record.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={record.status}
                                onChange={(e) => updateAttendanceStatus(record.volunteerId, e.target.value)}
                                disabled={isEventInFuture(selectedEvent)}
                                className={`px-4 py-2 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  isEventInFuture(selectedEvent)
                                    ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                                    : 'border-gray-300'
                                }`}
                              >
                                <option value="not-marked">Not Marked</option>
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                placeholder={isEventInFuture(selectedEvent) ? "Disabled for future events" : "Add remarks..."}
                                value={record.remarks}
                                onChange={(e) => updateRemarks(record.volunteerId, e.target.value)}
                                disabled={isEventInFuture(selectedEvent)}
                                className={`w-full px-4 py-2 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  isEventInFuture(selectedEvent)
                                    ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                                    : 'border-gray-300'
                                }`}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Attendance Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {attendanceData.filter(r => r.status === 'present').length}
                      </div>
                      <div className="text-sm text-green-700">Present</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {attendanceData.filter(r => r.status === 'absent').length}
                      </div>
                      <div className="text-sm text-red-700">Absent</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">
                        {attendanceData.filter(r => r.status === 'not-marked').length}
                      </div>
                      <div className="text-sm text-gray-700">Not Marked</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Select an Event</h3>
                <p className="text-gray-600">Choose an event from the list to mark attendance</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
