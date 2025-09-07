import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  TrendingUp, 
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

const AttendanceAnalytics = () => {
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [viewMode, setViewMode] = useState('year'); // 'year' or 'month'

  // Fetch all events with attendance data
  const { data: eventsData, isLoading: eventsLoading } = useQuery(
    'eventsWithAttendance',
    async () => {
      const response = await axios.get('/api/events');
      return response.data;
    }
  );

  // Fetch all volunteers
  const { data: volunteersData, isLoading: volunteersLoading } = useQuery(
    'allVolunteers',
    async () => {
      const response = await axios.get('/api/admin/volunteers');
      return response.data;
    }
  );

  if (eventsLoading || volunteersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const events = eventsData || [];
  const allVolunteers = volunteersData?.volunteers || [];
  const approvedVolunteers = allVolunteers.filter(v => 
    v.nssApplicationStatus === 'approved' && v.hasAppliedToNSS === true
  );

  // Get unique values for filters
  const years = [...new Set(approvedVolunteers.map(v => v.year || v.nssApplicationData?.year).filter(Boolean))];
  const departments = [...new Set(approvedVolunteers.map(v => v.department || v.nssApplicationData?.department).filter(Boolean))];
  const eventTypes = [...new Set(events.map(e => e.eventType).filter(Boolean))];


  // Filter events based on selected criteria - only completed events
  const filteredEvents = events.filter(event => {
    // Only include completed events (end date has passed)
    const now = new Date();
    const eventEndDate = new Date(event.endDate);
    if (eventEndDate > now) return false;
    
    if (selectedEventType !== 'all' && event.eventType !== selectedEventType) return false;
    return true;
  });

  // Calculate attendance analytics
  const calculateAnalytics = () => {
    const analytics = {
      yearWise: {},
      monthWise: {},
      departmentWise: {},
      overall: {
        totalEvents: filteredEvents.length,
        totalVolunteers: approvedVolunteers.length,
        totalAttendanceRecords: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0
      }
    };

    // Initialize year-wise data
    years.forEach(year => {
      analytics.yearWise[year] = {
        totalEvents: 0,
        volunteers: approvedVolunteers.filter(v => (v.year || v.nssApplicationData?.year) === year),
        attendance: {},
        summary: {
          totalRecords: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        }
      };
    });

    // Initialize month-wise data
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    months.forEach(month => {
      analytics.monthWise[month] = {
        totalEvents: 0,
        attendance: {},
        summary: {
          totalRecords: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        }
      };
    });

    // Process each event
    filteredEvents.forEach(event => {
      const eventDate = new Date(event.startDate);
      const eventYear = eventDate.getFullYear();
      const eventMonth = months[eventDate.getMonth()];

      // Count events per year/month
      if (analytics.yearWise[eventYear]) {
        analytics.yearWise[eventYear].totalEvents++;
      }
      analytics.monthWise[eventMonth].totalEvents++;

      // Process attendance records
      if (event.attendance && event.attendance.length > 0) {
        event.attendance.forEach(attendanceRecord => {
          const volunteer = approvedVolunteers.find(v => v._id === attendanceRecord.volunteer);
          if (!volunteer) return;

          const volunteerYear = volunteer.year || volunteer.nssApplicationData?.year;
          const volunteerDept = volunteer.department || volunteer.nssApplicationData?.department;

          // Year-wise analytics
          if (analytics.yearWise[volunteerYear]) {
            if (!analytics.yearWise[volunteerYear].attendance[volunteer._id]) {
              analytics.yearWise[volunteerYear].attendance[volunteer._id] = {
                volunteer: volunteer,
                events: [],
                summary: { present: 0, absent: 0, late: 0, excused: 0 }
              };
            }
            
            analytics.yearWise[volunteerYear].attendance[volunteer._id].events.push({
              event: event,
              status: attendanceRecord.status,
              markedAt: attendanceRecord.markedAt
            });
            
            analytics.yearWise[volunteerYear].attendance[volunteer._id].summary[attendanceRecord.status]++;
            analytics.yearWise[volunteerYear].summary[attendanceRecord.status]++;
          }

          // Month-wise analytics
          if (!analytics.monthWise[eventMonth].attendance[volunteer._id]) {
            analytics.monthWise[eventMonth].attendance[volunteer._id] = {
              volunteer: volunteer,
              events: [],
              summary: { present: 0, absent: 0, late: 0, excused: 0 }
            };
          }
          
          analytics.monthWise[eventMonth].attendance[volunteer._id].events.push({
            event: event,
            status: attendanceRecord.status,
            markedAt: attendanceRecord.markedAt
          });
          
          analytics.monthWise[eventMonth].attendance[volunteer._id].summary[attendanceRecord.status]++;
          analytics.monthWise[eventMonth].summary[attendanceRecord.status]++;

          // Overall analytics
          analytics.overall.totalAttendanceRecords++;
          analytics.overall[`${attendanceRecord.status}Count`]++;
        });
      }
    });

    return analytics;
  };

  const analytics = calculateAnalytics() || {
    yearWise: {},
    monthWise: {},
    overall: {
      totalEvents: 0,
      totalVolunteers: 0,
      totalAttendanceRecords: 0,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      excusedCount: 0
    }
  };

  // Filter analytics based on selected filters
  const getFilteredAnalytics = () => {
    if (viewMode === 'year') {
      if (selectedYear === 'all') return analytics.yearWise || {};
      return { [selectedYear]: analytics.yearWise[selectedYear] || {} };
    } else {
      // For month-wise, always show only the selected month
      if (selectedMonth === 'all') {
        // If no month selected, show empty
        return {};
      }
      return { [selectedMonth]: analytics.monthWise[selectedMonth] || {} };
    }
  };

  const filteredAnalytics = getFilteredAnalytics();

  const exportToCSV = () => {
    const csvData = [];
    
    Object.entries(filteredAnalytics).forEach(([key, data]) => {
      csvData.push([`${viewMode === 'year' ? 'Year' : 'Month'}: ${key}`]);
      csvData.push(['Volunteer Name', 'Email', 'Department', 'Year', 'Total Events', 'Present', 'Absent', 'Attendance %']);
      
             Object.entries(data?.attendance || {}).forEach(([volunteerId, volunteerData]) => {
         const volunteer = volunteerData?.volunteer;
         const totalEvents = volunteerData?.events?.length || 0;
         const presentCount = volunteerData?.summary?.present || 0;
         const attendancePercentage = totalEvents > 0 ? ((presentCount / totalEvents) * 100).toFixed(1) : 0;
         
         csvData.push([
           volunteer?.name || 'N/A',
           volunteer?.email || 'N/A',
           volunteer?.department || volunteer?.nssApplicationData?.department || 'N/A',
           volunteer?.year || volunteer?.nssApplicationData?.year || 'N/A',
           totalEvents,
           presentCount,
           volunteerData?.summary?.absent || 0,
           `${attendancePercentage}%`
         ]);
       });
      
      csvData.push([]); // Empty row between sections
    });

    const csvContent = csvData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-analytics-${viewMode}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Attendance analytics exported successfully!');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'excused': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default: return <UserCheck className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-50';
      case 'absent': return 'text-red-600 bg-red-50';
      case 'late': return 'text-yellow-600 bg-yellow-50';
      case 'excused': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Analytics</h1>
          <p className="text-gray-600">Comprehensive attendance analysis for NSS volunteers</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overall.totalEvents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Volunteers</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overall.totalVolunteers}</p>
              </div>
            </div>
          </div>
          
                     <div className="bg-white rounded-lg shadow p-6">
             <div className="flex items-center">
               <CheckCircle className="h-8 w-8 text-green-600" />
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600">Present Records</p>
                 <p className="text-2xl font-bold text-gray-900">{analytics.overall.presentCount}</p>
               </div>
             </div>
           </div>
           
           <div className="bg-white rounded-lg shadow p-6">
             <div className="flex items-center">
               <XCircle className="h-8 w-8 text-red-600" />
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600">Absent Records</p>
                 <p className="text-2xl font-bold text-gray-900">{analytics.overall.absentCount}</p>
               </div>
             </div>
           </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overall.totalAttendanceRecords > 0 
                    ? ((analytics.overall.presentCount / analytics.overall.totalAttendanceRecords) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="year">Year-wise</option>
                <option value="month">Month-wise</option>
              </select>
            </div>

            {/* Year Filter */}
            {viewMode === 'year' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year} Year</option>
                  ))}
                </select>
              </div>
            )}

            {/* Month Filter */}
            {viewMode === 'month' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                                 <select
                   value={selectedMonth}
                   onChange={(e) => setSelectedMonth(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="all">Select Month</option>
                   <option value="January">January</option>
                   <option value="February">February</option>
                   <option value="March">March</option>
                   <option value="April">April</option>
                   <option value="May">May</option>
                   <option value="June">June</option>
                   <option value="July">July</option>
                   <option value="August">August</option>
                   <option value="September">September</option>
                   <option value="October">October</option>
                   <option value="November">November</option>
                   <option value="December">December</option>
                 </select>
              </div>
            )}

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Event Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Export Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

                 {/* Analytics Results */}
         <div className="space-y-8">
           {Object.keys(filteredAnalytics).length === 0 && viewMode === 'month' && selectedMonth === 'all' ? (
             <div className="bg-white rounded-lg shadow p-8 text-center">
               <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Month</h3>
               <p className="text-gray-600">Please select a month from the dropdown above to view attendance analytics.</p>
             </div>
           ) : (
             Object.entries(filteredAnalytics).map(([key, data]) => (
            <div key={key} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {viewMode === 'year' ? `${key} Year` : key} - Attendance Summary
                </h3>
                                 <p className="text-sm text-gray-600">
                   {data?.totalEvents || 0} events • {Object.keys(data?.attendance || {}).length} volunteers with attendance records
                 </p>
              </div>

                             {/* Summary Stats */}
               <div className="px-6 py-4 bg-gray-50">
                 <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                   <div className="text-center">
                     <p className="text-2xl font-bold text-green-600">{data?.summary?.present || 0}</p>
                     <p className="text-sm text-gray-600">Present</p>
                   </div>
                   <div className="text-center">
                     <p className="text-2xl font-bold text-red-600">{data?.summary?.absent || 0}</p>
                     <p className="text-sm text-gray-600">Absent</p>
                   </div>
                 </div>
               </div>

              {/* Volunteer Details */}
              <div className="px-6 py-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Volunteer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Events
                        </th>
                                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Present
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Absent
                         </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance %
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                                         <tbody className="bg-white divide-y divide-gray-200">
                       {Object.entries(data?.attendance || {})
                         .filter(([volunteerId, volunteerData]) => {
                           if (selectedDepartment === 'all') return true;
                           const volunteer = volunteerData?.volunteer;
                           return (volunteer?.department || volunteer?.nssApplicationData?.department) === selectedDepartment;
                         })
                        .map(([volunteerId, volunteerData]) => {
                          const volunteer = volunteerData?.volunteer;
                          const totalEvents = volunteerData?.events?.length || 0;
                          const presentCount = volunteerData?.summary?.present || 0;
                          const attendancePercentage = totalEvents > 0 ? ((presentCount / totalEvents) * 100).toFixed(1) : 0;
                          
                          return (
                            <tr key={volunteerId} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{volunteer?.name || 'N/A'}</div>
                                  <div className="text-sm text-gray-500">{volunteer?.email || 'N/A'}</div>
                                </div>
                              </td>
                                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                 {volunteer?.department || volunteer?.nssApplicationData?.department || 'N/A'}
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                 {volunteer?.year || volunteer?.nssApplicationData?.year || 'N/A'}
                               </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {totalEvents}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                {volunteerData?.summary?.present || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                {volunteerData?.summary?.absent || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  attendancePercentage >= 80 ? 'bg-green-100 text-green-800' :
                                  attendancePercentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {attendancePercentage}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => {
                                  }}
                                  className="text-blue-600 hover:text-blue-900 flex items-center"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
                         </div>
           ))
           )}
         </div>
      </div>
    </div>
  );
};

export default AttendanceAnalytics;
