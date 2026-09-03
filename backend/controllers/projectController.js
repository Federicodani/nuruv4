const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Professional = require('../models/Professional');
const cloudinary = require('../config/cloudinary');

// @desc    Get all projects (public – with search, filter, sort, pagination)
// @route   GET /api/projects
// @access  Public
const getProjects = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    county,
    profession,
    sort = 'newest',
    page = 1,
    limit = 12,
    featured,
  } = req.query;

  // Build aggregation pipeline for flexible filtering across professional fields
  const matchStage = {};

  if (category) matchStage.category = category;
  if (county) matchStage.county = new RegExp(county, 'i');
  if (featured === 'true') matchStage.isFeatured = true;

  let projects = await Project.find(matchStage)
    .populate({
      path: 'professional',
      select: 'profession county town user profileImage',
      populate: { path: 'user', select: 'fullName' },
    })
    .lean();

  // Post-populate filtering by profession or text search
  if (profession) {
    projects = projects.filter(
      (p) => p.professional?.profession?.toLowerCase() === profession.toLowerCase()
    );
  }

  if (search) {
    const term = search.toLowerCase();
    projects = projects.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.county.toLowerCase().includes(term) ||
        (p.professional?.profession || '').toLowerCase().includes(term) ||
        (p.professional?.user?.fullName || '').toLowerCase().includes(term)
    );
  }

  // Sorting
  if (sort === 'newest') {
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'most_viewed') {
    projects.sort((a, b) => b.views - a.views);
  } else if (sort === 'most_liked') {
    projects.sort((a, b) => b.likes - a.likes);
  }

  const total = projects.length;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const paginated = projects.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    count: paginated.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    projects: paginated,
  });
});

// @desc    Get featured projects for homepage (limit 6)
// @route   GET /api/projects/featured
// @access  Public
const getFeaturedProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ isFeatured: true })
    .populate({
      path: 'professional',
      select: 'profession county town user profileImage',
      populate: { path: 'user', select: 'fullName' },
    })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  // If fewer than 6 featured, pad with most recent
  if (projects.length < 6) {
    const featuredIds = projects.map((p) => p._id.toString());
    const extras = await Project.find({ _id: { $nin: featuredIds } })
      .populate({
        path: 'professional',
        select: 'profession county town user profileImage',
        populate: { path: 'user', select: 'fullName' },
      })
      .sort({ createdAt: -1 })
      .limit(6 - projects.length)
      .lean();
    projects.push(...extras);
  }

  res.json({ success: true, projects });
});

// @desc    Get single project by ID, increment views
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate({
    path: 'professional',
    select: 'profession county town user profileImage bio',
    populate: { path: 'user', select: 'fullName phone' },
  });

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Related projects in same category
  const related = await Project.find({
    _id: { $ne: project._id },
    category: project.category,
  })
    .populate({
      path: 'professional',
      select: 'profession user',
      populate: { path: 'user', select: 'fullName' },
    })
    .limit(4)
    .lean();

  res.json({ success: true, project, related });
});

// @desc    Like a project (increment likes)
// @route   PUT /api/projects/:id/like
// @access  Public
const likeProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },
    { new: true }
  );

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.json({ success: true, likes: project.likes });
});

// @desc    Get logged-in professional's own projects
// @route   GET /api/projects/me/projects
// @access  Private (professional)
const getMyProjects = asyncHandler(async (req, res) => {
  const professional = await Professional.findOne({ user: req.user._id });

  if (!professional) {
    res.status(404);
    throw new Error('Professional profile not found');
  }

  const projects = await Project.find({ professional: professional._id }).sort({ createdAt: -1 });

  res.json({ success: true, count: projects.length, projects });
});

