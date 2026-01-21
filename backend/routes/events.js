const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Member = require('../models/Member');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/events
// @desc    Get all events with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, status, search, upcoming } = req.query;

    let query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (upcoming === 'true') {
      query.startDate = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ startDate: -1 });

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/events/stats
// @desc    Get event statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const total = await Event.countDocuments();
    const upcoming = await Event.countDocuments({
      startDate: { $gte: new Date() },
      status: { $ne: 'Cancelled' }
    });
    const completed = await Event.countDocuments({ status: 'Completed' });

    const events = await Event.find();
    const totalAttendees = events.reduce((sum, e) => sum + (e.registrations?.length || 0), 0);

    res.json({
      success: true,
      data: {
        total,
        upcoming,
        completed,
        totalAttendees
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email avatar')
      .populate('registrations.member', 'firstName lastName email')
      .populate('feedback.member', 'firstName lastName');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private (Organizer+)
router.post('/', protect, authorize('Admin', 'President', 'Vice President', 'CEO', 'Marketing Manager'), async (req, res) => {
  try {
    req.body.organizer = req.user.id;

    const event = await Event.create(req.body);

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Organizer+)
router.put('/:id', protect, authorize('Admin', 'President', 'Vice President', 'CEO', 'Marketing Manager'), async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('Admin', 'President', 'CEO'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/events/:id/register
// @desc    Register member for event
// @access  Private
router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const { memberId, ticketType } = req.body;

    // Check if member exists
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check if already registered
    const alreadyRegistered = event.registrations.some(
      r => r.member.toString() === memberId
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'Member already registered for this event'
      });
    }

    // Check capacity
    if (event.capacity > 0 && event.registrations.length >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event is at full capacity'
      });
    }

    event.registrations.push({
      member: memberId,
      ticketType,
      paymentStatus: event.pricing.isFree ? 'Paid' : 'Pending'
    });

    await event.save();

    // Add event to member's eventsAttended
    member.eventsAttended.push({
      event: event._id,
      attendedAt: new Date()
    });
    await member.save();

    res.json({
      success: true,
      message: 'Successfully registered for event',
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/events/:id/feedback
// @desc    Add feedback to event
// @access  Private
router.post('/:id/feedback', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const { memberId, rating, comment } = req.body;

    event.feedback.push({
      member: memberId,
      rating,
      comment
    });

    await event.save();

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
