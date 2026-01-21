const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  type: {
    type: String,
    enum: ['Conference', 'Workshop', 'Networking', 'Summit', 'Webinar', 'Meeting', 'Social', 'Training', 'Other'],
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['Planned', 'Active', 'Completed', 'Cancelled', 'Postponed'],
    default: 'Planned'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    venue: {
      type: String,
      required: true
    },
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isVirtual: {
      type: Boolean,
      default: false
    },
    virtualLink: String
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  speakers: [{
    name: String,
    title: String,
    bio: String,
    photo: String
  }],
  capacity: {
    type: Number,
    default: 0
  },
  registrations: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    attended: {
      type: Boolean,
      default: false
    },
    ticketType: String,
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending'
    }
  }],
  pricing: {
    isFree: {
      type: Boolean,
      default: true
    },
    memberPrice: Number,
    nonMemberPrice: Number,
    earlyBirdPrice: Number,
    earlyBirdDeadline: Date
  },
  agenda: [{
    time: String,
    title: String,
    description: String,
    speaker: String
  }],
  tags: [String],
  banner: String,
  attachments: [{
    name: String,
    url: String
  }],
  budget: {
    estimated: {
      type: Number,
      default: 0
    },
    actual: {
      type: Number,
      default: 0
    }
  },
  feedback: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for registration count
eventSchema.virtual('registrationCount').get(function() {
  return this.registrations ? this.registrations.length : 0;
});

// Virtual for attendance count
eventSchema.virtual('attendanceCount').get(function() {
  return this.registrations ? this.registrations.filter(r => r.attended).length : 0;
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
