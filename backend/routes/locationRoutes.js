const express = require('express');
const router = express.Router();
const {
  getNearbyProfessionals,
  getNearbyStores,
  updateProfessionalLocation,
  updateStoreLocation,
} = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public nearby queries — coordinates supplied by the client per request
router.get('/nearby-professionals', getNearbyProfessionals);
router.get('/nearby-stores', getNearbyStores);

// Professionals/stores can update their own coordinates
router.put('/professional-location', protect, authorize('professional'), updateProfessionalLocation);
router.put('/store-location', protect, authorize('store_owner'), updateStoreLocation);

module.exports = router;
