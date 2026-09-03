const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');

// @desc    Get all jobs (with search)
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
  const { search, location, status } = req.query;
  const filter = {};

  if (location) filter.location = location;
  filter.status = status || 'open';

  let jobs = await Job.find(filter)
    .populate('client', 'fullName phone')
    .sort({ createdAt: -1 });

  if (search) {
    const term = search.toLowerCase();
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(term) ||
        j.description.toLowerCase().includes(term) ||
        j.location.toLowerCase().includes(term)
    );
  }

  res.json({ success: true, count: jobs.length, jobs });
});

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('client', 'fullName phone');

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  res.json({ success: true, job });
});

// @desc    Get logged-in client's posted jobs
// @route   GET /api/jobs/me/jobs
// @access  Private
const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ client: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: jobs.length, jobs });
});

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private
const createJob = asyncHandler(async (req, res) => {
  const { title, description, budget, location, contactNumber } = req.body;

  if (!title || !description || !budget || !location || !contactNumber) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  const job = await Job.create({
    client: req.user._id,
    title,
    description,
    budget,
    location,
    contactNumber,
  });

  res.status(201).json({ success: true, job });
});

// @desc    Update a job posting
// @route   PUT /api/jobs/:id
// @access  Private (owner only)
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.client.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this job');
  }

  const allowedFields = ['title', 'description', 'budget', 'location', 'contactNumber', 'status'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      job[field] = req.body[field];
    }
  });

  await job.save();

  res.json({ success: true, job });
});

// @desc    Delete a job posting
// @route   DELETE /api/jobs/:id
// @access  Private (owner only)
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (job.client.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this job');
  }

  await job.deleteOne();

  res.json({ success: true, message: 'Job deleted successfully' });
});

module.exports = { getJobs, getJobById, getMyJobs, createJob, updateJob, deleteJob };
