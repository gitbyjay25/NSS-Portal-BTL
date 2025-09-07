const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const { auth, admin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const logger = require('../utils/logger');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Function to automatically update event statuses based on time
const updateEventStatuses = async () => {
  try {
    const now = new Date();
    
    // Update events that should be Ongoing (start time has passed but end time hasn't)
    const ongoingResult = await Event.updateMany(
      {
        status: 'Upcoming',
        startDate: { $lte: now }
      },
      { 
        status: 'Ongoing',
        $push: {
          notifications: {
            type: 'Status Changed',
            message: 'Event has started and is now ongoing!',
            sentTo: []
          }
        }
      }
    );

    // Update events that should be Completed (end time has passed)
    const completedResult = await Event.updateMany(
      {
        status: { $in: ['Upcoming', 'Ongoing'] },
        endDate: { $lte: now }
      },
      { 
        status: 'Completed',
        $push: {
          notifications: {
            type: 'Status Changed',
            message: 'Event has completed!',
            sentTo: []
          }
        }
      }
    );

    if (ongoingResult.modifiedCount > 0 || completedResult.modifiedCount > 0) {
      console.log(`🕐 Event statuses updated: ${ongoingResult.modifiedCount} ongoing, ${completedResult.modifiedCount} completed`);
    }
  } catch (error) {
    console.error('Error updating event statuses:', error);
  }
};

// Update event statuses every minute
setInterval(updateEventStatuses, 60000);

// Initial update when server starts
updateEventStatuses();

// @route   POST /api/events/update-statuses
// @desc    Manually trigger event status updates (Admin only)
// @access  Private/Admin
router.post('/update-statuses', [auth, admin], async (req, res) => {
  try {
    await updateEventStatuses();
    res.json({ 
      success: true, 
      message: 'Event statuses updated successfully!' 
    });
  } catch (error) {
    console.error('Error in manual status update:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update event statuses' 
    });
  }
});

