const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new volunteer with complete information
// @access  Public
router.post('/register', [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  body('phone', 'Please enter a valid 10-digit phone number').isLength({ min: 10, max: 10 }),
  body('college', 'College name is required').not().isEmpty(),
  body('department', 'Department is required').not().isEmpty(),
  body('year', 'Year must be between 1 and 4').isInt({ min: 1, max: 4 }),
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
      email, 
      password, 
      phone, 
      college, 
      department, 
      year, 
      bloodGroup,
      fatherName,
      motherName,
      address,
      pinCode,
      state,
      district,
      skills 
    } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user with complete information
    user = new User({
      name,
      email,
      password,
      phone,
      college,
      department,
      year,
      bloodGroup,
      fatherName,
      motherName,
      address,
      pinCode,
      state,
      district,
      skills: skills || []
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! You can now login and apply to join NSS.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        college: user.college,
        department: user.department,
        year: user.year,
        bloodGroup: user.bloodGroup,
        fatherName: user.fatherName,
        motherName: user.motherName,
        address: user.address,
        pinCode: user.pinCode,
        state: user.state,
        district: user.district,
        skills: user.skills,
        hasAppliedToNSS: user.hasAppliedToNSS,
        nssApplicationStatus: user.nssApplicationStatus
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], async (req, res) => {
  try {
    console.log('🔐 Login attempt:', { email: req.body.email });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(' Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;
    console.log('📧 Processing login for:', email);

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(' User not found:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    console.log(' User found:', { id: user._id, role: user.role, isActive: user.isActive });

    // Check if user is active
    if (!user.isActive) {
      console.log('User account deactivated:', email);
      return res.status(400).json({
        success: false,
        message: 'Account is deactivated. Please contact admin.'
      });
    }

    // Allow rejected users to login so they can reapply
    // No need to block login for rejected applications

    // Check password
    console.log(' Comparing passwords...');
    const isMatch = await user.comparePassword(password);
    console.log(' Password match result:', isMatch);
    
    if (!isMatch) {
      console.log(' Password mismatch for:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    console.log('🎫 Generating JWT token...');
    const token = generateToken(user._id);
    console.log(' Token generated successfully');

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        college: user.college,
        department: user.department,
        year: user.year,
        bloodGroup: user.bloodGroup,
        fatherName: user.fatherName,
        motherName: user.motherName,
        address: user.address,
        pinCode: user.pinCode,
        state: user.state,
        district: user.district,
        skills: user.skills,
        hasAppliedToNSS: user.hasAppliedToNSS,
        nssApplicationStatus: user.nssApplicationStatus,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error(' Login error:', error);
    console.error(' Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    console.log(' /api/auth/me - Request user ID:', req.user.id);
    
    // First, let's check if user exists
    const userExists = await User.findById(req.user.id);
    console.log(' /api/auth/me - User exists check:', !!userExists);
    
    const user = await User.findById(req.user.id).select('-password');
    console.log(' /api/auth/me - Full user object:', JSON.stringify(user, null, 2));
    console.log(' /api/auth/me - Specific fields:', {
      id: user._id,
      name: user.name,
      pinCode: user.pinCode,
      state: user.state,
      district: user.district,
      hasAppliedToNSS: user.hasAppliedToNSS,
      nssApplicationStatus: user.nssApplicationStatus
    });
    
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

// @route   POST /api/auth/apply-nss
// @desc    Submit NSS application
// @access  Private
router.post('/apply-nss', [
  auth,
  body('phone', 'Phone number is required').isLength({ min: 10, max: 10 }),
  body('college', 'College name is required').not().isEmpty(),
  body('department', 'Course is required').not().isEmpty(),
  body('year', 'Year must be between 1 and 5').isInt({ min: 1, max: 5 }),
  body('bloodGroup', 'Blood group is required').not().isEmpty(),
  body('universityRollNo', 'University roll no is required').not().isEmpty(),
  body('skills', 'Skills are required').isArray({ min: 1 })
  // motivation is optional, no validation required
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { phone, college, department, year, bloodGroup, universityRollNo, skills, motivation } = req.body;
    const userId = req.user.id;

    // Check if user already applied
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.hasAppliedToNSS && user.nssApplicationStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Your NSS application has already been approved. No changes needed.'
      });
    }

    // Allow reapplication if status is rejected or pending
    if (user.hasAppliedToNSS && user.nssApplicationStatus === 'rejected') {
      // Update existing application data
      user.nssApplicationStatus = 'pending';
      user.nssApplicationData = {
        phone,
        college,
        department,
        year,
        bloodGroup,
        universityRollNo,
        skills,
        motivation,
        appliedAt: new Date(),
        reapplicationCount: (user.nssApplicationData?.reapplicationCount || 0) + 1
      };

      await user.save();

      return res.json({
        success: true,
        message: 'NSS application updated and resubmitted successfully! Awaiting admin approval.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          hasAppliedToNSS: user.hasAppliedToNSS,
          nssApplicationStatus: user.nssApplicationStatus
        }
      });
    }

    // Update user with NSS application data
    user.hasAppliedToNSS = true;
    user.nssApplicationStatus = 'pending';
    user.nssApplicationData = {
      phone,
      college,
      department,
      year,
      bloodGroup,
      universityRollNo,
      skills,
      motivation,
      appliedAt: new Date()
    };

    await user.save();

    res.json({
      success: true,
      message: 'NSS application submitted successfully! Awaiting admin approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasAppliedToNSS: user.hasAppliedToNSS,
        nssApplicationStatus: user.nssApplicationStatus
      }
    });

  } catch (error) {
    console.error('NSS application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during NSS application submission'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', [
  auth,
  body('currentPassword', 'Current password is required').exists(),
  body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully!'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
});

module.exports = router;
