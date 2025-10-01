const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Leader = require('../models/Leader');
const { auth, admin } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/profile-pictures');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'leader-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// @route   GET /api/leaders
// @desc    Get all leaders (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { nssLeadershipYear, academicBatch, role, active } = req.query;
    
    let query = {};
    
    if (nssLeadershipYear) {
      query.nssLeadershipYear = nssLeadershipYear;
    }
    
    if (academicBatch) {
      query.academicBatch = academicBatch;
    }
    
    if (role) {
      query.role = role;
    }
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    const leaders = await Leader.find(query)
      .sort({ nssLeadershipYear: -1, order: 1, createdAt: -1 })
      .select('-__v');
    
    res.json({
      success: true,
      leaders,
      count: leaders.length
    });
  } catch (error) {
    console.error('Error fetching leaders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leaders'
    });
  }
});

// @route   GET /api/leaders/batches
// @desc    Get all unique NSS leadership years
// @access  Public
router.get('/batches', async (req, res) => {
  try {
    const nssLeadershipYears = await Leader.distinct('nssLeadershipYear', { isActive: true });
    res.json({
      success: true,
      batches: nssLeadershipYears.sort()
    });
  } catch (error) {
    console.error('Error fetching NSS leadership years:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching NSS leadership years'
    });
  }
});

// @route   GET /api/leaders/:id
// @desc    Get single leader by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const leader = await Leader.findById(req.params.id).select('-__v');
    
    if (!leader) {
      return res.status(404).json({
        success: false,
        message: 'Leader not found'
      });
    }
    
    res.json({
      success: true,
      leader
    });
  } catch (error) {
    console.error('Error fetching leader:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leader'
    });
  }
});

// @route   POST /api/leaders
// @desc    Create new leader
// @access  Admin only
router.post('/', auth, admin, upload.single('profilePicture'), async (req, res) => {
  try {
    const {
      name,
      academicBatch,
      nssLeadershipYear,
      role,
      course,
      linkedinProfile,
      order
    } = req.body;
    
    // Prepare leader data
    const leaderData = {
      name,
      academicBatch,
      nssLeadershipYear,
      role,
      course,
      linkedinProfile,
      order: parseInt(order) || 0
    };
    
    // Handle profile picture
    if (req.file) {
      leaderData.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
    }
    
    const leader = new Leader(leaderData);
    await leader.save();
    
    res.status(201).json({
      success: true,
      message: 'Leader created successfully',
      leader
    });
  } catch (error) {
    console.error('Error creating leader:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating leader'
    });
  }
});

// @route   PUT /api/leaders/:id
// @desc    Update leader
// @access  Admin only
router.put('/:id', auth, admin, upload.single('profilePicture'), async (req, res) => {
  try {
    const {
      name,
      academicBatch,
      nssLeadershipYear,
      role,
      course,
      linkedinProfile,
      order,
      isActive
    } = req.body;
    
    const leader = await Leader.findById(req.params.id);
    if (!leader) {
      return res.status(404).json({
        success: false,
        message: 'Leader not found'
      });
    }
    
    // Update fields
    if (name) leader.name = name;
    if (academicBatch) leader.academicBatch = academicBatch;
    if (nssLeadershipYear) leader.nssLeadershipYear = nssLeadershipYear;
    if (role) leader.role = role;
    if (course) leader.course = course;
    if (linkedinProfile) leader.linkedinProfile = linkedinProfile;
    if (order !== undefined) leader.order = parseInt(order);
    if (isActive !== undefined) leader.isActive = isActive === 'true' || isActive === true;
    
    // Handle profile picture
    if (req.file) {
      // Delete old profile picture if exists
      if (leader.profilePicture && leader.profilePicture !== '/default-avatar.svg') {
        const oldImagePath = path.join(__dirname, '..', leader.profilePicture);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      leader.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
    }
    await leader.save();
    
    res.json({
      success: true,
      message: 'Leader updated successfully',
      leader
    });
  } catch (error) {
    console.error('Error updating leader:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating leader'
    });
  }
});

// @route   DELETE /api/leaders/:id
// @desc    Delete leader
// @access  Admin only
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const leader = await Leader.findById(req.params.id);
    if (!leader) {
      return res.status(404).json({
        success: false,
        message: 'Leader not found'
      });
    }
    
    // Delete profile picture if exists
    if (leader.profilePicture && leader.profilePicture !== '/default-avatar.svg') {
      const imagePath = path.join(__dirname, '..', leader.profilePicture);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Leader.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Leader deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting leader:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting leader'
    });
  }
});

// @route   PUT /api/leaders/:id/toggle-status
// @desc    Toggle leader active status
// @access  Admin only
router.put('/:id/toggle-status', auth, admin, async (req, res) => {
  try {
    const leader = await Leader.findById(req.params.id);
    if (!leader) {
      return res.status(404).json({
        success: false,
        message: 'Leader not found'
      });
    }
    
    leader.isActive = !leader.isActive;
    await leader.save();
    
    res.json({
      success: true,
      message: `Leader ${leader.isActive ? 'activated' : 'deactivated'} successfully`,
      leader
    });
  } catch (error) {
    console.error('Error toggling leader status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling leader status'
    });
  }
});

module.exports = router;
