const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['Community Service', 'Educational', 'Cultural', 'Environmental', 'Health', 'Emergency', 'Other']
  },
  registrationType: {
    type: String,
    enum: ['internal', 'public'],
    default: 'internal'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  maxParticipants: {
    type: Number,
    default: 50
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  requirements: {
    type: String,
    default: 'No special requirements'
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled', 'Postponed'],
    default: 'Upcoming'
  },
  image: {
    type: String,
    default: '/default-event.jpg'
  },
  teamLeaders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  registeredVolunteers: [{
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['Participant', 'Coordinator', 'Team Leader'],
      default: 'Participant'
    },
    attended: {
      type: Boolean,
      default: false
    },
    attendanceDate: Date,
    notificationSent: {
      type: Boolean,
      default: false
    }
  }],
  externalParticipants: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      enum: ['Student', 'Staff'],
      default: 'Student'
    },
    universityId: {
      type: String,
      required: false,
      trim: true
    },
    course: {
      type: String,
      required: false,
      trim: true,
      default: 'N/A'
    },
    year: {
      type: Number,
      required: false,
      min: 1,
      max: 5
    },
    age: {
      type: Number,
      required: true,
      min: 16,
      max: 100
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    attended: {
      type: Boolean,
      default: false
    },
    attendanceDate: Date
  }],
  attendance: [{
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      required: true
    },
    remarks: {
      type: String,
      default: ''
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    markedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notifications: [{
    type: {
      type: String,
      enum: ['Created', 'Updated', 'Cancelled', 'Reminder', 'Urgent', 'Status Changed'],
      required: true
    },
    message: String,
    sentAt: {
      type: Date,
      default: Date.now
    },
    sentTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastNotificationSent: Date
});

// Update timestamp on save
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  return this.currentParticipants >= this.maxParticipants;
});

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  return new Date() < this.startDate;
});

// Virtual for checking if event is ongoing
eventSchema.virtual('isOngoing').get(function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

// Virtual for checking if event is completed
eventSchema.virtual('isCompleted').get(function() {
  return new Date() > this.endDate;
});

// Virtual for checking if event is urgent (same day or next day)
eventSchema.virtual('isUrgentEvent').get(function() {
  const now = new Date();
  const eventDate = new Date(this.startDate);
  const diffTime = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 1;
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  return Math.max(0, this.maxParticipants - this.currentParticipants);
});

// Virtual for registration deadline (2 hours before event)
eventSchema.virtual('registrationDeadline').get(function() {
  const eventStart = new Date(this.startDate + ' ' + this.startTime);
  return new Date(eventStart.getTime() - (2 * 60 * 60 * 1000));
});

// Virtual for checking if registration is still open
eventSchema.virtual('registrationOpen').get(function() {
  return new Date() < this.registrationDeadline;
});

module.exports = mongoose.model('Event', eventSchema);
