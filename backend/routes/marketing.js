const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Marketing campaigns are stored as simple documents
// You can expand this with a Marketing model if needed

// @route   GET /api/marketing/campaigns
// @desc    Get all marketing campaigns
// @access  Private (Marketing+)
router.get('/campaigns', protect, authorize('Admin', 'President', 'CEO', 'Marketing Manager'), async (req, res) => {
  try {
    // Mock data for now - you can create a Campaign model
    const campaigns = [
      {
        id: 1,
        name: 'Social Media Q1 Campaign',
        type: 'Social Media',
        status: 'Active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        budget: 5000,
        reach: 15000,
        engagement: 3500,
        conversions: 250
      },
      {
        id: 2,
        name: 'Email Newsletter Series',
        type: 'Email',
        status: 'Active',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-12-31'),
        budget: 2000,
        reach: 8000,
        engagement: 2400,
        conversions: 180
      }
    ];

    res.json({
      success: true,
      count: campaigns.length,
      data: campaigns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/marketing/analytics
// @desc    Get marketing analytics
// @access  Private (Marketing+)
router.get('/analytics', protect, authorize('Admin', 'President', 'CEO', 'Marketing Manager'), async (req, res) => {
  try {
    const analytics = {
      socialMedia: {
        followers: 12500,
        posts: 245,
        engagement: 8.5,
        reach: 45000
      },
      email: {
        subscribers: 8000,
        campaigns: 12,
        openRate: 32.5,
        clickRate: 4.2
      },
      website: {
        visitors: 25000,
        pageViews: 75000,
        bounceRate: 45.2,
        avgSessionDuration: '3:45'
      },
      podcast: {
        episodes: 24,
        downloads: 15000,
        avgRating: 4.7,
        subscribers: 3500
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/marketing/campaigns
// @desc    Create new campaign
// @access  Private (Marketing+)
router.post('/campaigns', protect, authorize('Admin', 'President', 'CEO', 'Marketing Manager'), async (req, res) => {
  try {
    // Mock response - implement with actual Campaign model
    const campaign = {
      id: Date.now(),
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
