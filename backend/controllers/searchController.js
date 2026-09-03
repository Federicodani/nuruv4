const asyncHandler = require('express-async-handler');
const Professional = require('../models/Professional');
const Product = require('../models/Product');
const Store = require('../models/Store');
const Project = require('../models/Project');
const { NURU_PRIORITY_KEYWORDS } = require('../config/constants');

// @desc    Global search across professionals, products, stores, and projects
// @route   GET /api/search?q=searchTerm
// @access  Public
const globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    res.status(400);
    throw new Error('Please provide a search query');
  }

  const term = q.toLowerCase().trim();

  const [allProfessionals, allProducts, allStores, allProjects] = await Promise.all([
    Professional.find().populate('user', 'fullName'),
    Product.find().populate('store', 'storeName isNuruElectricals'),
    Store.find(),
    Project.find().populate({
      path: 'professional',
      select: 'profession user',
      populate: { path: 'user', select: 'fullName' },
    }),
  ]);

  const professionals = allProfessionals
    .filter(
      (p) =>
        p.profession.toLowerCase().includes(term) ||
        p.bio.toLowerCase().includes(term) ||
        p.county.toLowerCase().includes(term) ||
        p.town.toLowerCase().includes(term) ||
        (p.user && p.user.fullName.toLowerCase().includes(term))
    )
    .slice(0, 8);

  const products = allProducts
    .filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    )
    .slice(0, 8);

  const stores = allStores
    .filter(
      (s) =>
        s.storeName.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term)
    )
    .slice(0, 8);

  const projects = allProjects
    .filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.county.toLowerCase().includes(term) ||
        (p.professional?.profession || '').toLowerCase().includes(term) ||
        (p.professional?.user?.fullName || '').toLowerCase().includes(term)
    )
    .slice(0, 8);

  // Apply Nuru Electricals priority sorting if search matches priority keywords
  const matchesPriorityKeyword = NURU_PRIORITY_KEYWORDS.some((kw) => term.includes(kw));

  if (matchesPriorityKeyword) {
    professionals.sort((a, b) => (b.isNuruElectricals ? 1 : 0) - (a.isNuruElectricals ? 1 : 0));
    products.sort(
      (a, b) =>
        (b.store?.isNuruElectricals ? 1 : 0) - (a.store?.isNuruElectricals ? 1 : 0)
    );
  }

  res.json({
    success: true,
    query: q,
    results: {
      professionals,
      products,
      stores,
      projects,
    },
    isPriorityMatch: matchesPriorityKeyword,
  });
});

module.exports = { globalSearch };
