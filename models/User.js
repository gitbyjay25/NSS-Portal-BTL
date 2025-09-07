const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['volunteer', 'admin'],
    default: 'volunteer'
  },
  phone: {
    type: String,
    required: false,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  college: {
    type: String,
    required: false
  },
  department: {
    type: String,
    required: false
  },
  year: {
    type: Number,
    required: false,
    min: [1, 'Year must be at least 1'],
    max: [5, 'Year cannot exceed 5']
  },
  universityRollNo: {
    type: String,
    required: false,
    trim: true,
    maxlength: [20, 'University Roll No cannot exceed 20 characters']
  },
  skills: [{
    type: String,
    trim: true
  }],
  bloodGroup: {
    type: String,
    required: false,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  fatherName: {
    type: String,
    required: false,
    trim: true,
    maxlength: [50, 'Father\'s name cannot exceed 50 characters']
  },
  motherName: {
    type: String,
    required: false,
    trim: true,
    maxlength: [50, 'Mother\'s name cannot exceed 50 characters']
  },
  address: {
    type: String,
    required: false,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  pinCode: {
    type: String,
    required: false,
    trim: true,
    match: [/^\d{6}$/, 'PIN code must be exactly 6 digits']
  },
  state: {
    type: String,
    required: false,
    trim: true,
    maxlength: [50, 'State cannot exceed 50 characters']
  },
  district: {
    type: String,
    required: false,
    trim: true,
    maxlength: [50, 'District cannot exceed 50 characters']
  },
  profilePicture: {
    type: String,
    default: '/default-avatar.svg'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // NSS Application Status
  hasAppliedToNSS: {
    type: Boolean,
    default: false
  },
  nssApplicationStatus: {
    type: String,
    enum: ['not_applied', 'pending', 'approved', 'rejected'],
    default: 'not_applied'
  },
  nssApplicationData: {
    phone: String,
    college: String,
    department: String,
    year: Number,
    bloodGroup: String,
    fatherName: String,
    motherName: String,
    address: String,
    pinCode: String,
    state: String,
    district: String,
    universityRollNo: String,
    skills: [String],
    motivation: String,
    appliedAt: Date
  },
  eventsAttended: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  totalHours: {
    type: Number,
    default: 0
  },
  achievements: [{
    title: String,
    description: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
