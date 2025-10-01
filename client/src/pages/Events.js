import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Search, 
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Bell,
  ArrowUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import logger from '../utils/logger';
import errorHandler from '../utils/errorHandler';
import CreateEventModal from '../components/events/CreateEventModal';
import EventDetailsModal from '../components/events/EventDetailsModal';
import EditEventModal from '../components/events/EditEventModal';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState({ upcoming: [], past: [] });
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    eventType: 'all',
    registrationType: 'all',
    today: false,
    upcoming: false
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  // Auto-refresh events every minute to show status updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Don't auto-refresh if any modal is open
      if (!showCreateModal && !showDetailsModal && !showEditModal) {
        fetchEvents();
      }
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [showCreateModal, showDetailsModal, showEditModal]);

  useEffect(() => {
    if (events.upcoming || events.past) {
      applyFilters();
    }
  }, [events, filters]);

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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/events/categories');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      
      if (data.success) {
        setEvents({
          upcoming: data.upcoming || [],
          past: data.past || []
        });
        setLastUpdated(new Date());
      } else {
        throw new Error(data.message || 'API returned error');
      }
    } catch (error) {
      errorHandler.handleError(error, 'Events fetchEvents');
      setEvents({ upcoming: [], past: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchEvents();
    toast.success('Events refreshed!');
  };

  const applyFilters = () => {
    if (!events.upcoming && !events.past) {
      setFilteredEvents({ upcoming: [], past: [] });
      return;
    }

    const filterEvents = (eventList) => {
      if (!Array.isArray(eventList)) return [];
      
      // Filter out any undefined or null events
      const validEvents = eventList.filter(event => event && event.title);
      let filtered = [...validEvents];

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(event => 
          (event.title && event.title.toLowerCase().includes(searchLower)) ||
          (event.description && event.description.toLowerCase().includes(searchLower)) ||
          (event.location && event.location.toLowerCase().includes(searchLower))
        );
      }

      // Status filter
      if (filters.status !== 'all') {
        filtered = filtered.filter(event => event.status === filters.status);
      }

      // Event type filter
      if (filters.eventType !== 'all') {
        filtered = filtered.filter(event => event.eventType === filters.eventType);
      }

      // Registration type filter
      if (filters.registrationType !== 'all') {
        filtered = filtered.filter(event => event.registrationType === filters.registrationType);
      }

      // Today filter
      if (filters.today) {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        filtered = filtered.filter(event => 
          event.startDate && new Date(event.startDate) >= startOfDay && new Date(event.startDate) <= endOfDay
        );
      }

      // Upcoming filter (next 7 days)
      if (filters.upcoming) {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
        filtered = filtered.filter(event => 
          event.startDate && new Date(event.startDate) >= today && new Date(event.startDate) <= nextWeek
        );
      }

      return filtered;
    };

    setFilteredEvents({
      upcoming: filterEvents(events.upcoming),
      past: filterEvents(events.past)
    });
  };

  const handleEventAction = (event, action) => {
    setSelectedEvent(event);
    switch (action) {
      case 'view':
        setShowDetailsModal(true);
        break;
      case 'edit':
        setShowEditModal(true);
        break;
      case 'delete':
        handleDeleteEvent(event);
        break;
      default:
        break;
    }
  };

  const handleDeleteEvent = async (event) => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/events/${event._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Event deleted successfully');
        fetchEvents();
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      errorHandler.handleError(error, 'Event deletion');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'text-blue-600 bg-blue-100';
      case 'Ongoing': return 'text-green-600 bg-green-100';
      case 'Completed': return 'text-gray-600 bg-gray-100';
      case 'Cancelled': return 'text-red-600 bg-red-100';
      case 'Postponed': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16 sm:pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Manage and participate in NSS community events</p>
              <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                Last updated: {lastUpdated.toLocaleTimeString()} | 
                Status updates happen automatically every minute
              </p>
            </div>
            {user?.role === 'admin' && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-0">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="inline-flex items-center justify-center px-3 py-2 sm:px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                >
                  <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">Refresh</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center justify-center px-3 py-2 sm:px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Create Event</span>
                  <span className="sm:hidden">Create</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Postponed">Postponed</option>
            </select>

            {/* Event Type Filter */}
            <select
              value={filters.eventType}
              onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="Community Service">Community Service</option>
              <option value="Educational">Educational</option>
              <option value="Cultural">Cultural</option>
              <option value="Environmental">Environmental</option>
              <option value="Health">Health</option>
              <option value="Emergency">Emergency</option>
              <option value="Other">Other</option>
            </select>

            {/* Registration Type Filter */}
            <select
              value={filters.registrationType}
              onChange={(e) => setFilters({ ...filters, registrationType: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Registration Types</option>
              <option value="internal">Internal Events</option>
              <option value="public">Public Events</option>
            </select>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setFilters({ ...filters, today: !filters.today })}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filters.today 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Today
            </button>
            <button
              onClick={() => setFilters({ ...filters, upcoming: !filters.upcoming })}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filters.upcoming 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-1" />
              Next 7 Days
            </button>
            
            {/* Clear Filters Button */}
            <button
              onClick={() => setFilters({
                search: '',
                status: 'all',
                eventType: 'all',
                registrationType: 'all',
                today: false,
                upcoming: false
              })}
              className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition-colors"
            >
              <Filter className="w-4 h-4 inline mr-1" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Event Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Upcoming Events ({filteredEvents.upcoming?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'past'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Past Events ({filteredEvents.past?.length || 0})
            </button>
          </nav>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {!Array.isArray(filteredEvents[activeTab]) || filteredEvents[activeTab].length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your filters or create a new event.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents[activeTab].map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                {/* Event Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.registrationType === 'public' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {(() => {
                            return event.registrationType === 'public' ? 'Public' : 'Internal';
                          })()}
                        </span>
                      </div>
                    </div>
                    {user?.role === 'admin' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEventAction(event, 'edit')}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEventAction(event, 'delete')}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{event.currentParticipants}/{event.maxParticipants} participants</span>
                    </div>
                  </div>
                </div>

                {/* Event Footer */}
                <div className="p-4 bg-gray-50 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {event.eventType}
                    </span>
                    <button
                      onClick={() => handleEventAction(event, 'view')}
                      className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateEventModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            // Refresh events after creating to show the new event
            setTimeout(() => fetchEvents(), 500);
          }}
          onEventCreated={fetchEvents}
        />
      )}

      {showDetailsModal && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onEventUpdated={fetchEvents}
        />
      )}

      {showEditModal && selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            // Refresh events after editing to show the updated event
            setTimeout(() => fetchEvents(), 500);
          }}
          onEventUpdated={fetchEvents}
        />
      )}

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

export default Events;
