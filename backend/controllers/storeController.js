const asyncHandler = require('express-async-handler');
const Store = require('../models/Store');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
const getStores = asyncHandler(async (req, res) => {
  const { search, county, town } = req.query;
  const filter = {};

  if (county) filter.county = county;
  if (town) filter.town = town;

  let stores = await Store.find(filter)
    .populate('owner', 'fullName email phone')
    .sort({ isNuruElectricals: -1, createdAt: -1 });

  if (search) {
    const term = search.toLowerCase();
    stores = stores.filter(
      (s) =>
        s.storeName.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term) ||
        s.county.toLowerCase().includes(term) ||
        s.town.toLowerCase().includes(term)
    );
  }

  res.json({ success: true, count: stores.length, stores });
});

// @desc    Get single store by ID, with its products
// @route   GET /api/stores/:id
// @access  Public
const getStoreById = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id).populate(
    'owner',
    'fullName email phone'
  );

  if (!store) {
    res.status(404);
    throw new Error('Store not found');
  }

  const products = await Product.find({ store: store._id }).sort({ createdAt: -1 });

  res.json({ success: true, store, products });
});

// @desc    Get logged-in store owner's own store
// @route   GET /api/stores/me/profile
// @access  Private (store_owner)
const getMyStore = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id }).populate(
    'owner',
    'fullName email phone'
  );

  if (!store) {
    res.status(404);
    throw new Error('Store profile not found');
  }

  res.json({ success: true, store });
});

// @desc    Update logged-in store owner's store profile
// @route   PUT /api/stores/me/profile
// @access  Private (store_owner)
const updateMyStore = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id });

  if (!store) {
    res.status(404);
    throw new Error('Store profile not found');
  }

  const allowedFields = [
    'storeName',
    'description',
    'phone',
    'whatsappNumber',
    'county',
    'town',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      store[field] = req.body[field];
    }
  });

  await store.save();

  res.json({ success: true, store });
});

// @desc    Upload/update store logo
// @route   PUT /api/stores/me/logo
// @access  Private (store_owner)
const updateStoreLogo = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id });

  if (!store) {
    res.status(404);
    throw new Error('Store profile not found');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  if (store.logo?.publicId) {
    await cloudinary.uploader.destroy(store.logo.publicId).catch(() => {});
  }

  store.logo = { url: req.file.path, publicId: req.file.filename };
  await store.save();

  res.json({ success: true, logo: store.logo });
});

// @desc    Upload/update store cover image
// @route   PUT /api/stores/me/cover
// @access  Private (store_owner)
const updateStoreCover = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id });

  if (!store) {
    res.status(404);
    throw new Error('Store profile not found');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  if (store.coverImage?.publicId) {
    await cloudinary.uploader.destroy(store.coverImage.publicId).catch(() => {});
  }

  store.coverImage = { url: req.file.path, publicId: req.file.filename };
  await store.save();

  res.json({ success: true, coverImage: store.coverImage });
});

module.exports = {
  getStores,
  getStoreById,
  getMyStore,
  updateMyStore,
  updateStoreLogo,
  updateStoreCover,
};
