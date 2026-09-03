const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :id from parent
const {
  getMilestones,
  getMilestoneTemplates,
  createMilestone,
  applyTemplate,
  updateMilestone,
  reorderMilestones,
  deleteMilestone,
  getMilestoneStats,
} = require('../controllers/milestoneController');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// ── Milestone routes ───────────────────────────────────────────────────────
router.get('/stats', getMilestoneStats);
router.get('/templates', getMilestoneTemplates);
router.put('/reorder', reorderMilestones);
router.post('/apply-template', applyTemplate);
router.route('/').get(getMilestones).post(createMilestone);
router.route('/:milestoneId').put(updateMilestone).delete(deleteMilestone);

// ── Task routes (nested under milestones) ─────────────────────────────────
router.route('/:milestoneId/tasks').get(getTasks).post(createTask);
router.route('/:milestoneId/tasks/:taskId').put(updateTask).delete(deleteTask);

module.exports = router;
