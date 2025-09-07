const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Event = require('../models/Event');
const Gallery = require('../models/Gallery');
const Announcement = require('../models/Announcement');
const { auth, admin } = require('../middleware/auth');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin only)
router.get('/dashboard', [auth, admin], async (req, res) => {
  try {
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    const pendingNSSApprovals = await User.countDocuments({ 
      role: 'volunteer', 
      hasAppliedToNSS: true,
      nssApplicationStatus: 'pending'
    });
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({ 
      status: 'Upcoming'
    });
    const pendingGalleryApprovals = await Gallery.countDocuments({ isApproved: false });
    const totalAnnouncements = await Announcement.countDocuments({ isActive: true });

    // Recent activities
    const recentVolunteers = await User.find({ role: 'volunteer' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title eventType startDate status');

    res.json({
      success: true,
      stats: {
        totalVolunteers,
        pendingApprovals: pendingNSSApprovals,
        totalEvents,
        upcomingEvents,
        pendingGalleryApprovals,
        totalAnnouncements
      },
      recentVolunteers,
      recentEvents
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats'
    });
  }
});

// @route   GET /api/admin/volunteers
// @desc    Get all volunteers with filters
// @access  Private (Admin only)
router.get('/volunteers', [auth, admin], async (req, res) => {
  try {
    const { search, status, college, department, year, skills, page = 1, limit = 20 } = req.query;
    
    console.log('🔍 Admin volunteers request:', { search, status, college, department, page, limit, year, skills });

    // Build the filter object
    const filter = { role: 'volunteer', hasAppliedToNSS: true };
    
    // Search by name or email
    if (search && search.trim()) {
      filter.$or = [
        { name: new RegExp(search.trim(), 'i') },
        { email: new RegExp(search.trim(), 'i') }
      ];
    }
    
    // Status filter
    if (status && status !== 'all') {
      filter.nssApplicationStatus = status;
    }
    
    // College filter - only apply if not 'all'
    if (college && college !== 'all') {
      filter['nssApplicationData.college'] = new RegExp(college, 'i');
    }
    
    // Department filter - only apply if not 'all'
    if (department && department !== 'all') {
      filter['nssApplicationData.department'] = new RegExp(department, 'i');
    }

    // Year filter - only apply if not 'all'
    if (year && year !== 'all') {
      const yearValue = parseInt(year);
      if (!isNaN(yearValue)) {
        filter['nssApplicationData.year'] = yearValue;
      }
    }

    // Skills filter - only apply if skills is provided and not 'all'
    if (skills && skills !== 'all' && skills !== 'undefined') {
      let skillsArray = [];
      
      if (typeof skills === 'string') {
        // If it's a string, split by comma or treat as single skill
        skillsArray = skills.includes(',') ? skills.split(',').map(s => s.trim()) : [skills.trim()];
      } else if (Array.isArray(skills)) {
        skillsArray = skills;
      }
      
      if (skillsArray.length > 0) {
        filter['nssApplicationData.skills'] = { $in: skillsArray };
      }
    }
    
    console.log('🔍 Final filter before query:', JSON.stringify(filter, null, 2));
    
    const volunteers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(filter);

    console.log(`📊 Found ${volunteers.length} volunteers out of ${total} total`);
    console.log('🔍 MongoDB query result count:', volunteers.length);
    if (volunteers.length > 0) {
      console.log('📋 First volunteer:', {
        name: volunteers[0].name,
        email: volunteers[0].email,
        hasAppliedToNSS: volunteers[0].hasAppliedToNSS,
        nssApplicationStatus: volunteers[0].nssApplicationStatus,
        skills: volunteers[0].nssApplicationData?.skills || 'No skills found'
      });
      
      // Show skills data for all volunteers found
      console.log('🔍 Skills data for found volunteers:');
      volunteers.forEach((v, index) => {
        const nssSkills = v.nssApplicationData?.skills || [];
        const nssYear = v.nssApplicationData?.year || 'No NSS year';
        console.log(`  ${index + 1}. ${v.name}: nss_skills=${JSON.stringify(nssSkills)}, nss_year=${nssYear}`);
      });
      
      // Show the actual filter that was applied
      console.log('🔍 Filter that was actually applied:');
      console.log('  - Year filter:', year);
      console.log('  - Skills filter:', skills);
      console.log('  - Final filter:', JSON.stringify(filter, null, 2));
    }

    // Disable caching for this route
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      success: true,
      volunteers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get volunteers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching volunteers'
    });
  }
});

// @route   PUT /api/admin/volunteers/:id/approve-nss
// @desc    Approve a volunteer's NSS application
// @access  Private (Admin only)
router.put('/volunteers/:id/approve-nss', [auth, admin], async (req, res) => {
  try {
    const volunteer = await User.findById(req.params.id);
    
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    if (volunteer.role !== 'volunteer') {
      return res.status(400).json({
        success: false,
        message: 'User is not a volunteer'
      });
    }

    if (!volunteer.hasAppliedToNSS) {
      return res.status(400).json({
        success: false,
        message: 'Volunteer has not applied to NSS yet'
      });
    }

    volunteer.nssApplicationStatus = 'approved';
    await volunteer.save();

    res.json({
      success: true,
      message: 'NSS application approved successfully!'
    });
  } catch (error) {
    console.error('Approve NSS application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving NSS application'
    });
  }
});

