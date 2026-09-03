const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllUsers,
  deleteUser,
  getAllProfessionalsAdmin,
  getAllStoresAdmin,
  getAllProductsAdmin,
  deleteProductAdmin,
  getAllJobsAdmin,
  deleteJobAdmin,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

router.get('/stats', getStats);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

router.get('/professionals', getAllProfessionalsAdmin);
router.get('/stores', getAllStoresAdmin);

router.get('/products', getAllProductsAdmin);
router.delete('/products/:id', deleteProductAdmin);

router.get('/jobs', getAllJobsAdmin);
router.delete('/jobs/:id', deleteJobAdmin);

module.exports = router;
