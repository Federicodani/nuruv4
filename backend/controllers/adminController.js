const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Professional = require('../models/Professional');
const Store = require('../models/Store');
const Product = require('../models/Product');
const Job = require('../models/Job');
const cloudinary = require('../config/cloudinary');

// @desc    Get dashboard summary stats
// @route   GET /api/admin/stats
// @access  Private (admin)
const getStats = asyncHandler(async (req, res) => {
  const [userCount, professionalCount, storeCount, productCount, jobCount] = await Promise.all([
    User.countDocuments(),
    Professional.countDocuments(),
    Store.countDocuments(),
    Product.countDocuments(),
    Job.countDocuments(),
  ]);

  res.json({
    success: true,
    stats: { userCount, professionalCount, storeCount, productCount, jobCount },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, users });
});

// @desc    Delete a user (and their related profile/store)
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot delete an admin account');
  }

  // Clean up related records
  await Professional.deleteOne({ user: user._id });
  const store = await Store.findOne({ owner: user._id });
  if (store) {
    const products = await Product.find({ store: store._id });
    for (const product of products) {
      for (const image of product.images) {
        await cloudinary.uploader.destroy(image.publicId).catch(() => {});
      }
    }
    await Product.deleteMany({ store: store._id });
    await store.deleteOne();
  }
  await Job.deleteMany({ client: user._id });
  await user.deleteOne();

  res.json({ success: true, message: 'User and related data deleted successfully' });
});

// @desc    Get all professionals (admin view)
// @route   GET /api/admin/professionals
// @access  Private (admin)
const getAllProfessionalsAdmin = asyncHandler(async (req, res) => {
  const professionals = await Professional.find().populate('user', 'fullName email phone');
  res.json({ success: true, count: professionals.length, professionals });
});

// @desc    Get all stores (admin view)
// @route   GET /api/admin/stores
// @access  Private (admin)
const getAllStoresAdmin = asyncHandler(async (req, res) => {
  const stores = await Store.find().populate('owner', 'fullName email phone');
  res.json({ success: true, count: stores.length, stores });
});

// @desc    Get all products (admin view)
// @route   GET /api/admin/products
// @access  Private (admin)
const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const products = await Product.find().populate('store', 'storeName');
  res.json({ success: true, count: products.length, products });
});

// @desc    Delete a product (admin)
// @route   DELETE /api/admin/products/:id
// @access  Private (admin)
const deleteProductAdmin = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  for (const image of product.images) {
    await cloudinary.uploader.destroy(image.publicId).catch(() => {});
  }

  await product.deleteOne();

  res.json({ success: true, message: 'Product deleted successfully' });
});

// @desc    Get all jobs (admin view)
// @route   GET /api/admin/jobs
// @access  Private (admin)
const getAllJobsAdmin = asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate('client', 'fullName email phone');
  res.json({ success: true, count: jobs.length, jobs });
});

// @desc    Delete a job (admin)
// @route   DELETE /api/admin/jobs/:id
// @access  Private (admin)
const deleteJobAdmin = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  await job.deleteOne();

  res.json({ success: true, message: 'Job deleted successfully' });
});

module.exports = {
  getStats,
  getAllUsers,
  deleteUser,
  getAllProfessionalsAdmin,
  getAllStoresAdmin,
  getAllProductsAdmin,
  deleteProductAdmin,
  getAllJobsAdmin,
  deleteJobAdmin,
};
