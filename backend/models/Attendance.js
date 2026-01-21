const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkIn: {
    time: {
      type: Date,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      },
      address: String
    },
    method: {
      type: String,
      enum: ['Manual', 'QR Code', 'Biometric', 'RFID', 'Mobile App'],
      default: 'Manual'
    }
  },
  checkOut: {
    time: Date,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      },
      address: String
    },
    method: {
      type: String,
      enum: ['Manual', 'QR Code', 'Biometric', 'RFID', 'Mobile App'],
      default: 'Manual'
    }
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half Day', 'Work From Home', 'On Leave'],
    default: 'Present'
  },
  workType: {
    type: String,
    enum: ['Office', 'Remote', 'Hybrid', 'Field Work', 'Client Site'],
    default: 'Office'
  },
  hoursWorked: {
    type: Number,
    default: 0
  },
  breaks: [{
    startTime: Date,
    endTime: Date,
    duration: Number,
    type: {
      type: String,
      enum: ['Lunch', 'Coffee', 'Meeting', 'Other'],
      default: 'Other'
    }
  }],
  overtime: {
    hours: {
      type: Number,
      default: 0
    },
    approved: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  notes: String,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  tasks: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    hoursSpent: Number
  }],
  mood: {
    type: String,
    enum: ['Excellent', 'Good', 'Neutral', 'Poor', 'Bad']
  },
  productivity: {
    type: Number,
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

// Index for geospatial queries
attendanceSchema.index({ 'checkIn.location': '2dsphere' });

// Calculate hours worked before saving
attendanceSchema.pre('save', function(next) {
  if (this.checkIn && this.checkIn.time && this.checkOut && this.checkOut.time) {
    const diffMs = this.checkOut.time - this.checkIn.time;
    const diffHrs = diffMs / (1000 * 60 * 60);

    // Subtract break time
    let breakTime = 0;
    if (this.breaks && this.breaks.length > 0) {
      breakTime = this.breaks.reduce((sum, b) => {
        if (b.startTime && b.endTime) {
          const breakDiff = (b.endTime - b.startTime) / (1000 * 60 * 60);
          return sum + breakDiff;
        }
        return sum;
      }, 0);
    }

    this.hoursWorked = Math.max(0, diffHrs - breakTime);

    // Calculate overtime (assuming 8 hours is standard)
    if (this.hoursWorked > 8) {
      this.overtime.hours = this.hoursWorked - 8;
    }
  }
  next();
});

// Compound index for user and date
attendanceSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
