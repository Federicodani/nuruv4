const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Professional = require('../models/Professional');
const Store = require('../models/Store');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, confirmPassword, role } = req.body;

  if (!fullName || !email || !phone || !password || !confirmPassword || !role) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  if (password !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ fullName, email, phone, password, role });

  // Auto-create a blank Professional or Store record so the user
  // can complete their profile from the dashboard immediately.
  if (role === 'professional') {
    await Professional.create({
      user: user._id,
      profession: 'Contractor', // default placeholder, editable later
      county: 'Nairobi',
      town: 'Nairobi',
      whatsappNumber: phone,
    });
  }

  if (role === 'store_owner') {
    await Store.create({
      owner: user._id,
      storeName: `${fullName}'s Store`,
      phone,
      whatsappNumber: phone,
      county: 'Nairobi',
      town: 'Nairobi',
    });
  }

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Please contact support.');
  }

  const token = generateToken(user._id, user.role);

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
    },
  });
});

module.exports = { registerUser, loginUser, getMe };
