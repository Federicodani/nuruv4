const asyncHandler = require('express-async-handler');
const ConstructionProject = require('../models/ConstructionProject');
const Expense = require('../models/Expense');
const Professional = require('../models/Professional');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');
const {
  CONSTRUCTION_STAGES,
  CONSTRUCTION_PROJECT_TYPES,
  COLLABORATOR_ROLES,
  COLLABORATOR_PERMISSIONS,
} = require('../models/ConstructionProject');

// ─── Helpers ────────────────────────────────────────────────────────────────

// Verify the request user owns the project OR is an authorized collaborator
const getProjectWithAccess = async (projectId, userId, requireOwner = false) => {
  const project = await ConstructionProject.findById(projectId)
    .populate({ path: 'collaborators.professional', populate: { path: 'user', select: '_id' } });

  if (!project) return null;

  const isOwner = project.owner.toString() === userId.toString();
  if (isOwner) return { project, isOwner: true, collaboratorRole: null };

  if (requireOwner) return null;

  const collab = project.collaborators.find(
    (c) => c.professional?.user?._id?.toString() === userId.toString()
  );

  if (!collab) return null;
  return { project, isOwner: false, collaboratorRole: collab.role };
};

// ─── Project CRUD ────────────────────────────────────────────────────────────

// @desc    Create a live construction project
// @route   POST /api/construction-projects
// @access  Private (client)
const createConstructionProject = asyncHandler(async (req, res) => {
  const {
    projectName, projectType, county, town, budget,
    startDate, expectedCompletionDate, description, currentStage,
  } = req.body;

  if (!projectName || !projectType || !county || !budget) {
    res.status(400);
    throw new Error('Project name, type, county, and budget are required');
  }

  const project = await ConstructionProject.create({
    owner: req.user._id,
    projectName,
    projectType,
    county,
    town: town || '',
    budget: Number(budget),
    startDate: startDate || null,
    expectedCompletionDate: expectedCompletionDate || null,
    description: description || '',
    currentStage: currentStage || 'Planning & Design',
  });

  res.status(201).json({ success: true, project });
});

// @desc    Get all live construction projects for the logged-in client
// @route   GET /api/construction-projects
// @access  Private (client)
const getMyConstructionProjects = asyncHandler(async (req, res) => {
  const projects = await ConstructionProject.find({
    owner: req.user._id,
    isArchived: false,
  }).sort({ createdAt: -1 });

  res.json({ success: true, count: projects.length, projects });
});

// @desc    Get a single construction project (owner or collaborator)
// @route   GET /api/construction-projects/:id
// @access  Private
const getConstructionProjectById = asyncHandler(async (req, res) => {
  const result = await getProjectWithAccess(req.params.id, req.user._id);

  if (!result) {
    res.status(404);
    throw new Error('Project not found or access denied');
  }

  const { project } = result;

  // Populate collaborators fully for the detail view
  await project.populate([
    { path: 'owner', select: 'fullName email phone' },
    {
      path: 'collaborators.professional',
      select: 'profession county town profileImage averageRating',
      populate: { path: 'user', select: 'fullName phone' },
    },
  ]);

  res.json({ success: true, project });
});

// @desc    Update a construction project (owner only)
// @route   PUT /api/construction-projects/:id
// @access  Private (owner)
const updateConstructionProject = asyncHandler(async (req, res) => {
  const result = await getProjectWithAccess(req.params.id, req.user._id, true);

  if (!result) {
    res.status(404);
    throw new Error('Project not found or you are not the owner');
  }

  const { project } = result;
  const fields = [
    'projectName', 'projectType', 'county', 'town', 'budget',
    'startDate', 'expectedCompletionDate', 'currentStage', 'progress', 'description',
  ];

  fields.forEach((f) => {
    if (req.body[f] !== undefined) project[f] = req.body[f];
  });

  await project.save();
  res.json({ success: true, project });
});

