const mongoose = require('mongoose');

const leaderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  academicBatch: {
    type: String,
    required: [true, 'Academic batch is required'],
    trim: true,
    maxlength: [20, 'Academic batch cannot exceed 20 characters']
  },
  nssLeadershipYear: {
    type: String,
    required: [true, 'NSS leadership year is required'],
    trim: true,
    maxlength: [10, 'NSS leadership year cannot exceed 10 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true,
    maxlength: [50, 'Role cannot exceed 50 characters']
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
    trim: true,
    maxlength: [100, 'Course cannot exceed 100 characters']
  },
  linkedinProfile: {
    type: String,
    required: false,
    trim: true
  },
  profilePicture: {
    type: String,
    default: '/default-avatar.svg'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

leaderSchema.index({ nssLeadershipYear: 1, order: 1 });
leaderSchema.index({ academicBatch: 1 });
leaderSchema.index({ role: 1 });
leaderSchema.index({ isActive: 1 });

module.exports = mongoose.model('Leader', leaderSchema);
