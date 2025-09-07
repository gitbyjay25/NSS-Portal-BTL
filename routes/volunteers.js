const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const User = require('../models/User');
const Event = require('../models/Event');
const { auth, volunteer } = require('../middleware/auth');
const { admin } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/profile-pictures';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
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
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @route   GET /api/volunteers
// @desc    Get all volunteers (Admin only)
// @access  Private (Admin only)
router.get('/', [auth, admin], async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' })
      .select('name email phone rollNumber nssApplicationStatus')
      .sort({ name: 1 });

    res.json(volunteers);
  } catch (error) {
    console.error('Get volunteers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching volunteers'
    });
  }
});

// @route   GET /api/volunteers/profile
// @desc    Get current volunteer profile
// @access  Private (Volunteer only)
router.get('/profile', [auth, volunteer], async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('eventsAttended', 'title date category status');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/volunteers/profile
// @desc    Update volunteer profile
// @access  Private (Volunteer only)
router.put('/profile', [
  auth,
  volunteer,
  body('name', 'Name is required').not().isEmpty(),
  body('phone', 'Please enter a valid 10-digit phone number').isLength({ min: 10, max: 10 }),
  body('college', 'College name is required').not().isEmpty(),
  body('department', 'Department is required').not().isEmpty(),
  body('year', 'Year must be between 1 and 4').isInt({ min: 1, max: 4 }),
  body('universityRollNo', 'University Roll Number is required').not().isEmpty(),
  body('bloodGroup', 'Blood group is required').not().isEmpty(),
  body('fatherName', 'Father\'s name is required').not().isEmpty(),
  body('motherName', 'Mother\'s name is required').not().isEmpty(),
  body('address', 'Address is required').not().isEmpty(),
  body('pinCode', 'PIN code is required').not().isEmpty(),
  body('pinCode', 'PIN code must be exactly 6 digits').isLength({ min: 6, max: 6 }),
  body('state', 'State is required').not().isEmpty(),
  body('district', 'District is required').not().isEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { 
      name, 
      phone, 
      college, 
      department, 
      year, 
      universityRollNo,
      bloodGroup,
      fatherName,
      motherName,
      address,
      pinCode,
      state,
      district,
      skills 
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone,
        college,
        department,
        year,
        universityRollNo,
        bloodGroup,
        fatherName,
        motherName,
        address,
        pinCode,
        state,
        district,
        skills: skills || []
      },
      { new: true, runValidators: true }
    ).select('-password');

    console.log('✅ Profile update successful - Full user object:', JSON.stringify(updatedUser, null, 2));
    console.log('✅ Profile update successful - Specific fields:', {
      id: updatedUser._id,
      name: updatedUser.name,
      pinCode: updatedUser.pinCode,
      state: updatedUser.state,
      district: updatedUser.district
    });

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   PUT /api/volunteers/profile-picture
// @desc    Update profile picture
// @access  Private (Volunteer only)
router.put('/profile-picture', [
  auth,
  volunteer,
  upload.single('profilePicture')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    // Get the file path
    const profilePicturePath = `/uploads/profile-pictures/${req.file.filename}`;

    // Delete old profile picture if exists
    const user = await User.findById(req.user.id);
    if (user.profilePicture && user.profilePicture.startsWith('/uploads/profile-pictures/')) {
      const oldFilePath = path.join(__dirname, '..', user.profilePicture);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: profilePicturePath },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile picture updated successfully!',
      profilePicture: profilePicturePath,
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile picture'
    });
  }
});

// @route   GET /api/volunteers/events/upcoming
// @desc    Get upcoming events for volunteer
// @access  Private (Volunteer only)
router.get('/events/upcoming', [auth, volunteer], async (req, res) => {
  try {
    const events = await Event.find({
      status: 'Upcoming'
    })
    .populate('createdBy', 'name')
    .sort({ startDate: 1 })
    .limit(10)
    .exec();

    res.json(events);
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching upcoming events'
    });
  }
});

// @route   GET /api/volunteers/events/past
// @desc    Get past events attended by volunteer
// @access  Private (Volunteer only)
router.get('/events/past', [auth, volunteer], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const events = await Event.find({
      'registeredVolunteers.volunteer': req.user.id,
      status: { $in: ['completed', 'cancelled'] },
      isActive: true
    })
    .populate('createdBy', 'name')
    .sort({ date: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

    const total = await Event.countDocuments({
      'registeredVolunteers.volunteer': req.user.id,
      status: { $in: ['completed', 'cancelled'] },
      isActive: true
    });

    res.json({
      success: true,
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get past events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching past events'
    });
  }
});

// @route   GET /api/volunteers/events/registered
// @desc    Get events registered by volunteer
// @access  Private (Volunteer only)
router.get('/events/registered', [auth, volunteer], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const events = await Event.find({
      'registeredVolunteers.volunteer': req.user.id,
      isActive: true
    })
    .populate('createdBy', 'name')
    .sort({ date: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

    const total = await Event.countDocuments({
      'registeredVolunteers.volunteer': req.user.id,
      isActive: true
    });

    res.json({
      success: true,
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get registered events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching registered events'
    });
  }
});

// @route   GET /api/volunteers/achievements
// @desc    Get volunteer achievements
// @access  Private (Volunteer only)
router.get('/achievements', [auth, volunteer], async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('achievements');

    res.json({
      success: true,
      achievements: user.achievements
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievements'
    });
  }
});

// @route   GET /api/volunteers/search
// @desc    Search volunteers (public)
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { name, college, department, skills, page = 1, limit = 20 } = req.query;
    
    const filter = { 
      role: 'volunteer', 
      isApproved: true, 
      isActive: true 
    };
    
    if (name) filter.name = new RegExp(name, 'i');
    if (college) filter.college = new RegExp(college, 'i');
    if (department) filter.department = new RegExp(department, 'i');
    if (skills) {
      filter.skills = { $in: skills.split(',').map(s => s.trim()) };
    }

    const volunteers = await User.find(filter)
      .select('name college department year skills totalHours profilePicture')
      .sort({ totalHours: -1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      volunteers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Search volunteers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching volunteers'
    });
  }
});

// @route   GET /api/volunteers/:id/public
// @desc    Get public volunteer profile
// @access  Public
router.get('/:id/public', async (req, res) => {
  try {
    const volunteer = await User.findById(req.params.id)
      .select('name college department year skills totalHours profilePicture achievements')
      .populate('eventsAttended', 'title date category');

    if (!volunteer || volunteer.role !== 'volunteer' || !volunteer.isApproved || !volunteer.isActive) {
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
    console.error('Get public volunteer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching volunteer profile'
    });
  }
});

module.exports = router;
