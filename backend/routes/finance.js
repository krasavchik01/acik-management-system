const express = require('express');
const router = express.Router();
const Finance = require('../models/Finance');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/finance
// @desc    Get all financial transactions with filters
// @access  Private (Finance+)
router.get('/', protect, authorize('Admin', 'President', 'CEO', 'CFO'), async (req, res) => {
  try {
    const { type, category, status, startDate, endDate, search } = req.query;

    let query = {};

    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }

    const transactions = await Finance.find(query)
      .populate('project', 'name')
      .populate('event', 'title')
      .populate('sponsor', 'name')
      .populate('member', 'firstName lastName')
      .populate('recordedBy', 'name')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/finance/stats
// @desc    Get financial statistics
// @access  Private (Finance+)
router.get('/stats', protect, authorize('Admin', 'President', 'CEO', 'CFO'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.date = {};
      if (startDate) dateQuery.date.$gte = new Date(startDate);
      if (endDate) dateQuery.date.$lte = new Date(endDate);
    }

    const income = await Finance.aggregate([
      { $match: { type: 'Income', status: 'Completed', ...dateQuery } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const expenses = await Finance.aggregate([
      { $match: { type: 'Expense', status: 'Completed', ...dateQuery } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const incomeByCategory = await Finance.aggregate([
      { $match: { type: 'Income', status: 'Completed', ...dateQuery } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    const expensesByCategory = await Finance.aggregate([
      { $match: { type: 'Expense', status: 'Completed', ...dateQuery } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    const totalIncome = income.length > 0 ? income[0].total : 0;
    const totalExpenses = expenses.length > 0 ? expenses[0].total : 0;

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        incomeByCategory,
        expensesByCategory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/finance/dashboard
// @desc    Get financial dashboard data
// @access  Private (Finance+)
router.get('/dashboard', protect, authorize('Admin', 'President', 'CEO', 'CFO'), async (req, res) => {
  try {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date(currentMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Current month stats
    const currentIncome = await Finance.aggregate([
      { $match: { type: 'Income', status: 'Completed', date: { $gte: currentMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const currentExpenses = await Finance.aggregate([
      { $match: { type: 'Expense', status: 'Completed', date: { $gte: currentMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Last month stats
    const lastMonthIncome = await Finance.aggregate([
      { $match: { type: 'Income', status: 'Completed', date: { $gte: lastMonth, $lt: currentMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const lastMonthExpenses = await Finance.aggregate([
      { $match: { type: 'Expense', status: 'Completed', date: { $gte: lastMonth, $lt: currentMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const currentMonthIncome = currentIncome.length > 0 ? currentIncome[0].total : 0;
    const currentMonthExpenses = currentExpenses.length > 0 ? currentExpenses[0].total : 0;
    const previousMonthIncome = lastMonthIncome.length > 0 ? lastMonthIncome[0].total : 0;
    const previousMonthExpenses = lastMonthExpenses.length > 0 ? lastMonthExpenses[0].total : 0;

    res.json({
      success: true,
      data: {
        currentMonth: {
          income: currentMonthIncome,
          expenses: currentMonthExpenses,
          net: currentMonthIncome - currentMonthExpenses
        },
        lastMonth: {
          income: previousMonthIncome,
          expenses: previousMonthExpenses,
          net: previousMonthIncome - previousMonthExpenses
        },
        trends: {
          incomeChange: previousMonthIncome > 0
            ? ((currentMonthIncome - previousMonthIncome) / previousMonthIncome * 100).toFixed(2)
            : 0,
          expensesChange: previousMonthExpenses > 0
            ? ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses * 100).toFixed(2)
            : 0
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

// @route   GET /api/finance/:id
// @desc    Get single transaction
// @access  Private (Finance+)
router.get('/:id', protect, authorize('Admin', 'President', 'CEO', 'CFO'), async (req, res) => {
  try {
    const transaction = await Finance.findById(req.params.id)
      .populate('project', 'name')
      .populate('event', 'title')
      .populate('sponsor', 'name')
      .populate('member', 'firstName lastName')
      .populate('recordedBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/finance
// @desc    Create new transaction
// @access  Private (Finance+)
router.post('/', protect, authorize('Admin', 'President', 'CEO', 'CFO'), async (req, res) => {
  try {
    req.body.recordedBy = req.user.id;

    const transaction = await Finance.create(req.body);

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/finance/:id
// @desc    Update transaction
// @access  Private (Finance+)
router.put('/:id', protect, authorize('Admin', 'President', 'CEO', 'CFO'), async (req, res) => {
  try {
    let transaction = await Finance.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    transaction = await Finance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/finance/:id
// @desc    Delete transaction
// @access  Private (Admin, CFO only)
router.delete('/:id', protect, authorize('Admin', 'CFO'), async (req, res) => {
  try {
    const transaction = await Finance.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await transaction.deleteOne();

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/finance/:id/approve
// @desc    Approve transaction
// @access  Private (CFO, CEO only)
router.post('/:id/approve', protect, authorize('Admin', 'CEO', 'CFO'), async (req, res) => {
  try {
    const transaction = await Finance.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    transaction.approvedBy = req.user.id;
    transaction.approvedAt = Date.now();
    transaction.status = 'Completed';

    await transaction.save();

    res.json({
      success: true,
      message: 'Transaction approved successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
