const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Income', 'Expense'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'Sponsorship', 'Membership Fees', 'Event Revenue', 'Donations', 'Grants', 'Sales',
      'Salaries', 'Office Rent', 'Utilities', 'Marketing', 'Events', 'Equipment',
      'Software', 'Travel', 'Insurance', 'Legal', 'Miscellaneous'
    ],
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Check', 'Credit Card', 'Debit Card', 'Bank Transfer', 'PayPal', 'Stripe', 'Other'],
    default: 'Cash'
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Cancelled', 'Refunded'],
    default: 'Completed'
  },
  reference: {
    type: String,
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  sponsor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sponsor'
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  paidBy: String,
  paidTo: String,
  invoiceNumber: String,
  receiptNumber: String,
  dueDate: Date,
  notes: String,
  attachments: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  tags: [String],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']
  }
}, {
  timestamps: true
});

// Index for better query performance
financeSchema.index({ type: 1, date: -1 });
financeSchema.index({ category: 1, date: -1 });
financeSchema.index({ status: 1 });

module.exports = mongoose.model('Finance', financeSchema);
