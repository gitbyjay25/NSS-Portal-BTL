import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  AlertTriangle,
  Camera,
  Eye,
  Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRegistration, setUserRegistration] = useState(null);
  const [registering, setRegistering] = useState(false);

  // Fetch event photos
  const { data: eventPhotos, isLoading: photosLoading, error: photosError } = useQuery(
    ['eventPhotos', id],
    async () => {
      if (!id) {
        return [];
      }
      
      try {
        const response = await fetch(`/api/gallery?event=${id}`);
        
        const data = await response.json();
        
        return data.gallery || [];
      } catch (error) {
        console.error('❌ Error fetching photos:', error);
        return [];
      }
    },
    {
      enabled: !!id,
      retry: 2
    }
  );

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          throw new Error('Event not found');
        }
        const eventData = await response.json();
        setEvent(eventData);
        
        // Check if current user is registered
        if (user && eventData.registeredVolunteers) {
          const registration = eventData.registeredVolunteers.find(
            reg => reg.volunteer._id === user.id || reg.volunteer === user.id
          );
          setIsRegistered(!!registration);
          setUserRegistration(registration);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please login to register for events');
      return;
    }

    try {
      setRegistering(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/events/${id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'Participant' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register');
      }

      const result = await response.json();
      setEvent(result.event);
      setIsRegistered(true);
      toast.success(result.message || 'Successfully registered for the event!');
    } catch (error) {
      console.error('Error registering:', error);
      toast.error(error.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    try {
      setRegistering(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/events/${id}/unregister`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unregister');
      }

      const result = await response.json();
      setEvent(result.event);
      setIsRegistered(false);
      setUserRegistration(null);
      toast.success(result.message || 'Successfully unregistered from the event');
    } catch (error) {
      console.error('Error unregistering:', error);
      toast.error(error.message || 'Failed to unregister from event');
    } finally {
      setRegistering(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/events')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Background Image */}
      <div 
        className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600"
        style={{
          backgroundImage: event.image && event.image !== '/default-event.jpg' 
            ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${event.image})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* Back button */}
        <div className="relative z-10 p-6">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center text-white hover:text-gray-200 transition-colors bg-black bg-opacity-30 rounded-full px-4 py-2 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </button>
        </div>

        {/* Event title and badges */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-4xl font-bold mb-3 drop-shadow-lg">{event.title}</h1>
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 backdrop-blur-sm ${getStatusColor(event.status)}`}>
              {event.status}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 backdrop-blur-sm text-white">
              {event.eventType}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Event</h2>
              <p className="text-gray-700 leading-relaxed text-lg">{event.description}</p>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Event Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium text-gray-800">{formatDate(event.startDate)}</p>
                      {event.endDate !== event.startDate && (
                        <p className="text-sm text-gray-500">to {formatDate(event.endDate)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium text-gray-800">{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-800">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Participants</p>
                      <p className="font-medium text-gray-800">{event.currentParticipants || 0} / {event.maxParticipants}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements */}
            {event.requirements && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  Requirements
                </h2>
                <p className="text-gray-700">{event.requirements}</p>
              </div>
            )}



            {/* Event Photos */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Event Photos</h2>
                {eventPhotos && eventPhotos.length > 0 && (
                  <span className="text-sm text-gray-500">{eventPhotos.length} photos</span>
                )}
              </div>
              

              
              {photosLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading photos...</p>
                </div>
              ) : photosError ? (
                <div className="text-center py-8">
                  <p className="text-red-600">Error loading photos. Please try again.</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : eventPhotos && eventPhotos.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {eventPhotos.map((photo) => (
                      <div 
                        key={photo._id}
                        className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => window.open(photo.imageUrl, '_blank')}
                      >
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-white text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded truncate">
                            {photo.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => navigate('/gallery')}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      View All Photos
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Photos Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Be the first to share photos from this event!
                  </p>
                  {user && (
                    <button
                      onClick={() => navigate('/volunteer/upload')}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Upload Photos
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Registration</h3>
              
              {user ? (
                <div className="space-y-4">
                  {!isRegistered ? (
                    <button
                      onClick={handleRegister}
                      disabled={registering || event.currentParticipants >= event.maxParticipants}
                      className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {registering ? 'Registering...' : 'Register for Event'}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-green-800 font-medium">You're Registered!</p>
                        <p className="text-sm text-green-600">Role: {userRegistration?.role || 'Participant'}</p>
                      </div>
                      <button
                        onClick={handleUnregister}
                        disabled={registering}
                        className="w-full flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        {registering ? 'Unregistering...' : 'Unregister'}
                      </button>
                    </div>
                  )}

                  {event.currentParticipants >= event.maxParticipants && !isRegistered && (
                    <div className="text-center p-3 bg-red-50 rounded-xl">
                      <p className="text-red-800 font-medium">Event is Full</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-600 mb-3">Please login to register for this event</p>
                  <button
                    onClick={() => navigate('/volunteer/login')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>

            {/* Event Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Event Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium">{event.eventType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-medium">{event.currentParticipants || 0} / {event.maxParticipants}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
