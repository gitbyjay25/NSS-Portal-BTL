import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  AlertTriangle,
  Eye,
  Download,
  Search,
  Filter,
  TrendingUp,
  BarChart3
} from 'lucide-react';

const AttendanceHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    totalEvents: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendanceRate: 0
  });

  useEffect(() => {
    if (user && user._id) {
      fetchAttendanceHistory();
    }
  }, [user]);

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Check if user is loaded
      if (!user || !user._id) {
        toast.error('User not loaded. Please login again.');
        return;
      }
      
      const response = await fetch(`/api/attendance/volunteer/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance history');
      }
      
      const data = await response.json();
      setAttendanceHistory(data);
      
      // Calculate stats
      const totalEvents = data.length;
      const present = data.filter(record => record.status === 'present').length;
      const absent = data.filter(record => record.status === 'absent').length;
      const attendanceRate = totalEvents > 0 ? (present / totalEvents * 100).toFixed(1) : 0;
      
      setStats({
        totalEvents,
        present,
        absent,
        late: 0,
        excused: 0,
        attendanceRate
      });
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
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

  const filteredHistory = attendanceHistory.filter(record => {
    const matchesSearch = record.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.location.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const exportAttendanceReport = () => {
    // Create CSV content
    let csvContent = 'Event Title,Date,Time,Location,Status,Remarks\n';
    
    attendanceHistory.forEach(record => {
      csvContent += `"${record.eventTitle}","${formatDate(record.eventDate)}","${record.eventTime}","${record.location}","${record.status}","${record.remarks || ''}"\n`;
    });

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_attendance_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Attendance report exported successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Attendance History</h1>
          <p className="text-gray-600">Track your participation in NSS events</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
              </div>
            </div>
          </div>

                     <div className="bg-white rounded-2xl shadow-lg p-6">
             <div className="flex items-center">
               <div className="p-3 bg-red-100 rounded-xl">
                 <XCircle className="h-6 w-6 text-red-600" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600">Absent</p>
                 <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
               </div>
             </div>
           </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by event name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
                             <select
                 value={filterStatus}
                 onChange={(e) => setFilterStatus(e.target.value)}
                 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               >
                 <option value="all">All Status</option>
                 <option value="present">Present</option>
                 <option value="absent">Absent</option>
                 <option value="not-marked">Not Marked</option>
               </select>
              <button
                onClick={exportAttendanceReport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              Event History ({filteredHistory.length} events)
            </h2>
          </div>
          
          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Events Found</h3>
              <p className="text-gray-600">No events match your search criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredHistory.map((record, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{record.eventTitle}</h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          {record.status.replace('-', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>{formatDate(record.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span>{record.eventTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-600" />
                          <span>{record.location}</span>
                        </div>
                      </div>
                      
                      {record.remarks && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Remarks:</span> {record.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;
