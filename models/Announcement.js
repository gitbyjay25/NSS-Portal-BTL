const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
    maxlength: [1000, 'Content cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: [
      'general',
      'event',
      'reminder',
      'achievement',
      'emergency'
    ],
    default: 'general'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'volunteers', 'admins', 'specific'],
    default: 'all'
  },
  specificRecipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    type: String
  }]
}, {
  timestamps: true
});

// Virtual for read count
announcementSchema.virtual('readCount').get(function() {
  return this.readBy.length;
});

// Virtual for checking if announcement is expired
announcementSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Index for better query performance
announcementSchema.index({ isActive: 1, createdAt: -1 });
announcementSchema.index({ category: 1 });
announcementSchema.index({ targetAudience: 1 });
announcementSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
