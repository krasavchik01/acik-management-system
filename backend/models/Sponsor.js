const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sponsor name is required'],
    trim: true
  },
  logo: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  level: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
    default: 'Bronze'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending', 'Expired'],
    default: 'Active'
  },
  type: {
    type: String,
    enum: ['Corporate', 'Individual', 'Foundation', 'Government', 'Non-Profit'],
    default: 'Corporate'
  },
  industry: {
    type: String,
    trim: true
  },
  contactPerson: {
    name: {
      type: String,
      required: true
    },
    title: String,
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: true
    }
  },
  company: {
    website: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    description: String
  },
  sponsorship: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    frequency: {
      type: String,
      enum: ['One-Time', 'Monthly', 'Quarterly', 'Yearly'],
      default: 'One-Time'
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    totalCommitted: {
      type: Number,
      default: 0
    },
    totalReceived: {
      type: Number,
      default: 0
    }
  },
  benefits: [{
    description: String,
    delivered: {
      type: Boolean,
      default: false
    }
  }],
  events: [{
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    sponsorshipLevel: String,
    amount: Number
  }],
  projects: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    amount: Number
  }],
  payments: [{
    amount: Number,
    date: Date,
    method: String,
    reference: String,
    status: {
      type: String,
      enum: ['Pending', 'Received', 'Failed'],
      default: 'Pending'
    }
  }],
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['Contract', 'Invoice', 'Receipt', 'Agreement', 'Other']
    },
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: String,
  tags: [String],
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  managedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Calculate total committed and received
sponsorSchema.pre('save', function(next) {
  if (this.payments && this.payments.length > 0) {
    this.sponsorship.totalReceived = this.payments
      .filter(p => p.status === 'Received')
      .reduce((sum, p) => sum + p.amount, 0);
  }
  next();
});

module.exports = mongoose.model('Sponsor', sponsorSchema);
