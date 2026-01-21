const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/reports
// @desc    Get all reports with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, category, status, search } = req.query;

    let query = {};

    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }

    const reports = await Report.find(query)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('reviewers.user', 'name email')
      .sort({ 'period.startDate': -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/reports/:id
// @desc    Get single report
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('approvedBy', 'name email avatar')
      .populate('reviewers.user', 'name email avatar')
      .populate('projects.project', 'name status progress')
      .populate('events.event', 'title startDate');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Increment views
    report.views += 1;
    await report.save();

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/reports
// @desc    Create new report
// @access  Private (Manager+)
router.post('/', protect, authorize('Admin', 'President', 'Vice President', 'CEO', 'CFO', 'Project Manager'), async (req, res) => {
  try {
    req.body.createdBy = req.user.id;

    const report = await Report.create(req.body);

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/reports/:id
// @desc    Update report
// @access  Private (Creator or Manager+)
router.put('/:id', protect, async (req, res) => {
  try {
    let report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user is creator or has authority
    if (report.createdBy.toString() !== req.user.id &&
        !['Admin', 'President', 'CEO'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    report = await Report.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/reports/:id
// @desc    Delete report
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('Admin', 'President', 'CEO'), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.deleteOne();

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/reports/:id/review
// @desc    Add review to report
// @access  Private (Manager+)
router.post('/:id/review', protect, authorize('Admin', 'President', 'Vice President', 'CEO', 'CFO'), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const { status, comments } = req.body;

    // Check if user already reviewed
    const existingReview = report.reviewers.find(
      r => r.user.toString() === req.user.id
    );

    if (existingReview) {
      existingReview.status = status;
      existingReview.comments = comments;
      existingReview.reviewedAt = Date.now();
    } else {
      report.reviewers.push({
        user: req.user.id,
        status,
        comments,
        reviewedAt: Date.now()
      });
    }

    // Update report status if approved
    if (status === 'Approved') {
      const allApproved = report.reviewers.every(r => r.status === 'Approved');
      if (allApproved) {
        report.status = 'Approved';
        report.approvedBy = req.user.id;
        report.approvedAt = Date.now();
      }
    }

    await report.save();

    res.json({
      success: true,
      message: 'Review added successfully',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/reports/:id/publish
// @desc    Publish report
// @access  Private (Manager+)
router.post('/:id/publish', protect, authorize('Admin', 'President', 'CEO'), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    if (report.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Report must be approved before publishing'
      });
    }

    report.status = 'Published';
    report.publishedAt = Date.now();
    await report.save();

    res.json({
      success: true,
      message: 'Report published successfully',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
