const asyncHandler = require('express-async-handler');
const Expense = require('../models/Expense');
const ConstructionProject = require('../models/ConstructionProject');
const { COLLABORATOR_PERMISSIONS } = require('../models/ConstructionProject');
const Professional = require('../models/Professional');

// ─── Permission Helper ───────────────────────────────────────────────────────

const getProjectAccess = async (projectId, userId) => {
  const project = await ConstructionProject.findById(projectId).populate({
    path: 'collaborators.professional',
    populate: { path: 'user', select: '_id' },
  });

  if (!project) return null;

  const isOwner = project.owner.toString() === userId.toString();
  if (isOwner) return { project, isOwner: true, permissions: ['*'] };

  const collab = project.collaborators.find(
    (c) => c.professional?.user?._id?.toString() === userId.toString()
  );

  if (!collab) return null;

  const permissions = COLLABORATOR_PERMISSIONS[collab.role] || ['view'];
  return { project, isOwner: false, permissions, collaboratorRole: collab.role };
};

// ─── Expense CRUD ────────────────────────────────────────────────────────────

// @desc    Add an expense to a construction project
// @route   POST /api/construction-projects/:id/expenses
// @access  Private (owner or authorized collaborator)
const addExpense = asyncHandler(async (req, res) => {
  const access = await getProjectAccess(req.params.id, req.user._id);
  if (!access) {
    res.status(403);
    throw new Error('Project not found or access denied');
  }

  const canAdd = access.isOwner || access.permissions.includes('add_expenses');
  if (!canAdd) {
    res.status(403);
    throw new Error('You do not have permission to add expenses to this project');
  }

  const {
    amount, category, description, date, paymentMethod,
    stage, supplier, professional: profId, product, notes,
  } = req.body;

  if (!amount || !category || !description) {
    res.status(400);
    throw new Error('Amount, category, and description are required');
  }

  const receipt = req.file
    ? { url: req.file.path, publicId: req.file.filename }
    : { url: '', publicId: '' };

  const expense = await Expense.create({
    constructionProject: req.params.id,
    recordedBy: req.user._id,
    amount: Number(amount),
    category,
    description,
    date: date ? new Date(date) : new Date(),
    paymentMethod: paymentMethod || 'Cash',
    stage: stage || null,
    supplier: supplier || null,
    professional: profId || null,
    product: product || null,
    receipt,
    notes: notes || '',
  });

  await expense.populate([
    { path: 'supplier', select: 'storeName town county' },
    { path: 'professional', select: 'profession', populate: { path: 'user', select: 'fullName' } },
    { path: 'product', select: 'name category' },
    { path: 'recordedBy', select: 'fullName' },
  ]);

  res.status(201).json({ success: true, expense });
});

// @desc    Get all expenses for a project
// @route   GET /api/construction-projects/:id/expenses
// @access  Private (owner or collaborator)
const getExpenses = asyncHandler(async (req, res) => {
  const access = await getProjectAccess(req.params.id, req.user._id);
  if (!access) {
    res.status(403);
    throw new Error('Project not found or access denied');
  }

  const { page = 1, limit = 20, category, stage } = req.query;
  const filter = { constructionProject: req.params.id };
  if (category) filter.category = category;
  if (stage) filter.stage = stage;

  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .populate('supplier', 'storeName')
      .populate({ path: 'professional', populate: { path: 'user', select: 'fullName' } })
      .populate('product', 'name')
      .populate('recordedBy', 'fullName')
      .sort({ date: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
    Expense.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: expenses.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    expenses,
  });
});

// @desc    Get a single expense
// @route   GET /api/construction-projects/:id/expenses/:expenseId
// @access  Private (owner or collaborator)
const getExpenseById = asyncHandler(async (req, res) => {
  const access = await getProjectAccess(req.params.id, req.user._id);
  if (!access) {
    res.status(403);
    throw new Error('Project not found or access denied');
  }

  const expense = await Expense.findOne({
    _id: req.params.expenseId,
    constructionProject: req.params.id,
  })
    .populate('supplier', 'storeName town')
    .populate({ path: 'professional', populate: { path: 'user', select: 'fullName' } })
    .populate('product', 'name category')
    .populate('recordedBy', 'fullName');

  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }

  res.json({ success: true, expense });
});

// @desc    Update an expense
// @route   PUT /api/construction-projects/:id/expenses/:expenseId
// @access  Private (owner or the person who recorded it with add_expenses permission)
const updateExpense = asyncHandler(async (req, res) => {
  const access = await getProjectAccess(req.params.id, req.user._id);
  if (!access) {
    res.status(403);
    throw new Error('Project not found or access denied');
  }

  const expense = await Expense.findOne({
    _id: req.params.expenseId,
    constructionProject: req.params.id,
  });

  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }

  // Only owner or the original recorder can edit
  const canEdit =
    access.isOwner || expense.recordedBy.toString() === req.user._id.toString();

  if (!canEdit) {
    res.status(403);
    throw new Error('You can only edit expenses you recorded yourself');
  }

  const editable = [
    'amount', 'category', 'description', 'date', 'paymentMethod',
    'stage', 'supplier', 'professional', 'product', 'notes',
  ];

  editable.forEach((f) => {
    if (req.body[f] !== undefined) expense[f] = req.body[f];
  });

  if (req.file) {
    expense.receipt = { url: req.file.path, publicId: req.file.filename };
  }

  await expense.save();
  await expense.populate([
    { path: 'supplier', select: 'storeName' },
    { path: 'professional', populate: { path: 'user', select: 'fullName' } },
    { path: 'product', select: 'name' },
    { path: 'recordedBy', select: 'fullName' },
  ]);

  res.json({ success: true, expense });
});

// @desc    Delete an expense
// @route   DELETE /api/construction-projects/:id/expenses/:expenseId
// @access  Private (owner or original recorder)
const deleteExpense = asyncHandler(async (req, res) => {
  const access = await getProjectAccess(req.params.id, req.user._id);
  if (!access) {
    res.status(403);
    throw new Error('Project not found or access denied');
  }

  const expense = await Expense.findOne({
    _id: req.params.expenseId,
    constructionProject: req.params.id,
  });

  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }

  const canDelete =
    access.isOwner || expense.recordedBy.toString() === req.user._id.toString();

  if (!canDelete) {
    res.status(403);
    throw new Error('You can only delete expenses you recorded yourself');
  }

  await expense.deleteOne();
  res.json({ success: true, message: 'Expense deleted successfully' });
});

module.exports = { addExpense, getExpenses, getExpenseById, updateExpense, deleteExpense };
