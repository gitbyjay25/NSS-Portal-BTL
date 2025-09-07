const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
      photo: {
      type: String,
      default: '/default-avatar.svg'
    },
  department: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: String,
    required: true,
    trim: true
  },
  achievements: [{
    type: String,
    trim: true
  }],
  socialLinks: {
    instagram: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    }
  }
});

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  members: [teamMemberSchema],
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

// Index for better query performance
teamSchema.index({ name: 1, isActive: 1 });
teamSchema.index({ order: 1 });

module.exports = mongoose.model('Team', teamSchema);
