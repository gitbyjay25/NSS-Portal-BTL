const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');
const { auth, volunteer } = require('../middleware/auth');
const logger = require('../utils/logger');

// @route   GET /api/feedback
// @desc    Get all approved feedback/testimonials
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const feedback = await Feedback.find({ 
      isApproved: true, 
      isActive: true 
    })
      .populate('submittedBy', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Feedback.countDocuments({ 
      isApproved: true, 
      isActive: true 
    });

    res.json({
      success: true,
      feedback,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching feedback'
    });
  }
});

// @route   POST /api/feedback
// @desc    Submit new feedback/testimonial
// @access  Private (Volunteer only)
router.post('/', [
  auth,
  volunteer,
  body('name', 'Name is required').not().isEmpty(),
  body('role', 'Role is required').not().isEmpty(),
  body('testimonial', 'Testimonial is required').not().isEmpty().isLength({ min: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { name, role, department, testimonial } = req.body;

    const feedback = new Feedback({
      name,
      role,
      department,
      testimonial,
      submittedBy: req.user.id
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully! It will be reviewed by admin before publishing.',
      feedback
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting feedback'
    });
  }
});

// @route   PUT /api/feedback/:id/like
// @desc    Like/unlike a feedback
// @access  Private (Volunteer only)
router.put('/:id/like', [auth, volunteer], async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    if (!feedback.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot like unapproved feedback'
      });
    }

    const existingLike = feedback.likes.find(
      like => like.user.toString() === req.user.id
    );

    if (existingLike) {
      // Unlike
      feedback.likes = feedback.likes.filter(
        like => like.user.toString() !== req.user.id
      );
      await feedback.save();

      res.json({
        success: true,
        message: 'Feedback unliked successfully!',
        liked: false
      });
    } else {
      // Like
      feedback.likes.push({
        user: req.user.id,
        likedAt: new Date()
      });
      await feedback.save();

      res.json({
        success: true,
        message: 'Feedback liked successfully!',
        liked: true
      });
    }
  } catch (error) {
    console.error('Feedback like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing like'
    });
  }
});

// @route   GET /api/feedback/volunteer/submissions
// @desc    Get current volunteer's feedback submissions
// @access  Private (Volunteer only)
router.get('/volunteer/submissions', [auth, volunteer], async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { submittedBy: req.user.id };
    if (status === 'approved') filter.isApproved = true;
    if (status === 'pending') filter.isApproved = false;

    const feedback = await Feedback.find(filter)
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
    console.error('Get volunteer feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching feedback submissions'
    });
  }
});

// @route   PUT /api/feedback/:id
// @desc    Update feedback (only by submitter if not approved)
// @access  Private (Volunteer only)
router.put('/:id', [
  auth,
  volunteer,
  body('name', 'Name is required').not().isEmpty(),
  body('role', 'Role is required').not().isEmpty(),
  body('testimonial', 'Testimonial is required').not().isEmpty().isLength({ min: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user is the submitter
    if (feedback.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own feedback'
      });
    }

    // Check if already approved (can't edit approved feedback)
    if (feedback.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit approved feedback'
      });
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Feedback updated successfully!',
      feedback: updatedFeedback
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating feedback'
    });
  }
});

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback (only by submitter if not approved)
// @access  Private (Volunteer only)
router.delete('/:id', [auth, volunteer], async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user is the submitter
    if (feedback.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own feedback'
      });
    }

    // Check if already approved (can't delete approved feedback)
    if (feedback.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete approved feedback. Contact admin for removal.'
      });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Feedback deleted successfully!'
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
