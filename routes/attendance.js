const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');
const logger = require('../utils/logger');

// Get attendance for a specific event
router.get('/event/:eventId', [auth, admin], async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId)
      .populate({
        path: 'registeredVolunteers.volunteer',
        select: 'name email phone rollNumber'
      })
      .populate('attendance.volunteer', 'name email phone rollNumber');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      event: {
        _id: event._id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location
      },
      registeredVolunteers: event.registeredVolunteers || [],
      attendance: event.attendance || []
    });
  } catch (error) {
    logger.error('Error fetching attendance', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Mark attendance for volunteers
router.post('/event/:eventId/mark', [auth, admin], async (req, res) => {
  try {
    const { eventId } = req.params;
    const { attendanceData } = req.body; // Array of { volunteerId, status, remarks }


    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is in the future - prevent attendance marking for future events
    const eventDate = new Date(event.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    if (eventDate > today) {
      return res.status(400).json({ 
        message: 'Cannot mark attendance for future events. Attendance can only be marked on or after the event date.',
        eventDate: event.startDate,
        currentDate: today.toISOString().split('T')[0]
      });
    }


    // Initialize attendance array if it doesn't exist
    if (!event.attendance) {
      event.attendance = [];
    }

    // Update or add attendance records
    for (const record of attendanceData) {
      const { volunteerId, status, remarks } = record;
      
      
      // Check if attendance already exists for this volunteer
      const existingIndex = event.attendance.findIndex(
        a => a.volunteer.toString() === volunteerId
      );

      const attendanceRecord = {
        volunteer: volunteerId,
        status, // 'present', 'absent', 'late', 'excused'
        remarks: remarks || '',
        markedBy: req.user.id,
        markedAt: new Date()
      };

      if (existingIndex >= 0) {
        // Update existing record
        event.attendance[existingIndex] = attendanceRecord;
      } else {
        // Add new record
        event.attendance.push(attendanceRecord);
      }
    }


    await event.save();


    // Populate volunteer details for response
    await event.populate('attendance.volunteer', 'name email phone rollNumber');

    res.json({
      message: 'Attendance marked successfully',
      attendance: event.attendance
    });
  } catch (error) {
    logger.error('Error marking attendance', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while marking attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get attendance history for a volunteer
router.get('/volunteer/:volunteerId', auth, async (req, res) => {
  try {
    const { volunteerId } = req.params;
    
    // Check if user is requesting their own data or is admin
    if (req.user.role !== 'admin' && req.user.id !== volunteerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get only completed events where this volunteer has attendance marked
    const events = await Event.find({
      status: 'Completed',
      'attendance.volunteer': volunteerId
    })
    .select('title startDate endDate startTime endTime location attendance registeredVolunteers')
    .populate('attendance.volunteer', 'name email phone rollNumber')
    .populate('registeredVolunteers.volunteer', 'name email phone rollNumber');

    const attendanceHistory = events.map(event => {
      const volunteerAttendance = event.attendance.find(
        a => a.volunteer._id.toString() === volunteerId
      );
      
      return {
        eventId: event._id,
        eventTitle: event.title,
        eventDate: event.startDate,
        eventTime: `${event.startTime} - ${event.endTime}`,
        location: event.location,
        status: volunteerAttendance.status,
        remarks: volunteerAttendance.remarks || '',
        markedAt: volunteerAttendance.markedAt
      };
    });

    res.json(attendanceHistory);
  } catch (error) {
    logger.error('Error fetching attendance history', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching attendance history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get attendance statistics for admin dashboard
router.get('/stats', [auth, admin], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
      };
    }

    const events = await Event.find(dateFilter)
      .populate('attendance.volunteer', 'name email phone rollNumber');

    const stats = {
      totalEvents: events.length,
      totalAttendanceRecords: 0,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      excusedCount: 0,
      attendanceByEvent: []
    };

    events.forEach(event => {
      const eventStats = {
        eventId: event._id,
        eventTitle: event.title,
        eventDate: event.startDate,
        totalRegistered: event.registeredVolunteers ? event.registeredVolunteers.length : 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        notMarked: 0
      };

      if (event.attendance) {
        event.attendance.forEach(record => {
          stats.totalAttendanceRecords++;
          eventStats[record.status]++;
          stats[`${record.status}Count`]++;
        });
      }

      // Count not marked attendance
      const registeredCount = event.registeredVolunteers ? event.registeredVolunteers.length : 0;
      const markedCount = event.attendance ? event.attendance.length : 0;
      eventStats.notMarked = registeredCount - markedCount;

      stats.attendanceByEvent.push(eventStats);
    });

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching attendance stats', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching attendance stats',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Export attendance report for an event
router.get('/event/:eventId/export', [auth, admin], async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId)
      .populate('registeredVolunteers.volunteer', 'name email phone rollNumber')
      .populate('attendance.volunteer', 'name email phone rollNumber');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Get all approved NSS volunteers
    const allVolunteers = await User.find({
      role: 'volunteer',
      nssApplicationStatus: 'approved'
    }).select('name email phone rollNumber');

    const report = {
      eventDetails: {
        title: event.title,
        date: event.startDate,
        time: `${event.startTime} - ${event.endTime}`,
        location: event.location,
        totalVolunteers: allVolunteers.length
      },
      attendance: []
    };

    // Create attendance records for all approved NSS volunteers
    allVolunteers.forEach(volunteer => {
      const attendanceRecord = event.attendance ? 
        event.attendance.find(a => a.volunteer._id.toString() === volunteer._id.toString()) : null;

      report.attendance.push({
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.phone,
        rollNumber: volunteer.rollNumber,
        status: attendanceRecord ? attendanceRecord.status : 'not-marked',
        remarks: attendanceRecord ? attendanceRecord.remarks : '',
        markedAt: attendanceRecord ? attendanceRecord.markedAt : null
      });
    });

    res.json(report);
  } catch (error) {
    logger.error('Error exporting attendance report', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while exporting attendance report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
