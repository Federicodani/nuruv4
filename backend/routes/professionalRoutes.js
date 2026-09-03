const express = require('express');
const router = express.Router();
const {
  getProfessionals,
  getProfessionalById,
  getMyProfessionalProfile,
  updateMyProfessionalProfile,
  updateProfileImage,
  updateCoverImage,
  addPortfolioImage,
  deletePortfolioImage,
  addReview,
} = require('../controllers/professionalController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  uploadProfileImage,
  uploadCoverImage,
  uploadPortfolio,
} = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getProfessionals);

// Private routes (must come before /:id to avoid route collision)
router.get('/me/profile', protect, authorize('professional'), getMyProfessionalProfile);
router.put('/me/profile', protect, authorize('professional'), updateMyProfessionalProfile);
router.put(
  '/me/profile-image',
  protect,
  authorize('professional'),
  uploadProfileImage.single('image'),
  updateProfileImage
);
router.put(
  '/me/cover-image',
  protect,
  authorize('professional'),
  uploadCoverImage.single('image'),
  updateCoverImage
);
router.post(
  '/me/portfolio',
  protect,
  authorize('professional'),
  uploadPortfolio.single('image'),
  addPortfolioImage
);
router.delete('/me/portfolio/:imageId', protect, authorize('professional'), deletePortfolioImage);

router.post('/:id/reviews', protect, addReview);

// Public dynamic route last
router.get('/:id', getProfessionalById);

module.exports = router;