// @desc    Get dashboard stats for professional
// @route   GET /api/projects/me/stats
// @access  Private (professional)
const getMyProjectStats = asyncHandler(async (req, res) => {
  const professional = await Professional.findOne({ user: req.user._id });

  if (!professional) {
    res.status(404);
    throw new Error('Professional profile not found');
  }

  const projects = await Project.find({ professional: professional._id }).lean();

  const totalProjects = projects.length;
  const totalViews = projects.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = projects.reduce((sum, p) => sum + (p.likes || 0), 0);

  const mostViewed = projects.sort((a, b) => b.views - a.views)[0] || null;

  res.json({
    success: true,
    stats: {
      totalProjects,
      totalViews,
      totalLikes,
      mostViewedProject: mostViewed,
    },
  });
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private (professional)
const createProject = asyncHandler(async (req, res) => {
  const professional = await Professional.findOne({ user: req.user._id });

  if (!professional) {
    res.status(404);
    throw new Error('Professional profile not found. Please complete your profile first.');
  }

  const { title, description, category, county } = req.body;

  if (!title || !category || !county) {
    res.status(400);
    throw new Error('Title, category, and county are required');
  }

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('At least one image is required');
  }

  const images = req.files.map((file) => ({
    url: file.path,
    publicId: file.filename,
  }));

  // Thumbnail = first uploaded image
  const thumbnail = {
    url: images[0].url,
    publicId: images[0].publicId,
  };

  const project = await Project.create({
    professional: professional._id,
    title,
    description,
    category,
    county,
    images,
    thumbnail,
  });

  const populated = await Project.findById(project._id).populate({
    path: 'professional',
    select: 'profession user',
    populate: { path: 'user', select: 'fullName' },
  });

  res.status(201).json({ success: true, project: populated });
});

// @desc    Update a project (own projects only)
// @route   PUT /api/projects/:id
// @access  Private (professional)
const updateProject = asyncHandler(async (req, res) => {
  const professional = await Professional.findOne({ user: req.user._id });

  if (!professional) {
    res.status(404);
    throw new Error('Professional profile not found');
  }

  const project = await Project.findOne({
    _id: req.params.id,
    professional: professional._id,
  });

  if (!project) {
    res.status(404);
    throw new Error('Project not found or you do not have permission to edit it');
  }

  const { title, description, category, county } = req.body;

  if (title !== undefined) project.title = title;
  if (description !== undefined) project.description = description;
  if (category !== undefined) project.category = category;
  if (county !== undefined) project.county = county;

  // Append new images if uploaded
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));
    project.images.push(...newImages);

    // Update thumbnail to first image if it was empty
    if (!project.thumbnail?.url) {
      project.thumbnail = { url: newImages[0].url, publicId: newImages[0].publicId };
    }
  }

  await project.save();

  const populated = await Project.findById(project._id).populate({
    path: 'professional',
    select: 'profession user',
    populate: { path: 'user', select: 'fullName' },
  });

  res.json({ success: true, project: populated });
});

// @desc    Delete a project (own projects only)
// @route   DELETE /api/projects/:id
// @access  Private (professional)
const deleteProject = asyncHandler(async (req, res) => {
  const professional = await Professional.findOne({ user: req.user._id });

  if (!professional) {
    res.status(404);
    throw new Error('Professional profile not found');
  }

  const project = await Project.findOne({
    _id: req.params.id,
    professional: professional._id,
  });

  if (!project) {
    res.status(404);
    throw new Error('Project not found or you do not have permission to delete it');
  }

  // Delete images from Cloudinary
  for (const img of project.images) {
    if (img.publicId) {
      try {
        await cloudinary.uploader.destroy(img.publicId);
      } catch (err) {
        // Non-fatal – continue even if Cloudinary delete fails
        console.error('Cloudinary delete error:', err.message);
      }
    }
  }

  await project.deleteOne();

  res.json({ success: true, message: 'Project deleted successfully' });
});

// @desc    Admin toggle featured flag
// @route   PUT /api/projects/:id/toggle-featured
// @access  Private (admin)
const toggleFeatured = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  project.isFeatured = !project.isFeatured;
  await project.save();

  res.json({ success: true, isFeatured: project.isFeatured });
});

// @desc    Get all projects for admin
// @route   GET /api/projects/admin/all
// @access  Private (admin)
const getAllProjectsAdmin = asyncHandler(async (req, res) => {
  const projects = await Project.find()
    .populate({
      path: 'professional',
      select: 'profession user',
      populate: { path: 'user', select: 'fullName' },
    })
    .sort({ createdAt: -1 });

  res.json({ success: true, count: projects.length, projects });
});

module.exports = {
  getProjects,
  getFeaturedProjects,
  getProjectById,
  likeProject,
  getMyProjects,
  getMyProjectStats,
  createProject,
  updateProject,
  deleteProject,
  toggleFeatured,
  getAllProjectsAdmin,
};
