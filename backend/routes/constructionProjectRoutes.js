const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/constructionProjectController');

const {
  addExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadReceipts } = require('../middleware/uploadMiddleware');
const milestoneRoutes = require('./milestoneRoutes');
const { getMyAssignedTasks } = require('../controllers/taskController');

// All routes are protected
router.use(protect);

// Projects assigned to a professional (must come before /:id)
router.get('/assigned', authorize('professional'), getAssignedProjects);

// Client project CRUD
router
  .route('/')
  .get(getMyConstructionProjects)
  .post(createConstructionProject);

router
  .route('/:id')
  .get(getConstructionProjectById)
  .put(updateConstructionProject)
  .delete(archiveConstructionProject);

// Analytics & health
router.get('/:id/summary', getProjectSummary);
router.get('/:id/health', getProjectHealth);
router.get('/:id/benchmark', getBenchmarkData);

// Collaboration
router.post('/:id/collaborators', addCollaborator);
router.delete('/:id/collaborators/:collaboratorId', removeCollaborator);

// Expenses (nested under /:id)
router
  .route('/:id/expenses')
  .get(getExpenses)
  .post(uploadReceipts.single('receipt'), addExpense);

router
  .route('/:id/expenses/:expenseId')
  .get(getExpenseById)
  .put(uploadReceipts.single('receipt'), updateExpense)
  .delete(deleteExpense);

// Professional: tasks assigned to them across projects (must come before /:id)
router.get('/my-tasks', authorize('professional'), getMyAssignedTasks);

// Milestones + Tasks (nested under /:id/milestones)
router.use('/:id/milestones', milestoneRoutes);

module.exports = router;
