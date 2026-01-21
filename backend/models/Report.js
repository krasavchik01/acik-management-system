const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Weekly', 'Monthly', 'Quarterly', 'Annual', 'Project', 'Financial', 'Event', 'Custom'],
    required: true
  },
  category: {
    type: String,
    enum: ['Executive', 'Financial', 'Operations', 'Marketing', 'HR', 'Projects', 'Events', 'Compliance'],
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'In Review', 'Approved', 'Published', 'Archived'],
    default: 'Draft'
  },
  period: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  summary: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  metrics: [{
    name: String,
    value: mongoose.Schema.Types.Mixed,
    unit: String,
    trend: {
      type: String,
      enum: ['Up', 'Down', 'Stable', 'N/A'],
      default: 'N/A'
    },
    change: Number
  }],
  kpis: [{
    name: String,
    target: Number,
    actual: Number,
    unit: String,
    status: {
      type: String,
      enum: ['On Track', 'At Risk', 'Behind', 'Exceeded'],
      default: 'On Track'
    }
  }],
  highlights: [String],
  challenges: [String],
  recommendations: [String],
  nextSteps: [String],
  financials: {
    income: Number,
    expenses: Number,
    netIncome: Number,
    budget: Number,
    budgetVariance: Number
  },
  projects: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    status: String,
    progress: Number,
    highlights: String
  }],
  events: [{
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    attendance: Number,
    feedback: Number,
    notes: String
  }],
  charts: [{
    type: {
      type: String,
      enum: ['Line', 'Bar', 'Pie', 'Doughnut', 'Area', 'Scatter']
    },
    title: String,
    data: mongoose.Schema.Types.Mixed
  }],
  attachments: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Changes Requested'],
      default: 'Pending'
    },
    comments: String,
    reviewedAt: Date
  }],
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  publishedAt: Date,
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  tags: [String],
  isConfidential: {
    type: Boolean,
    default: false
  },
  accessLevel: {
    type: String,
    enum: ['Public', 'Internal', 'Restricted', 'Confidential'],
    default: 'Internal'
  }
}, {
  timestamps: true
});

// Index for better query performance
reportSchema.index({ type: 1, 'period.startDate': -1 });
reportSchema.index({ category: 1, status: 1 });
reportSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Report', reportSchema);
