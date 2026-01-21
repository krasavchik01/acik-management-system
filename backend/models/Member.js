const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
    default: 'Bronze'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Alumni'],
    default: 'Active'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'USA'
    }
  },
  company: {
    name: String,
    position: String
  },
  education: {
    degree: String,
    institution: String,
    graduationYear: Number
  },
  interests: [String],
  skills: [String],
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  notes: String,
  avatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?background=random'
  },
  membershipFee: {
    amount: {
      type: Number,
      default: 0
    },
    paidDate: Date,
    expiryDate: Date
  },
  eventsAttended: [{
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    attendedAt: Date
  }]
}, {
  timestamps: true
});

// Virtual for full name
memberSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
memberSchema.set('toJSON', { virtuals: true });
memberSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Member', memberSchema);
