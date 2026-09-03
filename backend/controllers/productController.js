const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Store = require('../models/Store');
const cloudinary = require('../config/cloudinary');
const { NURU_PRIORITY_KEYWORDS } = require('../config/constants');

// @desc    Get all products (with filters/search)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { search, category, store, location } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (store) filter.store = store;
  if (location) filter.location = location;

  let products = await Product.find(filter)
    .populate('store', 'storeName phone whatsappNumber county town isNuruElectricals')
    .sort({ isFeaturedNuru: -1, createdAt: -1 });

  if (search) {
    const term = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.store && p.store.storeName.toLowerCase().includes(term))
    );
  }

  // Business rule: pin Nuru Electricals' products to top for priority keyword searches
  const searchTermLower = (search || category || '').toLowerCase();
  const matchesPriorityKeyword = NURU_PRIORITY_KEYWORDS.some((kw) =>
    searchTermLower.includes(kw)
  );

  if (matchesPriorityKeyword) {
    products = products.sort((a, b) => {
      const aIsNuru = a.store && a.store.isNuruElectricals;
      const bIsNuru = b.store && b.store.isNuruElectricals;
      if (aIsNuru && !bIsNuru) return -1;
      if (!aIsNuru && bIsNuru) return 1;
      return 0;
    });
  }

  res.json({ success: true, count: products.length, products });
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    'store',
    'storeName phone whatsappNumber county town logo'
  );

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, product });
});

// @desc    Get all products belonging to the logged-in store owner
// @route   GET /api/products/me/products
// @access  Private (store_owner)
const getMyProducts = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id });

  if (!store) {
    res.status(404);
    throw new Error('Store profile not found');
  }

  const products = await Product.find({ store: store._id }).sort({ createdAt: -1 });

  res.json({ success: true, count: products.length, products });
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (store_owner)
const createProduct = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id });

  if (!store) {
    res.status(404);
    throw new Error('Store profile not found. Please complete your store profile first.');
  }

  const { name, category,  description, stockQuantity, location } = req.body;

  if (!name || !category  || !location) {
    res.status(400);
    throw new Error('Please provide name, category,  and location');
  }

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('Please upload at least one product image');
  }

  const images = req.files.map((file) => ({
    url: file.path,
    publicId: file.filename,
  }));

  const isFeaturedNuru = store.isNuruElectricals && category === 'Electrical';

  const product = await Product.create({
    store: store._id,
    name,
    category,
    description,
    stockQuantity: stockQuantity || 0,
    location,
    images,
    isFeaturedNuru,
  });

  res.status(201).json({ success: true, product });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (store_owner - own products only)
const updateProduct = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id });
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (!store || product.store.toString() !== store._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this product');
  }

  const allowedFields = ['name', 'category',  'description', 'stockQuantity', 'location'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });

  // Add new images if uploaded
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));
    product.images.push(...newImages);
  }

  product.isFeaturedNuru = store.isNuruElectricals && product.category === 'Electrical';

  await product.save();

  res.json({ success: true, product });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (store_owner - own products only)
const deleteProduct = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id });
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (!store || product.store.toString() !== store._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this product');
  }

  // Clean up images from Cloudinary
  for (const image of product.images) {
    await cloudinary.uploader.destroy(image.publicId).catch(() => {});
  }

  await product.deleteOne();

  res.json({ success: true, message: 'Product deleted successfully' });
});

// @desc    Delete a single image from a product
// @route   DELETE /api/products/:id/images/:imageId
// @access  Private (store_owner - own products only)
const deleteProductImage = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id });
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (!store || product.store.toString() !== store._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to modify this product');
  }

  const image = product.images.find((img) => img._id.toString() === req.params.imageId);

  if (!image) {
    res.status(404);
    throw new Error('Image not found');
  }

  if (product.images.length === 1) {
    res.status(400);
    throw new Error('Product must have at least one image');
  }

  await cloudinary.uploader.destroy(image.publicId).catch(() => {});

  product.images = product.images.filter((img) => img._id.toString() !== req.params.imageId);
  await product.save();

  res.json({ success: true, product });
});

module.exports = {
  getProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
};
