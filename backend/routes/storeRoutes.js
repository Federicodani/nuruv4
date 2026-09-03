const express = require('express');
const router = express.Router();
const {
  getStores,
  getStoreById,
  getMyStore,
  updateMyStore,
  updateStoreLogo,
  updateStoreCover,
} = require('../controllers/storeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadStoreImages } = require('../middleware/uploadMiddleware');

router.get('/', getStores);

router.get('/me/profile', protect, authorize('store_owner'), getMyStore);
router.put('/me/profile', protect, authorize('store_owner'), updateMyStore);
router.put(
  '/me/logo',
  protect,
  authorize('store_owner'),
  uploadStoreImages.single('image'),
  updateStoreLogo
);
router.put(
  '/me/cover',
  protect,
  authorize('store_owner'),
  uploadStoreImages.single('image'),
  updateStoreCover
);

router.get('/:id', getStoreById);

module.exports = router;
