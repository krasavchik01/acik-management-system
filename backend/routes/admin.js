const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Member = require('../models/Member');
const Event = require('../models/Event');
const Finance = require('../models/Finance');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', protect, authorize('Admin', 'President', 'CEO'), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (including role)
// @access  Private (Admin only)
router.put('/users/:id', protect, authorize('Admin', 'President'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/users/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', protect, authorize('Admin', 'President', 'CEO'), async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'Active' });
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'Done' });
    const totalMembers = await Member.countDocuments();
    const activeMembers = await Member.countDocuments({ status: 'Active' });
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({
      startDate: { $gte: new Date() },
      status: { $ne: 'Cancelled' }
    });

    // Get financial data
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyIncome = await Finance.aggregate([
      { $match: { type: 'Income', status: 'Completed', date: { $gte: currentMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const monthlyExpenses = await Finance.aggregate([
      { $match: { type: 'Expense', status: 'Completed', date: { $gte: currentMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get recent activities
    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('manager', 'name');

    const recentTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedTo', 'name')
      .populate('project', 'name');

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers
        },
        projects: {
          total: totalProjects,
          active: activeProjects
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0
        },
        members: {
          total: totalMembers,
          active: activeMembers
        },
        events: {
          total: totalEvents,
          upcoming: upcomingEvents
        },
        finance: {
          monthlyIncome: monthlyIncome.length > 0 ? monthlyIncome[0].total : 0,
          monthlyExpenses: monthlyExpenses.length > 0 ? monthlyExpenses[0].total : 0,
          monthlyNet: (monthlyIncome.length > 0 ? monthlyIncome[0].total : 0) -
                      (monthlyExpenses.length > 0 ? monthlyExpenses[0].total : 0)
        },
        recentActivity: {
          projects: recentProjects,
          tasks: recentTasks
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

// @route   POST /api/admin/users/:id/activate
// @desc    Activate/deactivate user
// @access  Private (Admin only)
router.post('/users/:id/activate', protect, authorize('Admin', 'President'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/system-info
// @desc    Get system information
// @access  Private (Admin only)
router.get('/system-info', protect, authorize('Admin'), async (req, res) => {
  try {
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV,
      databaseStatus: 'Connected'
    };

    res.json({
      success: true,
      data: systemInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
