const asyncHandler = require('express-async-handler');
const Professional = require('../models/Professional');
const cloudinary = require('../config/cloudinary');
const { NURU_PRIORITY_KEYWORDS } = require('../config/constants');

// @desc    Get all professionals (with filters/search)
// @route   GET /api/professionals
// @access  Public
const getProfessionals = asyncHandler(async (req, res) => {
  const { search, profession, county, town } = req.query;
  const filter = {};

  if (profession) filter.profession = profession;
  if (county) filter.county = county;
  if (town) filter.town = town;

  let professionals = await Professional.find(filter)
    .populate('user', 'fullName email phone')
    .sort({ isNuruElectricals: -1, isFeatured: -1, createdAt: -1 });

  // Text search across profession, name, bio, location
  if (search) {
    const term = search.toLowerCase();
    professionals = professionals.filter((p) => {
      return (
        p.profession.toLowerCase().includes(term) ||
        p.bio.toLowerCase().includes(term) ||
        p.county.toLowerCase().includes(term) ||
        p.town.toLowerCase().includes(term) ||
        (p.user && p.user.fullName.toLowerCase().includes(term))
      );
    });
  }

  // Business rule: If the search/profession matches a Nuru priority keyword,
  // ensure Nuru Electricals professional profile is pinned to the top.
  const searchTermLower = (search || profession || '').toLowerCase();
  const matchesPriorityKeyword = NURU_PRIORITY_KEYWORDS.some((kw) =>
    searchTermLower.includes(kw)
  );

  if (matchesPriorityKeyword) {
    professionals = professionals.sort((a, b) => {
      if (a.isNuruElectricals && !b.isNuruElectricals) return -1;
      if (!a.isNuruElectricals && b.isNuruElectricals) return 1;
      return 0;
    });
  }

  res.json({ success: true, count: professionals.length, professionals });
});

// @desc    Get single professional by ID
// @route   GET /api/professionals/:id
// @access  Public
const getProfessionalById = asyncHandler(async (req, res) => {
  const professional = await Professional.findById(req.params.id).populate(
    'user',
    'fullName email phone'
  );

  if (!professional) {
    res.status(404);
    throw new Error('Professional not found');
  }

  res.json({ success: true, professional });
});

// @desc    Get logged-in professional's own profile
// @route   GET /api/professionals/me/profile
// @access  Private (professional)
const getMyProfessionalProfile = asyncHandler(async (req, res) => {
  const professional = await Professional.findOne({ user: req.user._id }).populate(
    'user',
    'fullName email phone'
  );

  if (!professional) {
    res.status(404);
    throw new Error('Professional profile not found');
  }

  res.json({ success: true, professional });
});

// @desc    Update logged-in professional's profile
// @route   PUT /api/professionals/me/profile
// @access  Private (professional)
const updateMyProfessionalProfile = asyncHandler(async (req, res) => {
  const professional = await Professional.findOne({ user: req.user._id });

  if (!professional) {
    res.status(404);
    throw new Error('Professional profile not found');
  }

  const allowedFields = [
    'profession',
    'bio',
    'yearsOfExperience',
    'county',
    'town',
    'whatsappNumber',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      professional[field] = req.body[field];
    }
  });

  await professional.save();

  res.json({ success: true, professional });
});

// @desc    Upload/update profile image
// @route   PUT /api/professionals/me/profile-image
// @access  Private (professional)
const updateProfileImage = asyncHandler(async (req, res) => {
  const professional = await Professional.findOne({ user: req.user._id });

  if (!professional) {
    res.status(404);
    throw new Error('Professional profile not found');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  // Delete old image from Cloudinary if it exists
  if (professional.profileImage?.publicId) {
    await cloudinary.uploader.destroy(professional.profileImage.publicId).catch(() => {});
  }

  professional.profileImage = {
    url: req.file.path,
    publicId: req.file.filename,
  };

  await professional.save();

  res.json({ success: true, profileImage: professional.profileImage });
});

// @desc    Upload/update cover image
// @route   PUT /api/professionals/me/cover-image
// @access  Private (professional)
const updateCoverImage = asyncHandler(async (req, res) => {
  const professional = await Professional.findOne({ user: req.user._id });

  if (!professional) {
    res.status(404);
    throw new Error('Professional profile not found');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  if (professional.coverImage?.publicId) {
    await cloudinary.uploader.destroy(professional.coverImage.publicId).catch(() => {});
  }

  professional.coverImage = {
    url: req.file.path,
    publicId: req.file.filename,
  };

  await professional.save();

  res.json({ success: true, coverImage: professional.coverImage });
});

// @desc    Add portfolio image
// @route   POST /api/professionals/me/portfolio
// @access  Private (professional)
const addPortfolioImage = asyncHandler(async (req, res) => {
  const professional = await Professional.findOne({ user: req.user._id });

  if (!professional) {
    res.status(404);
    throw new Error('Professional profile not found');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  professional.portfolio.push({
    url: req.file.path,
    publicId: req.file.filename,
    caption: req.body.caption || '',
  });

  await professional.save();

  res.status(201).json({ success: true, portfolio: professional.portfolio });
});

// @desc    Delete portfolio image
// @route   DELETE /api/professionals/me/portfolio/:imageId
// @access  Private (professional)
const deletePortfolioImage = asyncHandler(async (req, res) => {
  const professional = await Professional.findOne({ user: req.user._id });

  if (!professional) {
    res.status(404);
    throw new Error('Professional profile not found');
  }

  const image = professional.portfolio.find(
    (img) => img._id.toString() === req.params.imageId
  );

  if (!image) {
    res.status(404);
    throw new Error('Portfolio image not found');
  }

  await cloudinary.uploader.destroy(image.publicId).catch(() => {});

  professional.portfolio = professional.portfolio.filter(
    (img) => img._id.toString() !== req.params.imageId
  );

  await professional.save();

  res.json({ success: true, portfolio: professional.portfolio });
});

// @desc    Add a review to a professional
// @route   POST /api/professionals/:id/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Please provide a valid rating between 1 and 5');
  }

  const professional = await Professional.findById(req.params.id);

  if (!professional) {
    res.status(404);
    throw new Error('Professional not found');
  }

  professional.reviews.push({
    user: req.user._id,
    reviewerName: req.user.fullName,
    rating,
    comment,
  });

  professional.recalculateRating();
  await professional.save();

  res.status(201).json({ success: true, professional });
});

module.exports = {
  getProfessionals,
  getProfessionalById,
  getMyProfessionalProfile,
  updateMyProfessionalProfile,
  updateProfileImage,
  updateCoverImage,
  addPortfolioImage,
  deletePortfolioImage,
  addReview,
};