// @desc    Archive (soft-delete) a construction project
// @route   DELETE /api/construction-projects/:id
// @access  Private (owner)
const archiveConstructionProject = asyncHandler(async (req, res) => {
  const result = await getProjectWithAccess(req.params.id, req.user._id, true);

  if (!result) {
    res.status(404);
    throw new Error('Project not found or you are not the owner');
  }

  result.project.isArchived = true;
  await result.project.save();

  res.json({ success: true, message: 'Project archived successfully' });
});

// ─── Collaboration ───────────────────────────────────────────────────────────

// @desc    Add a professional collaborator to a project
// @route   POST /api/construction-projects/:id/collaborators
// @access  Private (owner)
const addCollaborator = asyncHandler(async (req, res) => {
  const { professionalId, role } = req.body;

  if (!professionalId || !role) {
    res.status(400);
    throw new Error('Professional ID and role are required');
  }
  if (!COLLABORATOR_ROLES.includes(role)) {
    res.status(400);
    throw new Error(`Invalid role. Must be one of: ${COLLABORATOR_ROLES.join(', ')}`);
  }

  const result = await getProjectWithAccess(req.params.id, req.user._id, true);
  if (!result) {
    res.status(404);
    throw new Error('Project not found or you are not the owner');
  }

  const professional = await Professional.findById(professionalId);
  if (!professional) {
    res.status(404);
    throw new Error('Professional not found on Nuru');
  }

  const { project } = result;

  // Prevent duplicate
  const alreadyAdded = project.collaborators.some(
    (c) => c.professional.toString() === professionalId
  );
  if (alreadyAdded) {
    res.status(400);
    throw new Error('This professional is already in the project team');
  }

  project.collaborators.push({ professional: professionalId, role });
  await project.save();

  await project.populate([
    {
      path: 'collaborators.professional',
      select: 'profession county town profileImage averageRating',
      populate: { path: 'user', select: 'fullName phone' },
    },
  ]);

  res.status(201).json({ success: true, collaborators: project.collaborators });
});

// @desc    Remove a collaborator from a project
// @route   DELETE /api/construction-projects/:id/collaborators/:collaboratorId
// @access  Private (owner)
const removeCollaborator = asyncHandler(async (req, res) => {
  const result = await getProjectWithAccess(req.params.id, req.user._id, true);
  if (!result) {
    res.status(404);
    throw new Error('Project not found or you are not the owner');
  }

  const { project } = result;
  const before = project.collaborators.length;
  project.collaborators = project.collaborators.filter(
    (c) => c._id.toString() !== req.params.collaboratorId
  );

  if (project.collaborators.length === before) {
    res.status(404);
    throw new Error('Collaborator not found in this project');
  }

  await project.save();
  res.json({ success: true, message: 'Collaborator removed', collaborators: project.collaborators });
});

// ─── Financial Summary ───────────────────────────────────────────────────────

