const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadProductImages } = require('../middleware/uploadMiddleware');

router.get('/', getProducts);
router.get('/me/products', protect, authorize('store_owner'), getMyProducts);

router.post(
  '/',
  protect,
  authorize('store_owner'),
  uploadProductImages.array('images', 6),
  createProduct
);

router.get('/:id', getProductById);

router.put(
  '/:id',
  protect,
  authorize('store_owner'),
  uploadProductImages.array('images', 6),
  updateProduct
);
router.delete('/:id', protect, authorize('store_owner'), deleteProduct);
router.delete('/:id/images/:imageId', protect, authorize('store_owner'), deleteProductImage);

module.exports = router;
