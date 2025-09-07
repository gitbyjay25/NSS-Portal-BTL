const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Announcement = require('../models/Announcement');
const { auth, admin } = require('../middleware/auth');

// @route   GET /api/announcements
// @desc    Get all active announcements
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const announcements = await Announcement.find(filter)
      .populate('createdBy', 'name')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Announcement.countDocuments(filter);

    res.json({
      success: true,
      announcements,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching announcements'
    });
  }
});

// @route   GET /api/announcements/:id
// @desc    Get single announcement by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('specificRecipients', 'name email');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    if (!announcement.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching announcement'
    });
  }
});

// @route   POST /api/announcements
// @desc    Create a new announcement
// @access  Private (Admin only)
router.post('/', [
  auth,
  admin,
  body('title', 'Announcement title is required').not().isEmpty(),
  body('content', 'Announcement content is required').not().isEmpty(),
  body('category', 'Category is required').isIn([
    'general',
    'event',
    'reminder',
    'achievement',
    'emergency'
  ]),
  body('targetAudience', 'Target audience must be valid').optional().isIn([
    'all',
    'volunteers',
    'admins',
    'specific'
  ]),
  body('expiresAt', 'Expiry date must be valid').optional().isISO8601()
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
      title, 
      content, 
      category, 
      targetAudience, 
      specificRecipients, 
      expiresAt,
      isPinned 
    } = req.body;

    const announcement = new Announcement({
      title,
      content,
      category,
      targetAudience: targetAudience || 'all',
      specificRecipients: targetAudience === 'specific' ? specificRecipients : [],
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isPinned: isPinned || false,
      createdBy: req.user.id
    });

    await announcement.save();

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully!',
      announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating announcement'
    });
  }
});

// @route   PUT /api/announcements/:id
// @desc    Update an announcement
// @access  Private (Admin only)
router.put('/:id', [
  auth,
  admin,
  body('title', 'Announcement title is required').not().isEmpty(),
  body('content', 'Announcement content is required').not().isEmpty(),
  body('priority', 'Priority must be low, medium, high, or urgent').isIn(['low', 'medium', 'high', 'urgent']),
  body('category', 'Category is required').isIn([
    'General',
    'Event Update',
    'Important Notice',
    'Achievement',
    'Reminder',
    'Emergency'
  ]),
  body('targetAudience', 'Target audience is required').isIn(['all', 'volunteers', 'admins', 'specific'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    let announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Announcement updated successfully!',
      announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating announcement'
    });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement
// @access  Private (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Soft delete - mark as inactive
    announcement.isActive = false;
    await announcement.save();

    res.json({
      success: true,
      message: 'Announcement deleted successfully!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting announcement'
    });
  }
});

// @route   PUT /api/announcements/:id/pin
// @desc    Pin/unpin an announcement
// @access  Private (Admin only)
router.put('/:id/pin', [auth, admin], async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    announcement.isPinned = !announcement.isPinned;
    await announcement.save();

    res.json({
      success: true,
      message: announcement.isPinned ? 'Announcement pinned successfully!' : 'Announcement unpinned successfully!',
      isPinned: announcement.isPinned
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while pinning announcement'
    });
  }
});

// @route   POST /api/announcements/:id/read
// @desc    Mark announcement as read by current user
// @access  Private
router.post('/:id/read', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check if already read
    const alreadyRead = announcement.readBy.find(
      read => read.user.toString() === req.user.id
    );

    if (!alreadyRead) {
      announcement.readBy.push({
        user: req.user.id,
        readAt: new Date()
      });
      await announcement.save();
    }

    res.json({
      success: true,
      message: 'Announcement marked as read!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while marking announcement as read'
    });
  }
});

// @route   GET /api/announcements/unread/count
// @desc    Get count of unread announcements for current user
// @access  Private
router.get('/unread/count', auth, async (req, res) => {
  try {
    const unreadCount = await Announcement.countDocuments({
      isActive: true,
      readBy: { $not: { $elemMatch: { user: req.user.id } } }
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while getting unread count'
    });
  }
});

module.exports = router;
