const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Event = require('../models/Event');
const Gallery = require('../models/Gallery');
const Announcement = require('../models/Announcement');
const Feedback = require('../models/Feedback');
const { auth, admin } = require('../middleware/auth');
const logger = require('../utils/logger');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/profile-pictures');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for admin gallery image uploads
const galleryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/gallery';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const profileUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const galleryUpload = multer({
  storage: galleryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});


// @route   GET /api/admin/gallery
// @desc    Get all gallery items for admin management
// @access  Private (Admin only)
router.get('/gallery', async (req, res) => {
  try {
    const { search, status, category } = req.query;
    
    // Build filter object
    let filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      if (status === 'pending') {
        filter.isApproved = false;
      } else if (status === 'approved') {
        filter.isApproved = true;
      } else if (status === 'rejected') {
        filter.isRejected = true;
      }
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    const galleryItems = await Gallery.find(filter)
      .populate('uploadedBy', 'name email')
      .populate('event', 'title')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      gallery: galleryItems
    });
  } catch (error) {
    console.error('❌ [ADMIN GALLERY] Error fetching gallery items:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching gallery items'
    });
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for gallery images
  }
});


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
    const totalEvents = await Event.countDocuments({ 
      status: 'Completed'
    });
    const upcomingEvents = await Event.countDocuments({ 
      status: 'Upcoming'
    });
    
    // Debug logging for events
    console.log('🔍 [DASHBOARD] Total events query:', { status: 'Completed' });
    console.log('🔍 [DASHBOARD] Upcoming events query:', { status: 'Upcoming' });
    console.log('📊 [DASHBOARD] Total events count (completed):', totalEvents);
    console.log('📊 [DASHBOARD] Upcoming events count:', upcomingEvents);
    
    // Also get actual events for debugging
    const actualEvents = await Event.find().select('_id title status startDate endDate');
    console.log('📋 [DASHBOARD] Actual events:', actualEvents);
    const pendingGalleryApprovals = await Gallery.countDocuments({ isApproved: false });
    const totalGalleryItems = await Gallery.countDocuments({ isApproved: true });
    const pendingFeedbackApprovals = await Feedback.countDocuments({ isApproved: false });
    
    // Debug logging for gallery approvals
    console.log('🔍 [DASHBOARD] Gallery count query (approved):', { isApproved: true });
    console.log('🔍 [DASHBOARD] Gallery count query (pending):', { isApproved: false });
    console.log('📊 [DASHBOARD] Total gallery items count (approved):', totalGalleryItems);
    console.log('📊 [DASHBOARD] Pending gallery approvals count:', pendingGalleryApprovals);
    
    // Also get actual pending items for debugging
    const actualPendingItems = await Gallery.find({ isApproved: false }).select('_id title isApproved createdAt');
    console.log('📋 [DASHBOARD] Actual pending gallery items:', actualPendingItems);
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
        totalGalleryItems,
        pendingFeedbackApprovals,
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

