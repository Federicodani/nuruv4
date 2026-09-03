const mongoose = require('mongoose');
const { PROFESSIONS } = require('../config/constants');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

const professionalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    profession: {
      type: String,
      required: [true, 'Profession is required'],
      enum: PROFESSIONS,
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: 1000,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
    county: {
      type: String,
      required: true,
    },
    town: {
      type: String,
      required: true,
    },
    profileImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    whatsappNumber: {
      type: String,
      trim: true,
    },
    portfolio: [
      {
        url: { type: String },
        publicId: { type: String },
        caption: { type: String, default: '' },
      },
    ],
    reviews: [reviewSchema],
    averageRating: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Special flag identifying the official Nuru Electricals account
    // so it can be prioritized in search results per business rules.
    isNuruElectricals: {
      type: Boolean,
      default: false,
    },
    // Geospatial coordinates for nearby-professional queries (Feature 8)
    // Set when the professional updates their profile with location.
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: null }, // [longitude, latitude]
    },
  },
  { timestamps: true }
);

professionalSchema.index({ profession: 1, county: 1, town: 1 });
// Geospatial index — only active for documents that have coordinates set
professionalSchema.index({ location: '2dsphere' });

// Recalculate average rating whenever reviews change
professionalSchema.methods.recalculateRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
  } else {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = Math.round((total / this.reviews.length) * 10) / 10;
  }
};

module.exports = mongoose.model('Professional', professionalSchema);
