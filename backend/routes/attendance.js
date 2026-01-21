const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/attendance
// @desc    Get all attendance records with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { user, startDate, endDate, status, workType } = req.query;

    let query = {};

    if (user) query.user = user;
    if (status) query.status = status;
    if (workType) query.workType = workType;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(query)
      .populate('user', 'name email avatar department')
      .populate('project', 'name')
      .populate('tasks.task', 'title')
      .populate('verifiedBy', 'name')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/attendance/my
// @desc    Get my attendance records
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = { user: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(query)
      .populate('project', 'name')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/attendance/stats
// @desc    Get attendance statistics
// @access  Private (Manager+)
router.get('/stats', protect, authorize('Admin', 'President', 'Vice President', 'CEO', 'Project Manager'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayPresent = await Attendance.countDocuments({
      date: { $gte: today },
      status: { $in: ['Present', 'Late', 'Work From Home'] }
    });

    const todayAbsent = await Attendance.countDocuments({
      date: { $gte: today },
      status: 'Absent'
    });

    const todayLate = await Attendance.countDocuments({
      date: { $gte: today },
      status: 'Late'
    });

    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyRecords = await Attendance.find({
      date: { $gte: currentMonth }
    });

    const totalHours = monthlyRecords.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
    const avgHours = monthlyRecords.length > 0 ? (totalHours / monthlyRecords.length).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        today: {
          present: todayPresent,
          absent: todayAbsent,
          late: todayLate
        },
        monthly: {
          totalHours,
          avgHours,
          totalDays: monthlyRecords.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/attendance/today
// @desc    Get today's attendance
// @access  Private
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const records = await Attendance.find({
      date: { $gte: today }
    })
      .populate('user', 'name email avatar department')
      .sort({ 'checkIn.time': -1 });

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/attendance/:id
// @desc    Get single attendance record
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id)
      .populate('user', 'name email avatar department')
      .populate('project', 'name')
      .populate('tasks.task', 'title status')
      .populate('verifiedBy', 'name email');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/attendance/checkin
// @desc    Check in
// @access  Private
router.post('/checkin', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingRecord = await Attendance.findOne({
      user: req.user.id,
      date: { $gte: today }
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today'
      });
    }

    const checkInTime = new Date();
    const workDayStart = new Date();
    workDayStart.setHours(9, 0, 0, 0); // Assuming 9 AM start time

    const isLate = checkInTime > workDayStart;

    const record = await Attendance.create({
      user: req.user.id,
      date: today,
      checkIn: {
        time: checkInTime,
        location: {
          coordinates: req.body.coordinates || [0, 0],
          address: req.body.address
        },
        method: req.body.method || 'Manual'
      },
      status: isLate ? 'Late' : 'Present',
      workType: req.body.workType || 'Office'
    });

    res.status(201).json({
      success: true,
      message: 'Checked in successfully',
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/attendance/checkout
// @desc    Check out
// @access  Private
router.put('/checkout', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await Attendance.findOne({
      user: req.user.id,
      date: { $gte: today }
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }

    if (record.checkOut && record.checkOut.time) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out today'
      });
    }

    record.checkOut = {
      time: new Date(),
      location: {
        coordinates: req.body.coordinates || [0, 0],
        address: req.body.address
      },
      method: req.body.method || 'Manual'
    };

    await record.save();

    res.json({
      success: true,
      message: 'Checked out successfully',
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/attendance
// @desc    Create attendance record (for admins)
// @access  Private (Manager+)
router.post('/', protect, authorize('Admin', 'President', 'Vice President', 'CEO', 'Project Manager'), async (req, res) => {
  try {
    const record = await Attendance.create(req.body);

    res.status(201).json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private (Manager+)
router.put('/:id', protect, authorize('Admin', 'President', 'Vice President', 'CEO', 'Project Manager'), async (req, res) => {
  try {
    let record = await Attendance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    record = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    await record.deleteOne();

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