// @route   GET /api/admin/activities
// @desc    Get recent admin activities
// @access  Private (Admin only)
router.get('/activities', [auth, admin], async (req, res) => {
  try {
    console.log('🔍 [ADMIN ACTIVITIES] Fetching recent activities...');
    
    const activities = [];
    
    // Get recent volunteer approvals
    const recentApprovals = await User.find({ 
      role: 'volunteer', 
      nssApplicationStatus: 'approved' 
    })
    .sort({ updatedAt: -1 })
    .limit(3)
    .select('name email updatedAt');
    
    recentApprovals.forEach(volunteer => {
      activities.push({
        id: `approval_${volunteer._id}`,
        type: 'volunteer_approval',
        title: 'Volunteer Approved',
        description: `${volunteer.name} was approved for NSS`,
        timestamp: volunteer.updatedAt,
        user: volunteer.name,
        admin: 'Admin'
      });
    });
    
    // Get recent event creations
    const recentEvents = await Event.find()
    .sort({ createdAt: -1 })
    .limit(3)
    .select('title createdAt createdBy')
    .populate('createdBy', 'name');
    
    recentEvents.forEach(event => {
      activities.push({
        id: `event_${event._id}`,
        type: 'event_created',
        title: 'Event Created',
        description: `New event: ${event.title}`,
        timestamp: event.createdAt,
        user: event.createdBy?.name || 'Admin',
        admin: event.createdBy?.name || 'Admin'
      });
    });
    
    // Get recent gallery approvals
    const recentGalleryApprovals = await Gallery.find({ isApproved: true })
    .sort({ approvedAt: -1 })
    .limit(3)
    .select('title approvedAt approvedBy uploadedBy')
    .populate('approvedBy', 'name')
    .populate('uploadedBy', 'name');
    
    recentGalleryApprovals.forEach(gallery => {
      activities.push({
        id: `gallery_${gallery._id}`,
        type: 'gallery_approved',
        title: 'Gallery Item Approved',
        description: `Approved: ${gallery.title}`,
        timestamp: gallery.approvedAt,
        user: gallery.uploadedBy?.name || 'Unknown',
        admin: gallery.approvedBy?.name || 'Admin'
      });
    });
    
    // Get recent feedback approvals
    const recentFeedbackApprovals = await Feedback.find({ isApproved: true })
    .sort({ approvedAt: -1 })
    .limit(3)
    .select('name approvedAt approvedBy submittedBy')
    .populate('approvedBy', 'name')
    .populate('submittedBy', 'name');
    
    recentFeedbackApprovals.forEach(feedback => {
      activities.push({
        id: `feedback_${feedback._id}`,
        type: 'feedback_approved',
        title: 'Feedback Approved',
        description: `Approved: ${feedback.name}`,
        timestamp: feedback.approvedAt,
        user: feedback.submittedBy?.name || 'Unknown',
        admin: feedback.approvedBy?.name || 'Admin'
      });
    });
    
    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Return top 10 most recent activities
    const recentActivities = activities.slice(0, 10);
    
    console.log('📊 [ADMIN ACTIVITIES] Found activities:', recentActivities.length);
    
    res.json({
      success: true,
      activities: recentActivities
    });
  } catch (error) {
    console.error('❌ [ADMIN ACTIVITIES] Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activities'
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
    console.log('🔍 [ADMIN GALLERY] Fetching pending gallery items...');
    
    const pendingImages = await Gallery.find({ isApproved: false })
      .populate('uploadedBy', 'name email')
      .populate('event', 'title')
      .sort({ createdAt: -1 });

    console.log('📊 [ADMIN GALLERY] Found pending images:', pendingImages.length);
    console.log('📋 [ADMIN GALLERY] Pending images data:', pendingImages);

    res.json({
      success: true,
      pendingImages
    });
  } catch (error) {
    console.error('❌ [ADMIN GALLERY] Get pending gallery error:', error);
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


// @route   PUT /api/admin/gallery/:id
// @desc    Update gallery item (Admin can edit any item)
// @access  Private (Admin only)
router.put('/gallery/:id', [
  auth,
  admin,
  galleryUpload.single('image'),
  body('title', 'Image title is required').not().isEmpty(),
  body('category', 'Category is required').isIn([
    'Plantation Drive',
    'Cleanliness Drive',
    'Blood Donation Camp',
    'Awareness Drive',
    'Health Camp',
    'Education Support',
    'Disaster Relief',
    'Community Service',
    'Other'
  ])
], async (req, res) => {
  try {
    console.log('🔄 [ADMIN GALLERY UPDATE] Admin gallery update route hit!');
    console.log('🔄 [ADMIN GALLERY UPDATE] User role:', req.user?.role);
    console.log('🔄 [ADMIN GALLERY UPDATE] Gallery ID:', req.params.id);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ [ADMIN GALLERY UPDATE] Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const galleryItem = await Gallery.findById(req.params.id);
    
    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    const { title, description, category, event } = req.body;

    // Update fields
    galleryItem.title = title;
    galleryItem.description = description || '';
    galleryItem.category = category;
    if (event) {
      galleryItem.event = event;
    }

    // Handle new image upload if provided
    if (req.file) {
      // Delete old image if exists
      if (galleryItem.imagePath) {
        const oldImagePath = path.join(__dirname, '..', galleryItem.imagePath);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      galleryItem.imagePath = `/uploads/gallery/${req.file.filename}`;
    }

    await galleryItem.save();

    res.json({
      success: true,
      message: 'Gallery item updated successfully',
      galleryItem
    });
  } catch (error) {
    console.error('Error updating gallery item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating gallery item'
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
    const { 
      name, 
      phone
    } = req.body;
    
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
router.put('/profile-picture', [auth, admin, profileUpload.single('profilePicture')], async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Delete old profile picture if exists
    if (adminUser.profilePicture && adminUser.profilePicture.includes('profile-')) {
      const oldImagePath = path.join(__dirname, '../uploads/profile-pictures', path.basename(adminUser.profilePicture));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update profile picture with new file path
    const imageUrl = `/uploads/profile-pictures/${req.file.filename}`;
    adminUser.profilePicture = imageUrl;
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

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/stats', [auth, admin], async (req, res) => {
  try {
    // Get total volunteers
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    
    // Get total events
    const totalEvents = await Event.countDocuments();
    
    // Get total gallery items
    const totalGalleryItems = await Gallery.countDocuments();
    
    // Get pending approvals (volunteer applications + gallery items)
    const pendingVolunteerApprovals = await User.countDocuments({ 
      role: 'volunteer', 
      nssApplicationStatus: 'pending' 
    });
    
    const pendingGalleryApprovals = await Gallery.countDocuments({ 
      isApproved: false, 
      isRejected: false 
    });
    
    const pendingApprovals = pendingVolunteerApprovals + pendingGalleryApprovals;
    
    // Get recent activities count (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentEvents = await Event.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });
    
    const recentGalleryItems = await Gallery.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });

    res.json({
      success: true,
      stats: {
        totalVolunteers,
        totalEvents,
        totalGalleryItems,
        pendingApprovals,
        recentEvents,
        recentGalleryItems
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

// @route   GET /api/admin/recent-activities
// @desc    Get recent admin activities
// @access  Private (Admin only)
router.get('/recent-activities', [auth, admin], async (req, res) => {
  try {
    const activities = [];
    
    // Get recent events created by admin
    const recentEvents = await Event.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt');
    
    recentEvents.forEach(event => {
      activities.push({
        type: 'event',
        description: `Created event: ${event.title}`,
        timestamp: event.createdAt
      });
    });
    
    // Get recent gallery approvals
    const recentGalleryApprovals = await Gallery.find({ approvedBy: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('uploadedBy', 'name')
      .select('title uploadedBy updatedAt isApproved');
    
    recentGalleryApprovals.forEach(gallery => {
      const status = gallery.isApproved ? 'approved' : 'rejected';
      activities.push({
        type: 'gallery',
        description: `${status} gallery item: ${gallery.title} by ${gallery.uploadedBy.name}`,
        timestamp: gallery.updatedAt
      });
    });
    
    // Get recent volunteer approvals
    const recentVolunteerApprovals = await User.find({ 
      approvedBy: req.user.id,
      role: 'volunteer'
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('name nssApplicationStatus updatedAt');
    
    recentVolunteerApprovals.forEach(volunteer => {
      const status = volunteer.nssApplicationStatus;
      activities.push({
        type: 'volunteer',
        description: `${status} volunteer application: ${volunteer.name}`,
        timestamp: volunteer.updatedAt
      });
    });
    
    // Sort all activities by timestamp and return latest 10
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      success: true,
      activities: activities.slice(0, 10)
    });

  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent activities'
    });
  }
});

// @route   GET /api/admin/feedback/pending
// @desc    Get pending feedback approvals
// @access  Private (Admin only)
router.get('/feedback/pending', [auth, admin], async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    
    // Status filter
    if (status === 'pending') {
      filter.isApproved = false;
    } else if (status === 'approved') {
      filter.isApproved = true;
    }
    
    // Search filter
    if (search && search.trim()) {
      filter.$or = [
        { name: new RegExp(search.trim(), 'i') },
        { role: new RegExp(search.trim(), 'i') },
        { department: new RegExp(search.trim(), 'i') },
        { testimonial: new RegExp(search.trim(), 'i') }
      ];
    }

    const feedback = await Feedback.find(filter)
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Feedback.countDocuments(filter);

    res.json({
      success: true,
      feedback,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get pending feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending feedback'
    });
  }
});

// @route   PUT /api/admin/feedback/:id/approve
// @desc    Approve a feedback
// @access  Private (Admin only)
router.put('/feedback/:id/approve', [auth, admin], async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    feedback.isApproved = true;
    feedback.approvedBy = req.user.id;
    feedback.approvedAt = new Date();
    
    await feedback.save();

    res.json({
      success: true,
      message: 'Feedback approved successfully!'
    });
  } catch (error) {
    console.error('Approve feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving feedback'
    });
  }
});

// @route   DELETE /api/admin/feedback/:id
// @desc    Reject/Delete a feedback
// @access  Private (Admin only)
router.delete('/feedback/:id', [auth, admin], async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Feedback rejected and deleted successfully!'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting feedback'
    });
  }
});

module.exports = router;