// @desc    Get financial summary for a project (budget vs actual)
// @route   GET /api/construction-projects/:id/summary
// @access  Private (owner or collaborator)
const getProjectSummary = asyncHandler(async (req, res) => {
  const result = await getProjectWithAccess(req.params.id, req.user._id);
  if (!result) {
    res.status(404);
    throw new Error('Project not found or access denied');
  }

  const { project } = result;

  // Aggregate total and per-category spending from Expense collection
  const [totals, byCategory, byStage, byMonth] = await Promise.all([
    // Total spent
    Expense.aggregate([
      { $match: { constructionProject: project._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    // By category
    Expense.aggregate([
      { $match: { constructionProject: project._id } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),

    // By construction stage
    Expense.aggregate([
      { $match: { constructionProject: project._id, stage: { $ne: null } } },
      { $group: { _id: '$stage', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),

    // Monthly spending (last 12 months)
    Expense.aggregate([
      { $match: { constructionProject: project._id } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
  ]);

  const totalSpent = totals[0]?.total || 0;
  const budget = project.budget;
  const remaining = budget - totalSpent;
  const utilizationPct = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;
  const variance = budget - totalSpent; // positive = under budget, negative = over budget

  // Spending rate: average daily spend since start
  let averageDailySpend = null;
  if (project.startDate) {
    const daysElapsed = Math.max(
      1,
      Math.floor((Date.now() - new Date(project.startDate)) / (1000 * 60 * 60 * 24))
    );
    averageDailySpend = Math.round(totalSpent / daysElapsed);
  }

  res.json({
    success: true,
    summary: {
      projectName: project.projectName,
      projectType: project.projectType,
      budget,
      totalSpent,
      remaining,
      variance,
      utilizationPct,
      progress: project.progress,
      currentStage: project.currentStage,
      averageDailySpend,
      byCategory,
      byStage,
      byMonth,
      isOverBudget: totalSpent > budget,
    },
  });
});

// ─── Project Health (Phase 2: extended with milestone/task data) ─────────────

// @desc    Calculate project health — rule-based, includes milestone/task health
// @route   GET /api/construction-projects/:id/health
// @access  Private (owner or collaborator)
const getProjectHealth = asyncHandler(async (req, res) => {
  const result = await getProjectWithAccess(req.params.id, req.user._id);
  if (!result) {
    res.status(404);
    throw new Error('Project not found or access denied');
  }

  const { project } = result;
  const now = new Date();

  const [expenses, milestones, tasks] = await Promise.all([
    Expense.find({ constructionProject: project._id }),
    Milestone.find({ constructionProject: project._id }).lean(),
    Task.find({ constructionProject: project._id }).lean(),
  ]);

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const budget = project.budget;
  const utilizationPct = budget > 0 ? (totalSpent / budget) * 100 : 0;
  const progress = project.progress || 0;

  // ── Budget Health ──
  let budgetStatus = 'on_track';
  let budgetNote = '';
  if (totalSpent > budget) {
    budgetStatus = 'at_risk';
    budgetNote = `Over budget by KSh ${(totalSpent - budget).toLocaleString('en-KE')}.`;
  } else if (utilizationPct > progress + 20) {
    budgetStatus = 'at_risk';
    budgetNote = `Budget utilisation (${Math.round(utilizationPct)}%) is significantly ahead of project progress (${progress}%).`;
  } else if (utilizationPct > progress + 10) {
    budgetStatus = 'needs_attention';
    budgetNote = `Budget utilisation (${Math.round(utilizationPct)}%) is slightly ahead of project progress (${progress}%).`;
  } else {
    budgetNote = 'Spending is aligned with project progress.';
  }

  // ── Timeline Health ──
  let timelineStatus = 'on_track';
  let timelineNote = '';
  let daysOverdue = 0;

  if (project.expectedCompletionDate && progress < 100) {
    const expected = new Date(project.expectedCompletionDate);
    const totalDuration = project.startDate
      ? (expected - new Date(project.startDate)) / (1000 * 60 * 60 * 24)
      : null;

    if (now > expected) {
      daysOverdue = Math.floor((now - expected) / (1000 * 60 * 60 * 24));
      timelineStatus = 'at_risk';
      timelineNote = `Project is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} past the expected completion date.`;
    } else if (totalDuration && project.startDate) {
      const elapsed = (now - new Date(project.startDate)) / (1000 * 60 * 60 * 24);
      const expectedProgressByNow = (elapsed / totalDuration) * 100;
      const lag = expectedProgressByNow - progress;
      if (lag > 20) {
        timelineStatus = 'at_risk';
        timelineNote = `Project is significantly behind schedule (${Math.round(lag)}% behind expected progress).`;
      } else if (lag > 10) {
        timelineStatus = 'needs_attention';
        timelineNote = `Project is slightly behind schedule (${Math.round(lag)}% behind expected progress).`;
      } else {
        timelineNote = 'Timeline is on track.';
      }
    } else {
      timelineNote = 'Set a start date to enable timeline tracking.';
    }
  } else if (progress === 100) {
    timelineNote = 'Project is complete.';
  } else {
    timelineNote = 'Set an expected completion date to enable timeline tracking.';
  }

  // ── Progress Health ──
  let progressStatus = 'on_track';
  let progressNote = '';
  if (progress === 0 && totalSpent > 0) {
    progressStatus = 'needs_attention';
    progressNote = 'Spending has started but project progress is still at 0%. Update your progress.';
  } else if (progress >= 75 && progress < 100) {
    progressNote = 'Project is in the final stages.';
  } else if (progress === 100) {
    progressNote = 'Project is complete.';
  } else {
    progressNote = `Project is ${progress}% complete at ${project.currentStage}.`;
  }

  // ── Milestone Health (Phase 2) ──
  let milestoneStatus = 'on_track';
  let milestoneNote = '';
  let milestoneDetail = null;

  if (milestones.length > 0) {
    const overdueMilestones = milestones.filter(
      (m) => m.plannedCompletionDate && new Date(m.plannedCompletionDate) < now && m.status !== 'Completed'
    );
    const delayedMilestones = milestones.filter((m) => m.status === 'Delayed');
    const completedMilestones = milestones.filter((m) => m.status === 'Completed');
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Completed' && t.status !== 'Cancelled'
    );

    milestoneDetail = {
      total: milestones.length,
      completed: completedMilestones.length,
      delayed: delayedMilestones.length,
      overdue: overdueMilestones.length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === 'Completed').length,
      overdueTasks: overdueTasks.length,
    };

    const problemCount = overdueMilestones.length + delayedMilestones.length;
    if (problemCount > 0) {
      const problemNames = [...overdueMilestones, ...delayedMilestones]
        .map((m) => m.name)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 2)
        .join(', ');
      milestoneStatus = problemCount > 1 ? 'at_risk' : 'needs_attention';
      milestoneNote = `${problemCount} milestone${problemCount !== 1 ? 's are' : ' is'} delayed or overdue (${problemNames}).`;
      if (overdueTasks.length > 0) {
        milestoneNote += ` ${overdueTasks.length} task${overdueTasks.length !== 1 ? 's are' : ' is'} also overdue.`;
      }
    } else if (overdueTasks.length > 0) {
      milestoneStatus = 'needs_attention';
      milestoneNote = `${overdueTasks.length} project task${overdueTasks.length !== 1 ? 's are' : ' is'} overdue.`;
    } else {
      milestoneNote = `${completedMilestones.length} of ${milestones.length} milestones completed. All on track.`;
    }
  } else {
    milestoneNote = 'No milestones added yet. Add milestones to enable detailed health tracking.';
  }

  // ── Overall Health (worst-case across all four dimensions) ──
  const statuses = [budgetStatus, timelineStatus, progressStatus, milestoneStatus];
  let overall = 'on_track';
  if (statuses.includes('at_risk')) overall = 'at_risk';
  else if (statuses.includes('needs_attention')) overall = 'needs_attention';

  const STATUS_LABELS = {
    on_track: { label: 'On Track', emoji: '🟢', color: 'green' },
    needs_attention: { label: 'Needs Attention', emoji: '🟡', color: 'yellow' },
    at_risk: { label: 'At Risk', emoji: '🔴', color: 'red' },
  };

  res.json({
    success: true,
    health: {
      overall: STATUS_LABELS[overall],
      budget: { ...STATUS_LABELS[budgetStatus], note: budgetNote },
      timeline: { ...STATUS_LABELS[timelineStatus], note: timelineNote, daysOverdue },
      progress: { ...STATUS_LABELS[progressStatus], note: progressNote },
      milestones: { ...STATUS_LABELS[milestoneStatus], note: milestoneNote, detail: milestoneDetail },
      snapshot: {
        budget: project.budget,
        totalSpent,
        progress,
        utilizationPct: Math.round(utilizationPct),
        currentStage: project.currentStage,
      },
    },
  });
});

// ─── Benchmarking ────────────────────────────────────────────────────────────

// @desc    Get anonymised benchmarking data for comparable projects
// @route   GET /api/construction-projects/:id/benchmark
// @access  Private (owner)
const getBenchmarkData = asyncHandler(async (req, res) => {
  const result = await getProjectWithAccess(req.params.id, req.user._id, true);
  if (!result) {
    res.status(404);
    throw new Error('Project not found or you are not the owner');
  }

  const { project } = result;
  const MIN_COMPARABLE = 3; // Don't show benchmarks if fewer than this

  // Find comparable projects: same type, excluding the current project and its owner
  const comparable = await ConstructionProject.find({
    _id: { $ne: project._id },
    owner: { $ne: project.owner },
    projectType: project.projectType,
    isArchived: false,
    budget: { $gt: 0 },
  }).select('budget county projectType');

  if (comparable.length < MIN_COMPARABLE) {
    return res.json({
      success: true,
      hasSufficientData: false,
      message: 'Not enough Nuru project data available for a reliable comparison yet.',
      yourBudget: project.budget,
      comparableCount: comparable.length,
    });
  }

  const budgets = comparable.map((p) => p.budget).sort((a, b) => a - b);
  const avg = Math.round(budgets.reduce((s, b) => s + b, 0) / budgets.length);
  const median = budgets[Math.floor(budgets.length / 2)];
  const min = budgets[0];
  const max = budgets[budgets.length - 1];

  // Percentile position of this project
  const below = budgets.filter((b) => b < project.budget).length;
  const percentile = Math.round((below / budgets.length) * 100);

  let budgetPosition = 'within_range';
  if (project.budget < min) budgetPosition = 'below_range';
  else if (project.budget > max) budgetPosition = 'above_range';

  // County comparison (need at least MIN_COMPARABLE in same county)
  const sameCounty = comparable.filter(
    (p) => p.county?.toLowerCase() === project.county?.toLowerCase()
  );
  let countyBenchmark = null;
  if (sameCounty.length >= MIN_COMPARABLE) {
    const cb = sameCounty.map((p) => p.budget).sort((a, b) => a - b);
    countyBenchmark = {
      count: cb.length,
      average: Math.round(cb.reduce((s, b) => s + b, 0) / cb.length),
      median: cb[Math.floor(cb.length / 2)],
    };
  }

  res.json({
    success: true,
    hasSufficientData: true,
    yourBudget: project.budget,
    projectType: project.projectType,
    county: project.county,
    comparableCount: comparable.length,
    benchmarks: {
      average: avg,
      median,
      min,
      max,
      percentile,
      budgetPosition,
    },
    countyBenchmark,
  });
});

// ─── Projects I'm Invited To (Professional view) ─────────────────────────────

// @desc    Get construction projects this professional is a collaborator on
// @route   GET /api/construction-projects/assigned
// @access  Private (professional)
const getAssignedProjects = asyncHandler(async (req, res) => {
  const professional = await Professional.findOne({ user: req.user._id });
  if (!professional) {
    res.status(404);
    throw new Error('Professional profile not found');
  }

  const projects = await ConstructionProject.find({
    'collaborators.professional': professional._id,
    isArchived: false,
  })
    .populate('owner', 'fullName phone')
    .sort({ updatedAt: -1 });

  // Attach role for each project
  const enriched = projects.map((p) => {
    const collab = p.collaborators.find(
      (c) => c.professional.toString() === professional._id.toString()
    );
    return { ...p.toObject(), myRole: collab?.role };
  });

  res.json({ success: true, count: enriched.length, projects: enriched });
});

module.exports = {
  createConstructionProject,
  getMyConstructionProjects,
  getConstructionProjectById,
  updateConstructionProject,
  archiveConstructionProject,
  addCollaborator,
  removeCollaborator,
  getProjectSummary,
  getProjectHealth,
  getBenchmarkData,
  getAssignedProjects,
};
