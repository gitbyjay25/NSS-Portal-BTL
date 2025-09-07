import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, AlertTriangle, UserPlus, UserMinus, CheckCircle, XCircle, Eye, Globe, UserCheck, UserX } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import ParticipationListModal from './ParticipationListModal';
import ExternalRegistrationModal from './ExternalRegistrationModal';

const EventDetailsModal = ({ event, isOpen, onClose, onEventUpdated }) => {
  const { user } = useAuth();
  const [currentEvent, setCurrentEvent] = useState(event);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRegistration, setUserRegistration] = useState(null);
  const [showParticipationModal, setShowParticipationModal] = useState(false);
  const [showExternalRegistrationModal, setShowExternalRegistrationModal] = useState(false);

  useEffect(() => {
    setCurrentEvent(event);
    // Check if current user is registered
    if (user && event.registeredVolunteers) {
      const registration = event.registeredVolunteers.find(
        reg => reg.volunteer._id === user.id || reg.volunteer === user.id
      );
      setIsRegistered(!!registration);
      setUserRegistration(registration);
    }

  }, [event, user]);

  const handleRegister = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/events/${event._id}/register`, {
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
      setCurrentEvent(result.event);
      setIsRegistered(true);
      toast.success(result.message || 'Successfully registered for the event!');
      onEventUpdated();
    } catch (error) {
      console.error('Error registering:', error);
      toast.error(error.message || 'Failed to register for event');
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/events/${event._id}/unregister`, {
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
      setCurrentEvent(result.event);
      setIsRegistered(false);
      setUserRegistration(null);
      toast.success(result.message || 'Successfully unregistered from event');
      onEventUpdated();
    } catch (error) {
      console.error('Error unregistering:', error);
      toast.error(error.message || 'Failed to unregister from event');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceToggle = async (volunteerId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/events/${event._id}/attendance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          volunteerId,
          attended: !currentStatus
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update attendance');
      }

      const result = await response.json();
      setCurrentEvent(result.event);
      toast.success(result.message || 'Attendance updated successfully');
      onEventUpdated();
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error(error.message || 'Failed to update attendance');
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-blue-600 bg-blue-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
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

  if (!isOpen || !currentEvent) return null;

  const canManageAttendance = user?.role === 'admin' || 
                             currentEvent.createdBy._id === user?.id ||
                             currentEvent.teamLeaders.some(leader => leader._id === user?.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Compact Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors bg-black bg-opacity-20 rounded-full p-2"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Event title and badges */}
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-2">{currentEvent.title}</h2>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 backdrop-blur-sm ${getStatusColor(currentEvent.status)}`}>
                {currentEvent.status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 backdrop-blur-sm text-white">
                {currentEvent.eventType}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 max-h-[calc(95vh-120px)] overflow-y-auto">

          {/* Event Details */}
          <div className="space-y-6">
            
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Event</h3>
              <p className="text-gray-600 leading-relaxed">{currentEvent.description}</p>
            </div>
            
            {/* Event Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date & Time */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Schedule
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{formatDate(currentEvent.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{formatTime(currentEvent.startTime)} - {formatTime(currentEvent.endTime)}</span>
                  </div>
                </div>
              </div>
              
              {/* Location */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  Location
                </h4>
                <p className="text-gray-600">{currentEvent.location}</p>
              </div>
            </div>
            
            {/* Participation Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Participation
              </h4>
              
              {/* Registration Type */}
              <div className="mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  currentEvent.registrationType === 'public' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  <Globe className="w-3 h-3 mr-1" />
                  {currentEvent.registrationType === 'public' ? 'Public Event' : 'Internal Event'}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">
                  {currentEvent.currentParticipants}/{currentEvent.maxParticipants} participants
                </span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(currentEvent.currentParticipants / currentEvent.maxParticipants) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Admin Action Button */}
              {currentEvent.currentParticipants > 0 && user?.role === 'admin' && (
                <button
                  onClick={() => setShowParticipationModal(true)}
                  className="w-full inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Participation List
                </button>
              )}
              
              {/* External Registration Button */}
              {currentEvent.registrationType === 'public' && !user && (
                <button
                  onClick={() => setShowExternalRegistrationModal(true)}
                  className="w-full inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register as External Participant
                </button>
              )}
            </div>
            
            {/* Requirements */}
            {currentEvent.requirements && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  Requirements
                </h4>
                <p className="text-gray-600">{currentEvent.requirements}</p>
              </div>
            )}
          </div>



          {/* Registration Section */}
          {user && user.role !== 'admin' && (
            <div className="border-t pt-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Registration</h3>
                {isRegistered && userRegistration && (
                  <span className="text-sm text-gray-600">
                    Role: {userRegistration.role}
                  </span>
                )}
              </div>

              {!isRegistered ? (
                <button
                  onClick={handleRegister}
                  disabled={loading || currentEvent.currentParticipants >= currentEvent.maxParticipants}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {loading ? 'Registering...' : 'Register for Event'}
                </button>
              ) : (
                <div className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Registered
                </div>
              )}

              {currentEvent.currentParticipants >= currentEvent.maxParticipants && !isRegistered && (
                <p className="text-sm text-red-600 mt-2">Event is full</p>
              )}
            </div>
          )}

          {/* Admin Registration Status */}
          {user && user.role === 'admin' && (
            <div className="border-t pt-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Registration Status</h3>
                {isRegistered && userRegistration && (
                  <span className="text-sm text-gray-600">
                    Role: {userRegistration.role}
                  </span>
                )}
              </div>

              {isRegistered ? (
                <div className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Registered
                </div>
              ) : (
                <div className="inline-flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg">
                  <UserX className="w-4 h-4 mr-2" />
                  Not Registered
                </div>
              )}
            </div>
          )}





          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Participation List Modal */}
      <ParticipationListModal
        event={currentEvent}
        isOpen={showParticipationModal}
        onClose={() => setShowParticipationModal(false)}
      />
      
      {/* External Registration Modal */}
      <ExternalRegistrationModal
        event={currentEvent}
        isOpen={showExternalRegistrationModal}
        onClose={() => setShowExternalRegistrationModal(false)}
        onRegistrationSuccess={() => {
          // Refresh event data or show success message
          toast.success('Registration successful!');
        }}
      />
    </div>
  );
};

export default EventDetailsModal;
