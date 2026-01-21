const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/projects
// @desc    Get all projects with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, category, priority, manager, search } = req.query;

    // Build query
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (manager) query.manager = manager;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query)
      .populate('manager', 'name email role')
      .populate('team.user', 'name email avatar')
      .sort({ createdAt: -1 });

    // Get task count for each project
    const projectsWithTasks = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        const completedTasks = await Task.countDocuments({ project: project._id, status: 'Done' });
        return {
          ...project.toObject(),
          taskCount,
          completedTasks
        };
      })
    );

    res.json({
      success: true,
      count: projectsWithTasks.length,
      data: projectsWithTasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/projects/stats
// @desc    Get project statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const total = await Project.countDocuments();
    const active = await Project.countDocuments({ status: 'Active' });
    const completed = await Project.countDocuments({ status: 'Completed' });
    const planning = await Project.countDocuments({ status: 'Planning' });

    const projects = await Project.find();
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget?.allocated || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.budget?.spent || 0), 0);

    res.json({
      success: true,
      data: {
        total,
        active,
        completed,
        planning,
        totalBudget,
        totalSpent,
        budgetRemaining: totalBudget - totalSpent
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email role avatar')
      .populate('team.user', 'name email avatar role')
      .populate('notes.author', 'name avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get tasks for this project
    const tasks = await Task.find({ project: req.params.id })
      .populate('assignedTo', 'name avatar');

    res.json({
      success: true,
      data: {
        ...project.toObject(),
        tasks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (Manager+)
router.post('/', protect, authorize('Admin', 'President', 'Vice President', 'CEO', 'Project Manager'), async (req, res) => {
  try {
    req.body.manager = req.user.id;

    const project = await Project.create(req.body);

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Manager+)
router.put('/:id', protect, authorize('Admin', 'President', 'Vice President', 'CEO', 'Project Manager'), async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('Admin', 'President', 'CEO'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id });

    await project.deleteOne();

    res.json({
      success: true,
      message: 'Project and associated tasks deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/projects/:id/notes
// @desc    Add note to project
// @access  Private
router.post('/:id/notes', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project.notes.push({
      content: req.body.content,
      author: req.user.id
    });

    await project.save();

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
