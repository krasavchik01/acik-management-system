const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required']
  },
  category: {
    type: String,
    enum: ['Technology', 'Innovation', 'Research', 'Community', 'Education', 'Business', 'Other'],
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'],
    default: 'Planning'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  budget: {
    allocated: {
      type: Number,
      default: 0
    },
    spent: {
      type: Number,
      default: 0
    },
    remaining: {
      type: Number,
      default: 0
    }
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      default: 'Member'
    }
  }],
  tags: [String],
  attachments: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  milestones: [{
    name: String,
    description: String,
    dueDate: Date,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Virtual for task count
projectSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  count: true
});

// Calculate remaining budget before saving
projectSchema.pre('save', function(next) {
  if (this.budget) {
    this.budget.remaining = this.budget.allocated - this.budget.spent;
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
