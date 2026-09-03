const express = require('express');
const router = express.Router();
const {
  getProjects,
  getFeaturedProjects,
  getProjectById,
  likeProject,
  getMyProjects,
  getMyProjectStats,
  createProject,
  updateProject,
  deleteProject,
  toggleFeatured,
  getAllProjectsAdmin,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadProjectImages } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/featured', getFeaturedProjects);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id/like', likeProject);

// Professional self-service (protected)
router.get('/me/projects', protect, authorize('professional'), getMyProjects);
router.get('/me/stats', protect, authorize('professional'), getMyProjectStats);
router.post(
  '/',
  protect,
  authorize('professional'),
  uploadProjectImages.array('images', 10),
  createProject
);
router.put(
  '/:id',
  protect,
  authorize('professional'),
  uploadProjectImages.array('images', 10),
  updateProject
);
router.delete('/:id', protect, authorize('professional'), deleteProject);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllProjectsAdmin);
router.put('/:id/toggle-featured', protect, authorize('admin'), toggleFeatured);

module.exports = router;
