const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const ConstructionProject = require('../models/ConstructionProject');
const Professional = require('../models/Professional');
const { COLLABORATOR_PERMISSIONS } = require('../models/ConstructionProject');

// ─── Shared access helper ────────────────────────────────────────────────────
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

  return {
    project,
    isOwner: false,
    permissions: COLLABORATOR_PERMISSIONS[collab.role] || ['view'],
    collaboratorRole: collab.role,
    professional: collab.professional,
  };
};

// Confirm task belongs to the claimed milestone and project
const verifyTaskOwnership = async (taskId, milestoneId, projectId) => {
  return Task.findOne({
    _id: taskId,
    milestone: milestoneId,
    constructionProject: projectId,
  });
};

// ─── GET tasks for a milestone ───────────────────────────────────────────────
// @route   GET /api/construction-projects/:id/milestones/:milestoneId/tasks
// @access  Private (owner or collaborator)
const getTasks = asyncHandler(async (req, res) => {
  const access = await getProjectAccess(req.params.id, req.user._id);
  if (!access) {
    res.status(403);
    throw new Error('Access denied');
  }

  const milestoneExists = await Milestone.findOne({
    _id: req.params.milestoneId,
    constructionProject: req.params.id,
  });
  if (!milestoneExists) {
    res.status(404);
    throw new Error('Milestone not found in this project');
  }

  const tasks = await Task.find({
    milestone: req.params.milestoneId,
    constructionProject: req.params.id,
  })
    .populate({
      path: 'assignedProfessional',
      select: 'profession',
      populate: { path: 'user', select: 'fullName' },
    })
    .populate('expense', 'amount category description')
    .sort({ createdAt: 1 });

  // Annotate with overdue flag
  const now = new Date();
  const annotated = tasks.map((t) => ({
    ...t.toObject(),
    isOverdue:
      t.dueDate &&
      new Date(t.dueDate) < now &&
      t.status !== 'Completed' &&
      t.status !== 'Cancelled',
    daysOverdue:
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'Completed'
        ? Math.floor((now - new Date(t.dueDate)) / (1000 * 60 * 60 * 24))
        : 0,
  }));

  res.json({ success: true, count: annotated.length, tasks: annotated });
});

// ─── GET tasks assigned to current professional across all projects ───────────
// @route   GET /api/construction-projects/my-tasks
// @access  Private (professional)
const getMyAssignedTasks = asyncHandler(async (req, res) => {
  const professional = await Professional.findOne({ user: req.user._id });
  if (!professional) {
    res.status(404);
    throw new Error('Professional profile not found');
  }

  const tasks = await Task.find({
    assignedProfessional: professional._id,
    status: { $nin: ['Cancelled'] },
  })
    .populate('milestone', 'name status')
    .populate('constructionProject', 'projectName owner')
    .sort({ dueDate: 1, createdAt: -1 });

  const now = new Date();
  const annotated = tasks.map((t) => ({
    ...t.toObject(),
    isOverdue:
      t.dueDate &&
      new Date(t.dueDate) < now &&
      t.status !== 'Completed',
  }));

  res.json({ success: true, count: annotated.length, tasks: annotated });
});

// ─── CREATE task ─────────────────────────────────────────────────────────────
// @route   POST /api/construction-projects/:id/milestones/:milestoneId/tasks
// @access  Private (owner or add_updates)
const createTask = asyncHandler(async (req, res) => {
  const access = await getProjectAccess(req.params.id, req.user._id);
  if (!access) {
    res.status(403);
    throw new Error('Access denied');
  }

  const canCreate = access.isOwner || access.permissions.includes('add_updates');
  if (!canCreate) {
    res.status(403);
    throw new Error('You do not have permission to create tasks');
  }

  const milestone = await Milestone.findOne({
    _id: req.params.milestoneId,
    constructionProject: req.params.id,
  });
  if (!milestone) {
    res.status(404);
    throw new Error('Milestone not found in this project');
  }

  const {
    title, description, status, priority, progress,
    assignedProfessional, startDate, dueDate, notes, expense,
  } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Task title is required');
  }

  // Validate assigned professional is in the team
  if (assignedProfessional) {
    const inTeam = access.project.collaborators.some(
      (c) => c.professional.toString() === assignedProfessional
    );
    if (!inTeam) {
      res.status(400);
      throw new Error('Assigned professional must be a member of the project team');
    }
  }

  const task = await Task.create({
    constructionProject: req.params.id,
    milestone: req.params.milestoneId,
    title,
    description: description || '',
    status: status || 'To Do',
    priority: priority || 'Medium',
    progress: progress !== undefined ? Number(progress) : 0,
    assignedProfessional: assignedProfessional || null,
    startDate: startDate || null,
    dueDate: dueDate || null,
    notes: notes || '',
    expense: expense || null,
    lastUpdatedBy: req.user._id,
  });

  await task.populate([
    { path: 'assignedProfessional', select: 'profession', populate: { path: 'user', select: 'fullName' } },
    { path: 'expense', select: 'amount category description' },
  ]);

  res.status(201).json({ success: true, task });
});

// ─── UPDATE task ─────────────────────────────────────────────────────────────
// @route   PUT /api/construction-projects/:id/milestones/:milestoneId/tasks/:taskId
// @access  Private (owner or assigned professional with add_updates)
const updateTask = asyncHandler(async (req, res) => {
  const access = await getProjectAccess(req.params.id, req.user._id);
  if (!access) {
    res.status(403);
    throw new Error('Access denied');
  }

  const task = await verifyTaskOwnership(req.params.taskId, req.params.milestoneId, req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Owner can edit anything; collaborators can only update if they are assigned or have add_updates
  const isAssigned =
    access.professional &&
    task.assignedProfessional?.toString() === access.professional._id?.toString();
  const canEdit =
    access.isOwner ||
    (access.permissions.includes('add_updates') && isAssigned);

  if (!canEdit) {
    res.status(403);
    throw new Error('You can only update tasks assigned to you');
  }

  const editable = [
    'title', 'description', 'status', 'priority', 'progress',
    'assignedProfessional', 'startDate', 'dueDate', 'notes', 'expense',
  ];
  editable.forEach((f) => {
    if (req.body[f] !== undefined) task[f] = req.body[f];
  });

  task.lastUpdatedBy = req.user._id;
  await task.save();

  await task.populate([
    { path: 'assignedProfessional', select: 'profession', populate: { path: 'user', select: 'fullName' } },
    { path: 'expense', select: 'amount category description' },
  ]);

  res.json({ success: true, task });
});

// ─── DELETE task ─────────────────────────────────────────────────────────────
// @route   DELETE /api/construction-projects/:id/milestones/:milestoneId/tasks/:taskId
// @access  Private (owner only)
const deleteTask = asyncHandler(async (req, res) => {
  const access = await getProjectAccess(req.params.id, req.user._id);
  if (!access || !access.isOwner) {
    res.status(403);
    throw new Error('Only the project owner can delete tasks');
  }

  const task = await verifyTaskOwnership(req.params.taskId, req.params.milestoneId, req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await task.deleteOne();
  res.json({ success: true, message: 'Task deleted successfully' });
});

module.exports = {
  getTasks,
  getMyAssignedTasks,
  createTask,
  updateTask,
  deleteTask,
};
