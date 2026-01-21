const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/members
// @desc    Get all members with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, status, search } = req.query;

    let query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const members = await Member.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/members/stats
// @desc    Get member statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const total = await Member.countDocuments();
    const active = await Member.countDocuments({ status: 'Active' });
    const inactive = await Member.countDocuments({ status: 'Inactive' });

    const categories = await Member.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive,
        categories
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/members/:id
// @desc    Get single member
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('eventsAttended.event', 'title startDate type');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/members
// @desc    Create new member
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const member = await Member.create(req.body);

    res.status(201).json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/members/:id
// @desc    Update member
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/members/:id
// @desc    Delete member
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('Admin', 'President', 'CEO'), async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    await member.deleteOne();

    res.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/members/bulk
// @desc    Bulk import members
// @access  Private (Admin only)
router.post('/bulk', protect, authorize('Admin', 'President', 'CEO'), async (req, res) => {
  try {
    const { members } = req.body;

    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of members'
      });
    }

    const createdMembers = await Member.insertMany(members);

    res.status(201).json({
      success: true,
      count: createdMembers.length,
      data: createdMembers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
