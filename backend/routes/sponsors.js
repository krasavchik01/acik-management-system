const express = require('express');
const router = express.Router();
const Sponsor = require('../models/Sponsor');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/sponsors
// @desc    Get all sponsors with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { level, status, type, search } = req.query;

    let query = {};

    if (level) query.level = level;
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'contactPerson.name': { $regex: search, $options: 'i' } }
      ];
    }

    const sponsors = await Sponsor.find(query)
      .populate('managedBy', 'name email')
      .populate('events.event', 'title startDate')
      .populate('projects.project', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: sponsors.length,
      data: sponsors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/sponsors/stats
// @desc    Get sponsor statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const total = await Sponsor.countDocuments();
    const active = await Sponsor.countDocuments({ status: 'Active' });

    const sponsors = await Sponsor.find({ status: 'Active' });
    const totalCommitted = sponsors.reduce((sum, s) => sum + (s.sponsorship?.totalCommitted || 0), 0);
    const totalReceived = sponsors.reduce((sum, s) => sum + (s.sponsorship?.totalReceived || 0), 0);

    const byLevel = await Sponsor.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        totalCommitted,
        totalReceived,
        pending: totalCommitted - totalReceived,
        byLevel
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/sponsors/:id
// @desc    Get single sponsor
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id)
      .populate('managedBy', 'name email avatar')
      .populate('events.event', 'title startDate type')
      .populate('projects.project', 'name status');

    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: 'Sponsor not found'
      });
    }

    res.json({
      success: true,
      data: sponsor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/sponsors
// @desc    Create new sponsor
// @access  Private (Manager+)
router.post('/', protect, authorize('Admin', 'President', 'Vice President', 'CEO', 'CFO'), async (req, res) => {
  try {
    req.body.managedBy = req.user.id;

    const sponsor = await Sponsor.create(req.body);

    res.status(201).json({
      success: true,
      data: sponsor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/sponsors/:id
// @desc    Update sponsor
// @access  Private (Manager+)
router.put('/:id', protect, authorize('Admin', 'President', 'Vice President', 'CEO', 'CFO'), async (req, res) => {
  try {
    let sponsor = await Sponsor.findById(req.params.id);

    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: 'Sponsor not found'
      });
    }

    sponsor = await Sponsor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: sponsor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/sponsors/:id
// @desc    Delete sponsor
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('Admin', 'President', 'CEO'), async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);

    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: 'Sponsor not found'
      });
    }

    await sponsor.deleteOne();

    res.json({
      success: true,
      message: 'Sponsor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/sponsors/:id/payments
// @desc    Add payment to sponsor
// @access  Private (Finance+)
router.post('/:id/payments', protect, authorize('Admin', 'President', 'CEO', 'CFO'), async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);

    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: 'Sponsor not found'
      });
    }

    sponsor.payments.push({
      amount: req.body.amount,
      date: req.body.date || Date.now(),
      method: req.body.method,
      reference: req.body.reference,
      status: req.body.status || 'Received'
    });

    await sponsor.save();

    res.json({
      success: true,
      message: 'Payment added successfully',
      data: sponsor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
