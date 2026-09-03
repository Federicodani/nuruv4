const asyncHandler = require('express-async-handler');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');
const ConstructionProject = require('../models/ConstructionProject');
const Professional = require('../models/Professional');
const { COLLABORATOR_PERMISSIONS } = require('../models/ConstructionProject');
const { MILESTONE_TEMPLATES } = require('../models/Milestone');

// ─── Shared access helper (reuses Phase 1 pattern) ──────────────────────────
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
  };
};

// Confirm the milestone belongs to the claimed project
const verifyMilestoneOwnership = async (milestoneId, projectId) => {
  const milestone = await Milestone.findOne({
    _id: milestoneId,
    constructionProject: projectId,
  });
  return milestone;
};

// ─── GET all milestones for a project ───────────────────────────────────────
// @route   GET /api/construction-projects/:id/milestones
// @access  Private (owner or collaborator)
const getMilestones = asyncHandler(async (req, res) => {
  const access = await getProjectAccess(req.params.id, req.user._id);
  if (!access) {
    res.status(403);
    throw new Error('Project not found or access denied');
  }

  const milestones = await Milestone.find({ constructionProject: req.params.id })
    .populate('assignedProfessional', 'profession')
    .sort({ order: 1, createdAt: 1 });

  // Attach task summary counts to each milestone for the overview
  const milestonesWithTasks = await Promise.all(
    milestones.map(async (m) => {
      const tasks = await Task.find({ milestone: m._id }).select('status dueDate').lean();
      const now = new Date();
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
      const overdueTasks = tasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < now &&
          t.status !== 'Completed' &&
          t.status !== 'Cancelled'
      ).length;
      const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;

      return {
        ...m.toObject(),
        taskSummary: { totalTasks, completedTasks, overdueTasks, inProgressTasks },
      };
    })
  );

  res.json({ success: true, count: milestonesWithTasks.length, milestones: milestonesWithTasks });
});

// ─── GET milestone templates ─────────────────────────────────────────────────
// @route   GET /api/construction-projects/:id/milestones/templates
// @access  Private (owner)
const getMilestoneTemplates = asyncHandler(async (req, res) => {
  const access = await getProjectAccess(req.params.id, req.user._id);
  if (!access || !access.isOwner) {
    res.status(403);
    throw new Error('Only the project owner can access milestone templates');
  }

  const projectType = access.project.projectType;
  const template = MILESTONE_TEMPLATES[projectType] || MILESTONE_TEMPLATES.default;

  res.json({ success: true, projectType, template });
});

// ─── CREATE milestone ────────────────────────────────────────────────────────
// @route   POST /api/construction-projects/:id/milestones
// @access  Private (owner or add_updates)
const createMilestone = asyncHandler(async (req, res) => {
  const access = await getProjectAccess(req.params.id, req.user._id);
  if (!access) {
    res.status(403);
    throw new Error('Project not found or access denied');
  }

  const canCreate = access.isOwner || access.permissions.includes('add_updates');
  if (!canCreate) {
    res.status(403);
    throw new Error('You do not have permission to create milestones');
  }

  const {
    name, description, status, priority, order, progress,
    startDate, plannedCompletionDate, assignedProfessional, budget, notes,
  } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Milestone name is required');
  }

  // Validate assigned professional is in the project team
  if (assignedProfessional) {
    const inTeam = access.project.collaborators.some(
      (c) => c.professional.toString() === assignedProfessional
    );
    if (!inTeam) {
      res.status(400);
      throw new Error('Assigned professional must be a member of the project team');
    }
  }

  // Default order = last existing + 1
  const lastMilestone = await Milestone.findOne({ constructionProject: req.params.id })
    .sort({ order: -1 })
    .select('order');
  const nextOrder = order !== undefined ? Number(order) : (lastMilestone?.order ?? -1) + 1;

  const milestone = await Milestone.create({
    constructionProject: req.params.id,
    name,
    description,
    status: status || 'Not Started',
    priority: priority || 'Medium',
    order: nextOrder,
    progress: progress !== undefined ? Number(progress) : 0,
    startDate: startDate || null,
    plannedCompletionDate: plannedCompletionDate || null,
    assignedProfessional: assignedProfessional || null,
    budget: budget ? Number(budget) : null,
    notes: notes || '',
  });

  await milestone.populate('assignedProfessional', 'profession');
  res.status(201).json({ success: true, milestone });
});

// ─── APPLY template milestones in bulk ──────────────────────────────────────
// @route   POST /api/construction-projects/:id/milestones/apply-template
// @access  Private (owner)
const applyTemplate = asyncHandler(async (req, res) => {
  const access = await getProjectAccess(req.params.id, req.user._id);
  if (!access || !access.isOwner) {
    res.status(403);
    throw new Error('Only the project owner can apply templates');
  }

  const { names } = req.body; // array of milestone names to create
  if (!Array.isArray(names) || names.length === 0) {
    res.status(400);
    throw new Error('names array is required');
  }

  const existing = await Milestone.find({ constructionProject: req.params.id }).select('order');
  const startOrder = existing.length > 0 ? Math.max(...existing.map((m) => m.order)) + 1 : 0;

  const toInsert = names.map((name, i) => ({
    constructionProject: req.params.id,
    name,
    order: startOrder + i,
    status: 'Not Started',
    priority: 'Medium',
    progress: 0,
  }));

  const milestones = await Milestone.insertMany(toInsert);
  res.status(201).json({ success: true, count: milestones.length, milestones });
});

