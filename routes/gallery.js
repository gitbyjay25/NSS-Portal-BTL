const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Gallery = require('../models/Gallery');
const { auth, volunteer } = require('../middleware/auth');
const logger = require('../utils/logger');

// Configure multer for gallery image uploads
const storage = multer.diskStorage({
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

// @route   GET /api/gallery
// @desc    Get all approved gallery images
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 20, event, month, search } = req.query;
    
    console.log('Gallery API called with params:', { category, event, month, search });
    
    const filter = { isApproved: true, isActive: true };
    
    // Category filter
    if (category) filter.category = category;
    
    // Event filter
    if (event) {
      filter.event = event;
      console.log('Filtering by event:', event);
    }
    
    // Month filter (YYYY-MM format)
    if (month) {
      const startDate = new Date(month + '-01');
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      filter.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    console.log('Final filter:', filter);
    
    const gallery = await Gallery.find(filter)
      .populate('uploadedBy', 'name')
      .populate('event', 'title date location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Gallery.countDocuments(filter);
    
    console.log('Found', gallery.length, 'photos for event:', event);
    console.log('Gallery items with event info:', gallery.map(item => ({
      id: item._id,
      title: item.title,
      eventId: item.event?._id,
      eventTitle: item.event?.title
    })));

    res.json({
      success: true,
      gallery,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching gallery'
    });
  }
});

// @route   GET /api/gallery/:id
// @desc    Get single gallery image
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('event', 'title description');

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    // Increment view count
    galleryItem.views += 1;
    await galleryItem.save();

    res.json({
      success: true,
      galleryItem
    });
  } catch (error) {
    console.error('Get gallery item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching gallery item'
    });
  }
});

// @route   POST /api/gallery
// @desc    Upload a new gallery image
// @access  Private (Volunteer only)
router.post('/', [
  auth,
  volunteer,
  upload.single('image'), // Handle file upload
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
    console.log('🚀 [GALLERY UPLOAD] Starting gallery upload...');
    console.log('📤 [GALLERY UPLOAD] Request body:', req.body);
    console.log('📁 [GALLERY UPLOAD] Request file:', req.file);
    console.log('👤 [GALLERY UPLOAD] User ID:', req.user.id);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ [GALLERY UPLOAD] Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { title, description, category, event, tags } = req.body;

    // Handle both file upload and base64 URL
    let imageUrl;
    if (req.file) {
      // File upload from Gallery.js
      imageUrl = `/uploads/gallery/${req.file.filename}`;
      console.log('📁 [GALLERY UPLOAD] File uploaded:', req.file.filename);
    } else if (req.body.imageUrl) {
      // Base64 URL from UploadActivity.js
      imageUrl = req.body.imageUrl;
      console.log('🔗 [GALLERY UPLOAD] Base64 URL provided');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    console.log('📝 [GALLERY UPLOAD] Creating gallery item with data:', {
      title,
      description,
      category,
      event,
      tags,
      imageUrl,
      uploadedBy: req.user.id
    });

    const galleryItem = new Gallery({
      title,
      description,
      category,
      event,
      tags: tags || [],
      imageUrl,
      uploadedBy: req.user.id
    });

    console.log('💾 [GALLERY UPLOAD] Saving gallery item to database...');
    await galleryItem.save();
    console.log('✅ [GALLERY UPLOAD] Gallery item saved successfully:', galleryItem._id);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully! Awaiting admin approval.',
      galleryItem
    });
    
    // Log for dashboard real-time updates
    console.log('🔄 [GALLERY UPLOAD] New pending item created - dashboard should refresh');
  } catch (error) {
    console.error('❌ [GALLERY UPLOAD] Upload gallery error:', error);
    
    // Handle multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    
    if (error.message === 'Only image files are allowed!') {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed!'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while uploading image'
    });
  }
});

// @route   PUT /api/gallery/:id/like
// @desc    Like/unlike a gallery image
// @access  Private (Volunteer only)
router.put('/:id/like', [auth, volunteer], async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    
    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    if (!galleryItem.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot like unapproved images'
      });
    }

    const existingLike = galleryItem.likes.find(
      like => like.user.toString() === req.user.id
    );

    if (existingLike) {
      // Unlike
      galleryItem.likes = galleryItem.likes.filter(
        like => like.user.toString() !== req.user.id
      );
      await galleryItem.save();

      res.json({
        success: true,
        message: 'Image unliked successfully!',
        liked: false
      });
    } else {
      // Like
      galleryItem.likes.push({
        user: req.user.id,
        likedAt: new Date()
      });
      await galleryItem.save();

      res.json({
        success: true,
        message: 'Image liked successfully!',
        liked: true
      });
    }
  } catch (error) {
    console.error('Gallery like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing like'
    });
  }
});

// @route   GET /api/gallery/volunteer/uploads
// @desc    Get current volunteer's uploaded images
// @access  Private (Volunteer only)
router.get('/volunteer/uploads', [auth, volunteer], async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const filter = { uploadedBy: req.user.id };
    if (status === 'approved') filter.isApproved = true;
    if (status === 'pending') filter.isApproved = false;

    const gallery = await Gallery.find(filter)
      .populate('event', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Gallery.countDocuments(filter);

    res.json({
      success: true,
      gallery,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get volunteer uploads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching uploads'
    });
  }
});

// @route   PUT /api/gallery/:id
// @desc    Update gallery item (only by uploader)
// @access  Private (Volunteer only)
router.put('/:id', [
  auth,
  volunteer,
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
    console.log('🔄 [VOLUNTEER GALLERY UPDATE] Volunteer gallery update route hit!');
    console.log('🔄 [VOLUNTEER GALLERY UPDATE] User role:', req.user?.role);
    console.log('🔄 [VOLUNTEER GALLERY UPDATE] Gallery ID:', req.params.id);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ [VOLUNTEER GALLERY UPDATE] Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false, 
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

    // Check if user is the uploader
    if (galleryItem.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own uploads'
      });
    }

    // Check if already approved (can't edit approved items)
    if (galleryItem.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit approved images'
      });
    }

    const updatedGallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Gallery item updated successfully!',
      galleryItem: updatedGallery
    });
  } catch (error) {
    console.error('Update gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating gallery item'
    });
  }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete gallery item (only by uploader if not approved)
// @access  Private (Volunteer only)
router.delete('/:id', [auth, volunteer], async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    
    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    // Check if user is the uploader
    if (galleryItem.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own uploads'
      });
    }

    // Check if already approved (can't delete approved items)
    if (galleryItem.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete approved images. Contact admin for removal.'
      });
    }

    await Gallery.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Gallery item deleted successfully!'
    });
  } catch (error) {
    console.error('Delete gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting gallery item'
    });
  }
});

module.exports = router;