// @route   GET /api/events/categories
// @desc    Get events categorized into upcoming and past
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const now = new Date();
    
    // Get upcoming events (end date is in the future)
    const upcomingEvents = await Event.find({
      endDate: { $gt: now }
    })
    .populate('createdBy', 'name email')
    .populate('teamLeaders', 'name email')
    .populate('registeredVolunteers.volunteer', 'name email')
    .sort({ startDate: 1 });
    
    

    // Get past events (end date has passed)
    const pastEvents = await Event.find({
      endDate: { $lte: now }
    })
    .populate('createdBy', 'name email')
    .populate('teamLeaders', 'name email')
    .populate('registeredVolunteers.volunteer', 'name email')
    .sort({ startDate: -1 });

    const response = {
      success: true,
      upcoming: upcomingEvents,
      past: pastEvents
    };
    
    
    res.json(response);
  } catch (error) {
    logger.error('Error fetching categorized events', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching events',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/events
// @desc    Get all events (public) with flexible filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, eventType, search, today, upcoming, past } = req.query;
    let filter = {};

    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Filter by event type
    if (eventType && eventType !== 'all') {
      filter.eventType = eventType;
    }

    // Filter today's events
    if (today === 'true') {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      filter.startDate = { $gte: startOfDay, $lte: endOfDay };
    }

    // Filter upcoming events (next 7 days)
    if (upcoming === 'true') {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
      filter.startDate = { $gte: now, $lte: nextWeek };
    }

    // Filter past events (ended before now)
    if (past === 'true') {
      const now = new Date();
      filter.endDate = { $lt: now };
    }

    // Search by title, description, or location
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(filter)
      .populate('createdBy', 'name email')
      .populate('teamLeaders', 'name email')
      .populate('registeredVolunteers.volunteer', 'name email')
      .sort({ startDate: 1 });

    if (events.length > 0) {
      // Events found
    }

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('teamLeaders', 'name email')
      .populate('registeredVolunteers.volunteer', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events
// @desc    Create new event quickly (Admin only) - Flexible for sudden planning
// @access  Private/Admin
router.post('/', [auth, admin, upload.single('image')], async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      registrationType,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      maxParticipants,
      requirements,
      teamLeaders,
      status // Added status to req.body
    } = req.body;

    // Basic validation - only essential fields required
    if (!title || !description || !startDate || !startTime || !location) {
      return res.status(400).json({ message: 'Title, description, start date, start time, and location are required' });
    }

    // Set default values for missing fields
    const eventEndDate = endDate || startDate; // If no end date, use start date
    const eventEndTime = endTime || startTime; // If no end time, use start time
    const eventMaxParticipants = maxParticipants || 50;
    const eventRequirements = requirements || 'No special requirements';

    // Handle image upload
    let imagePath = '/default-event.jpg'; // Default image
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // Auto-detect event status based on time (only if status not manually set)
    let autoStatus = 'Upcoming';
    const now = new Date();
    
    if (!status) { // Only auto-detect if status not provided
      // Create proper datetime objects for comparison
      const eventStartDateTime = new Date(startDate + ' ' + startTime);
      const eventEndDateTime = new Date(endDate + ' ' + endTime);
      
      if (eventStartDateTime <= now) {
        if (eventEndDateTime <= now) {
          autoStatus = 'Completed';
        } else {
          autoStatus = 'Ongoing';
        }
      }
    }
    
    // Use manual status if provided, otherwise use auto-detected status
    const finalStatus = status || autoStatus;

    const newEvent = new Event({
      title,
      description,
      eventType: eventType || 'Community Service',
      registrationType: registrationType || 'internal',
      startDate,
      endDate: eventEndDate,
      startTime,
      endTime: eventEndTime,
      location,
      maxParticipants: eventMaxParticipants,
      requirements: eventRequirements,
      teamLeaders: teamLeaders || [],
      status: finalStatus,
      image: imagePath,
      createdBy: req.user.id
    });

    // Add notification for event creation
    newEvent.notifications.push({
      type: 'Created',
      message: `New event "${title}" has been created!`,
      sentTo: []
    });

    const event = await newEvent.save();
    await event.populate('createdBy', 'name email');
    await event.populate('teamLeaders', 'name email');

    // TODO: Send notifications to all volunteers about new event
    // This would integrate with notification system

    res.json({
      event,
      message: 'Event created successfully!'
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event (Admin only) - Quick updates for sudden changes
// @access  Private/Admin
router.put('/:id', [auth, admin, upload.single('image')], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const {
      title,
      description,
      eventType,
      registrationType,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      maxParticipants,
      requirements,
      teamLeaders,
      status,
      currentParticipants
    } = req.body;


    // Track what changed for notifications
    const changes = [];
    if (title && title !== event.title) changes.push('title');
    if (registrationType && registrationType !== event.registrationType) changes.push('registration type');
    if (startDate && new Date(startDate).getTime() !== event.startDate.getTime()) changes.push('date/time');
    if (location && location !== event.location) changes.push('location');
    if (status && status !== event.status) changes.push('status');

    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (eventType) event.eventType = eventType;
    if (registrationType !== undefined) {
      event.registrationType = registrationType;
    }
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    if (location) event.location = location;
    if (maxParticipants !== undefined) event.maxParticipants = maxParticipants;
    if (requirements) event.requirements = requirements;
    if (teamLeaders) event.teamLeaders = teamLeaders;
    if (status) event.status = status;
    
    // Handle image upload
    if (req.file) {
      event.image = `/uploads/${req.file.filename}`;
      changes.push('image');
    }
    
    // Allow updating current participants for past events
    if (currentParticipants !== undefined && status === 'Completed') {
      event.currentParticipants = Math.max(0, currentParticipants);
    }

    // Update timestamp
    event.updatedAt = Date.now();

    // Add notification for significant changes
    if (changes.length > 0) {
      event.notifications.push({
        type: 'Updated',
        message: `Event "${event.title}" has been updated: ${changes.join(', ')} changed`,
        sentTo: []
      });
    }

    const updatedEvent = await event.save();
    
    // Double-check by querying database directly
    const dbEvent = await Event.findById(req.params.id);
    
    await updatedEvent.populate('createdBy', 'name email');
    await updatedEvent.populate('teamLeaders', 'name email');

    res.json({
      event: updatedEvent,
      message: changes.length > 0 ? `Event updated successfully! Changes: ${changes.join(', ')}` : 'Event updated successfully!'
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event (Admin only)
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Add cancellation notification
    event.notifications.push({
      type: 'Cancelled',
      message: `Event "${event.title}" has been cancelled`,
      sentTo: event.registeredVolunteers.map(reg => reg.volunteer)
    });

    await event.save();
    await event.remove();
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/register
// @desc    Register volunteer for event - Quick registration
// @access  Private
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is full
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if already registered
    const alreadyRegistered = event.registeredVolunteers.find(
      reg => reg.volunteer.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check if registration is still open (2 hours before event)
    const now = new Date();
    const eventStart = new Date(event.startDate + ' ' + event.startTime);
    const registrationDeadline = new Date(eventStart.getTime() - (2 * 60 * 60 * 1000));
    
    if (now >= registrationDeadline) {
      return res.status(400).json({ message: 'Registration is closed for this event' });
    }

    // Add volunteer to event
    event.registeredVolunteers.push({
      volunteer: req.user.id,
      role: req.body.role || 'Participant'
    });

    event.currentParticipants += 1;
    await event.save();

    await event.populate('registeredVolunteers.volunteer', 'name email');
    res.json({
      event,
      message: 'Successfully registered for the event!'
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id/unregister
// @desc    Unregister volunteer from event
// @access  Private
router.delete('/:id/unregister', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Find and remove registration
    const registrationIndex = event.registeredVolunteers.findIndex(
      reg => reg.volunteer.toString() === req.user.id
    );

    if (registrationIndex === -1) {
      return res.status(400).json({ message: 'Not registered for this event' });
    }

    // Check if event is upcoming
    if (new Date() >= new Date(event.startDate)) {
      return res.status(400).json({ message: 'Cannot unregister from past or ongoing events' });
    }

    event.registeredVolunteers.splice(registrationIndex, 1);
    event.currentParticipants = Math.max(0, event.currentParticipants - 1);
    await event.save();

    await event.populate('registeredVolunteers.volunteer', 'name email');
    res.json({
      event,
      message: 'Successfully unregistered from the event'
    });
  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id/attendance
// @desc    Mark attendance for volunteer (Admin/Team Leader only)
// @access  Private
router.put('/:id/attendance', auth, async (req, res) => {
  try {
    const { volunteerId, attended } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is admin, creator, or team leader
    const isAuthorized = req.user.role === 'admin' || 
                        event.createdBy.toString() === req.user.id ||
                        event.teamLeaders.includes(req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to mark attendance' });
    }

    // Find volunteer registration (NSS volunteers)
    let registration = event.registeredVolunteers.find(
      reg => reg.volunteer.toString() === volunteerId
    );

    // If not found in NSS volunteers, check external participants
    if (!registration) {
      const externalParticipant = event.externalParticipants.find(
        ext => ext._id.toString() === volunteerId
      );
      
      if (externalParticipant) {
        externalParticipant.attended = attended;
        externalParticipant.attendanceDate = attended ? new Date() : null;
      } else {
        return res.status(404).json({ message: 'Participant not found for this event' });
      }
    } else {
      registration.attended = attended;
      registration.attendanceDate = attended ? new Date() : null;
    }

    await event.save();
    await event.populate('registeredVolunteers.volunteer', 'name email');

    res.json({
      event,
      message: `Attendance marked as ${attended ? 'present' : 'absent'}`
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/user/registered
// @desc    Get events user is registered for
// @access  Private
router.get('/user/registered', auth, async (req, res) => {
  try {
    const events = await Event.find({
      'registeredVolunteers.volunteer': req.user.id
    })
    .populate('createdBy', 'name email')
    .populate('teamLeaders', 'name email')
    .sort({ startDate: 1 });

    res.json(events);
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/send-reminder
// @desc    Send reminder to registered volunteers (Admin/Team Leader only)
// @access  Private
router.post('/:id/send-reminder', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is admin, creator, or team leader
    const isAuthorized = req.user.role === 'admin' || 
                        event.createdBy.toString() === req.user.id ||
                        event.teamLeaders.includes(req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to send reminders' });
    }

    // Add reminder notification
    event.notifications.push({
      type: 'Reminder',
      message: `Reminder: Event "${event.title}" is ${event.isUrgentEvent ? 'URGENT' : 'coming up'}!`,
      sentTo: event.registeredVolunteers.map(reg => reg.volunteer)
    });

    event.lastNotificationSent = new Date();
    await event.save();

    // TODO: Send actual notifications (WhatsApp, Email, Push)
    // This would integrate with notification system

    res.json({
      message: `Reminder sent to ${event.registeredVolunteers.length} volunteers`,
      event
    });
  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id/participants
// @desc    Get all participants for a specific event
// @access  Private (Admin or Event Creator)
router.get('/:id/participants', auth, async (req, res) => {
  try {
    
    // First, get the event without populate to check if it exists
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }


    // Check if user is admin or event creator
    const isAdmin = req.user.role === 'admin';
    const isEventCreator = event.createdBy && event.createdBy.toString() === req.user.id;
    
    if (!isAdmin && !isEventCreator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view participants'
      });
    }

    // Try to populate the volunteers with error handling
    let populatedEvent;
    try {
      // First, let's check the raw event data
      const rawEvent = await Event.findById(req.params.id);
      
      populatedEvent = await Event.findById(req.params.id)
        .populate({
          path: 'registeredVolunteers.volunteer',
          select: 'name email phone college department year universityRollNo profilePicture nssApplicationStatus'
        })
        .select('registeredVolunteers externalParticipants title maxParticipants');
      
    } catch (populateError) {
      console.error('💥 Populate error:', populateError);
      throw populateError;
    }

    
    // Combine NSS volunteers and external participants
    
    // If populate didn't work, let's try manual population
    let allParticipants = [];
    
    if (populatedEvent.registeredVolunteers && populatedEvent.registeredVolunteers.length > 0) {
      
      // Get all volunteer IDs
      const volunteerIds = populatedEvent.registeredVolunteers.map(vol => vol.volunteer);
      
       // Fetch volunteers manually
      
       // Try to find volunteers with different approaches
       
       // Check if any of the volunteer IDs exist in the database
       for (let i = 0; i < volunteerIds.length; i++) {
         const volunteer = await User.findById(volunteerIds[i]);
         if (volunteer) {
           // Volunteer found
         }
       }
      
       // First, try with the IDs as they are
       let volunteers = await User.find({ _id: { $in: volunteerIds } })
         .select('name email phone college department year universityRollNo profilePicture nssApplicationStatus');
      
      // If no results, try converting to ObjectId
      if (volunteers.length === 0) {
        const mongoose = require('mongoose');
        const objectIds = volunteerIds.map(id => {
          try {
            return new mongoose.Types.ObjectId(id);
          } catch (e) {
            return null;
          }
        }).filter(id => id !== null);
        
        
        volunteers = await User.find({ _id: { $in: objectIds } })
          .select('name email phone college department year universityRollNo profilePicture nssApplicationStatus');
        
      }
      
      // Map the data with individual volunteer fetching
      allParticipants = await Promise.all(
        populatedEvent.registeredVolunteers.map(async (vol, index) => {
          let volunteer = volunteers.find(v => v._id.toString() === vol.volunteer.toString());
          
          // If no volunteer found, try to fetch individual volunteer
          if (!volunteer && vol.volunteer) {
            try {
              volunteer = await User.findById(vol.volunteer)
                .select('name email phone college department year universityRollNo profilePicture nssApplicationStatus');
            } catch (error) {
            }
          }
          
          // Determine role based on profile data
          let role = 'Student'; // Default to Student
          if (volunteer?.college && volunteer.college.toLowerCase().includes('staff')) {
            role = 'Staff';
          } else if (volunteer?.department && volunteer.department.toLowerCase().includes('staff')) {
            role = 'Staff';
          } else if (volunteer?.year && volunteer.year === 'N/A') {
            role = 'Staff'; // No year means likely staff
          }

          return {
            _id: vol._id, // Add the registration ID
            volunteer: {
              _id: volunteer?._id, // Add volunteer ID
              name: volunteer?.name || 'N/A',
              email: volunteer?.email || 'N/A',
              phone: volunteer?.phone || 'N/A',
              college: volunteer?.college || 'N/A',
              department: volunteer?.department || 'N/A',
              year: volunteer?.year || 'N/A',
              universityRollNo: volunteer?.universityRollNo || 'N/A',
              profilePicture: volunteer?.profilePicture || '/default-avatar.svg',
              nssApplicationStatus: volunteer?.nssApplicationStatus || 'pending'
            },
            role: role,
            registrationDate: vol.registrationDate,
            attended: vol.attended || false,
            attendanceDate: vol.attendanceDate,
            participantType: 'nss_volunteer'
          };
        })
      );
    }
    
    // Add external participants
    allParticipants = [
      ...allParticipants,
      ...(populatedEvent.externalParticipants || []).map(ext => ({
        _id: ext._id, // Add the external participant ID
        volunteer: {
          _id: ext._id, // Add the external participant ID
          name: ext.name,
          email: ext.email,
          phone: ext.phone,
          college: ext.role === 'Student' ? ext.course : 'Staff',
          department: ext.role === 'Student' ? ext.course : 'Staff',
          year: ext.year || 'N/A',
          universityRollNo: ext.universityId || 'N/A',
          profilePicture: '/default-avatar.svg',
          nssApplicationStatus: 'external'
        },
        role: ext.role || 'Participant',
        registrationDate: ext.registrationDate,
        attended: ext.attended,
        attendanceDate: ext.attendanceDate,
        participantType: 'external'
      }))
    ];
    

    res.json({
      success: true,
      participants: allParticipants,
      eventTitle: populatedEvent.title,
      maxParticipants: populatedEvent.maxParticipants
    });

  } catch (error) {
    console.error('💥 Error fetching participants:', error);
    console.error('💥 Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching participants',
      error: error.message
    });
  }
});

// Test endpoint to check if API is working
// External registration endpoint
router.post('/:id/external-register', async (req, res) => {
  try {
    const { name, email, phone, role, universityId, course, year, age, bloodGroup } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !role || !age || !bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }
    
    // Validate academic fields for students only
    if (role === 'Student') {
      if (!course || !year) {
        return res.status(400).json({
          success: false,
          message: 'Course and year are required for students'
        });
      }
      if (!universityId) {
        return res.status(400).json({
          success: false,
          message: 'University ID is required for students'
        });
      }
    }
    
    // Find the event
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if event allows external registration
    if (event.registrationType !== 'public') {
      return res.status(403).json({
        success: false,
        message: 'This event does not allow external registration'
      });
    }
    
    // Check if event is full
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }
    
    // Check if email already registered
    const existingParticipant = event.externalParticipants.find(
      p => p.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered for this event'
      });
    }
    
    // Add external participant
    event.externalParticipants.push({
      name,
      email,
      phone,
      role,
      universityId: universityId || null,
      course: role === 'Student' ? course : 'N/A',
      year: role === 'Student' ? parseInt(year) : null,
      age: parseInt(age),
      bloodGroup,
      registrationDate: new Date()
    });
    
    // Update participant count
    event.currentParticipants += 1;
    
    await event.save();
    
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      participant: {
        name,
        email,
        phone,
        role,
        universityId: universityId || null,
        course,
        year,
        age,
        bloodGroup
      }
    });
    
  } catch (error) {
    console.error('External registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});


// Simple attendance update endpoint (no auth required for testing)
router.put('/:id/simple-attendance', async (req, res) => {
  try {
    const { volunteerId, attended } = req.body;
    
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Find and update NSS volunteer
    const volunteerIndex = event.registeredVolunteers.findIndex(
      vol => vol._id.toString() === volunteerId
    );
    
    if (volunteerIndex !== -1) {
      event.registeredVolunteers[volunteerIndex].attended = attended;
      event.registeredVolunteers[volunteerIndex].attendanceDate = attended ? new Date() : null;
    } else {
      // Find and update external participant
      const externalIndex = event.externalParticipants.findIndex(
        ext => ext._id.toString() === volunteerId
      );
      
      if (externalIndex !== -1) {
        event.externalParticipants[externalIndex].attended = attended;
        event.externalParticipants[externalIndex].attendanceDate = attended ? new Date() : null;
      } else {
        return res.status(404).json({ success: false, message: 'Participant not found' });
      }
    }

    await event.save();
    res.json({ success: true, message: 'Attendance updated successfully' });

  } catch (error) {
    console.error('Simple attendance update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Events API is working!' });
});

module.exports = router;