// ─── UPDATE milestone ────────────────────────────────────────────────────────
// @route   PUT /api/construction-projects/:id/milestones/:milestoneId
// @access  Private (owner or add_updates for own assigned)
const updateMilestone = asyncHandler(async (req, res) => {
  const access = await getProjectAccess(req.params.id, req.user._id);
  if (!access) {
    res.status(403);
    throw new Error('Project not found or access denied');
  }

  const milestone = await verifyMilestoneOwnership(req.params.milestoneId, req.params.id);
  if (!milestone) {
    res.status(404);
    throw new Error('Milestone not found in this project');
  }

  const canEdit = access.isOwner || access.permissions.includes('add_updates');
  if (!canEdit) {
    res.status(403);
    throw new Error('You do not have permission to edit milestones');
  }

  if (req.body.assignedProfessional) {
    const inTeam = access.project.collaborators.some(
      (c) => c.professional.toString() === req.body.assignedProfessional
    );
    if (!inTeam) {
      res.status(400);
      throw new Error('Assigned professional must be a member of the project team');
    }
  }

  const editable = [
    'name', 'description', 'status', 'priority', 'order', 'progress',
    'startDate', 'plannedCompletionDate', 'actualCompletionDate',
    'assignedProfessional', 'budget', 'notes',
  ];
  editable.forEach((f) => {
    if (req.body[f] !== undefined) milestone[f] = req.body[f];
  });

  await milestone.save(); // triggers pre-save validation
  await milestone.populate('assignedProfessional', 'profession');

  res.json({ success: true, milestone });
});

// ─── REORDER milestones ──────────────────────────────────────────────────────
// @route   PUT /api/construction-projects/:id/milestones/reorder
// @access  Private (owner)
const reorderMilestones = asyncHandler(async (req, res) => {
  const access = await getProjectAccess(req.params.id, req.user._id);
  if (!access || !access.isOwner) {
    res.status(403);
    throw new Error('Only the project owner can reorder milestones');
  }

  const { orderedIds } = req.body; // array of milestone _ids in desired order
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    res.status(400);
    throw new Error('orderedIds array is required');
  }

  const updates = orderedIds.map((id, index) =>
    Milestone.updateOne(
      { _id: id, constructionProject: req.params.id },
      { $set: { order: index } }
    )
  );
  await Promise.all(updates);

  const milestones = await Milestone.find({ constructionProject: req.params.id })
    .sort({ order: 1 });

  res.json({ success: true, milestones });
});

// ─── DELETE milestone ────────────────────────────────────────────────────────
// @route   DELETE /api/construction-projects/:id/milestones/:milestoneId
// @access  Private (owner only)
const deleteMilestone = asyncHandler(async (req, res) => {
  const access = await getProjectAccess(req.params.id, req.user._id);
  if (!access || !access.isOwner) {
    res.status(403);
    throw new Error('Only the project owner can delete milestones');
  }

  const milestone = await verifyMilestoneOwnership(req.params.milestoneId, req.params.id);
  if (!milestone) {
    res.status(404);
    throw new Error('Milestone not found in this project');
  }

  // Cascade-delete tasks belonging to this milestone
  await Task.deleteMany({ milestone: milestone._id });
  await milestone.deleteOne();

  res.json({ success: true, message: 'Milestone and its tasks deleted successfully' });
});

// ─── GET milestone stats for analytics integration ───────────────────────────
// @route   GET /api/construction-projects/:id/milestones/stats
// @access  Private (owner or collaborator)
const getMilestoneStats = asyncHandler(async (req, res) => {
  const access = await getProjectAccess(req.params.id, req.user._id);
  if (!access) {
    res.status(403);
    throw new Error('Access denied');
  }

  const milestones = await Milestone.find({ constructionProject: req.params.id }).lean();
  const tasks = await Task.find({ constructionProject: req.params.id }).lean();

  const now = new Date();

  const mStats = {
    total: milestones.length,
    completed: milestones.filter((m) => m.status === 'Completed').length,
    inProgress: milestones.filter((m) => m.status === 'In Progress').length,
    delayed: milestones.filter((m) => m.status === 'Delayed').length,
    notStarted: milestones.filter((m) => m.status === 'Not Started').length,
    onHold: milestones.filter((m) => m.status === 'On Hold').length,
    overdue: milestones.filter(
      (m) =>
        m.plannedCompletionDate &&
        new Date(m.plannedCompletionDate) < now &&
        m.status !== 'Completed'
    ).length,
    avgProgress:
      milestones.length > 0
        ? Math.round(milestones.reduce((s, m) => s + m.progress, 0) / milestones.length)
        : 0,
  };

  const tStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'Completed').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    todo: tasks.filter((t) => t.status === 'To Do').length,
    delayed: tasks.filter((t) => t.status === 'Delayed').length,
    cancelled: tasks.filter((t) => t.status === 'Cancelled').length,
    overdue: tasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) < now &&
        t.status !== 'Completed' &&
        t.status !== 'Cancelled'
    ).length,
  };

  // Calculated project progress from milestones (average, ignoring cancelled)
  const activeMilestones = milestones.filter((m) => m.status !== 'On Hold');
  const milestoneBasedProgress =
    activeMilestones.length > 0
      ? Math.round(
          activeMilestones.reduce((s, m) => s + m.progress, 0) / activeMilestones.length
        )
      : null;

  res.json({
    success: true,
    milestoneStats: mStats,
    taskStats: tStats,
    milestoneBasedProgress,
  });
});

module.exports = {
  getMilestones,
  getMilestoneTemplates,
  createMilestone,
  applyTemplate,
  updateMilestone,
  reorderMilestones,
  deleteMilestone,
  getMilestoneStats,
};