// @route   PUT /api/admin/volunteers/:id/reject-nss
// @desc    Reject a volunteer's NSS application
// @access  Private (Admin only)
router.put('/volunteers/:id/reject-nss', [auth, admin], async (req, res) => {
  try {
    const volunteer = await User.findById(req.params.id);
    
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    if (volunteer.role !== 'volunteer') {
      return res.status(400).json({
        success: false,
        message: 'User is not a volunteer'
      });
    }

    if (!volunteer.hasAppliedToNSS) {
      return res.status(400).json({
        success: false,
        message: 'Volunteer has not applied to NSS yet'
      });
    }

    volunteer.nssApplicationStatus = 'rejected';
    await volunteer.save();

    res.json({
      success: true,
      message: 'NSS application rejected. Volunteer can login and reapply with updated information.'
    });
  } catch (error) {
    console.error('Reject NSS application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting NSS application'
    });
  }
});

// @route   PUT /api/admin/volunteers/:id/deactivate
// @desc    Deactivate a volunteer
// @access  Private (Admin only)
router.put('/volunteers/:id/deactivate', [auth, admin], async (req, res) => {
  try {
    const volunteer = await User.findById(req.params.id);
    
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    volunteer.isActive = false;
    await volunteer.save();

    res.json({
      success: true,
      message: 'Volunteer deactivated successfully!'
    });
  } catch (error) {
    console.error('Deactivate volunteer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deactivating volunteer'
    });
  }
});

// @route   PUT /api/admin/volunteers/:id/activate
// @desc    Activate a volunteer
// @access  Private (Admin only)
router.put('/volunteers/:id/activate', [auth, admin], async (req, res) => {
  try {
    const volunteer = await User.findById(req.params.id);
    
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    volunteer.isActive = true;
    await volunteer.save();

    res.json({
      success: true,
      message: 'Volunteer activated successfully!'
    });
  } catch (error) {
    console.error('Activate volunteer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while activating volunteer'
    });
  }
});

// @route   GET /api/admin/volunteers/:id
// @desc    Get volunteer details
// @access  Private (Admin only)
router.get('/volunteers/:id', [auth, admin], async (req, res) => {
  try {
    const volunteer = await User.findById(req.params.id)
      .select('-password')
      .populate('eventsAttended', 'title date category');

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    res.json({
      success: true,
      volunteer
    });
  } catch (error) {
    console.error('Get volunteer details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching volunteer details'
    });
  }
});

// @route   GET /api/admin/gallery/pending
// @desc    Get pending gallery approvals
// @access  Private (Admin only)
router.get('/gallery/pending', [auth, admin], async (req, res) => {
  try {
    const pendingImages = await Gallery.find({ isApproved: false })
      .populate('uploadedBy', 'name email')
      .populate('event', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      pendingImages
    });
  } catch (error) {
    console.error('Get pending gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending gallery items'
    });
  }
});

// @route   PUT /api/admin/gallery/:id/approve
// @desc    Approve a gallery image
// @access  Private (Admin only)
router.put('/gallery/:id/approve', [auth, admin], async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    
    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    galleryItem.isApproved = true;
    galleryItem.approvedBy = req.user.id;
    galleryItem.approvedAt = new Date();
    
    await galleryItem.save();

    res.json({
      success: true,
      message: 'Gallery item approved successfully!'
    });
  } catch (error) {
    console.error('Approve gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving gallery item'
    });
  }
});

// @route   DELETE /api/admin/gallery/:id
// @desc    Reject/Delete a gallery image
// @access  Private (Admin only)
router.delete('/gallery/:id', [auth, admin], async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    
    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    await Gallery.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Gallery item rejected and deleted successfully!'
    });
  } catch (error) {
    console.error('Delete gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting gallery item'
    });
  }
});

// @route   GET /api/admin/reports/volunteer-participation
// @desc    Get volunteer participation report
// @access  Private (Admin only)
router.get('/reports/volunteer-participation', [auth, admin], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const volunteers = await User.find({ 
      role: 'volunteer', 
      hasAppliedToNSS: true,
      nssApplicationStatus: 'approved',
      ...filter
    })
    .select('name email totalHours eventsAttended')
    .populate('eventsAttended', 'title date category');

    const totalHours = volunteers.reduce((sum, v) => sum + v.totalHours, 0);
    const totalEvents = volunteers.reduce((sum, v) => sum + v.eventsAttended.length, 0);

    res.json({
      success: true,
      report: {
        totalVolunteers: volunteers.length,
        totalHours,
        totalEvents,
        averageHoursPerVolunteer: volunteers.length > 0 ? totalHours / volunteers.length : 0,
        volunteers
      }
    });
  } catch (error) {
    console.error('Volunteer participation report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating report'
    });
  }
});

// @route   GET /api/admin/profile
// @desc    Get admin profile
// @access  Private (Admin only)
router.get('/profile', [auth, admin], async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id).select('-password');
    
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    res.json({
      success: true,
      user: adminUser
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/admin/profile
// @desc    Update admin profile
// @access  Private (Admin only)
router.put('/profile', [auth, admin], async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Find admin user
    const adminUser = await User.findById(req.user.id);
    
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Update fields
    if (name) adminUser.name = name;
    if (email) adminUser.email = email;
    if (phone) adminUser.phone = phone;

    await adminUser.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        phone: adminUser.phone,
        profilePicture: adminUser.profilePicture,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   PUT /api/admin/profile-picture
// @desc    Update admin profile picture
// @access  Private (Admin only)
router.put('/profile-picture', [auth, admin], async (req, res) => {
  try {
    // This would need multer middleware for file uploads
    // For now, we'll just update the profilePicture field
    const { profilePicture } = req.body;
    
    const adminUser = await User.findById(req.user.id);
    
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Update profile picture
    adminUser.profilePicture = profilePicture;
    await adminUser.save();

    res.json({
      success: true,
      message: 'Profile picture updated successfully!',
      profilePicture: adminUser.profilePicture
    });
  } catch (error) {
    console.error('Update admin profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile picture'
    });
  }
});

module.exports = router;
