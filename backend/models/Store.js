const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 1000,
    },
    logo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    coverImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      trim: true,
    },
    county: {
      type: String,
      required: true,
    },
    town: {
      type: String,
      required: true,
    },
    // Special flag identifying the official Nuru Electricals store
    isNuruElectricals: {
      type: Boolean,
      default: false,
    },
    // Geospatial coordinates for nearby-store queries (Feature 9)
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: null }, // [longitude, latitude]
    },
  },
  { timestamps: true }
);

storeSchema.index({ storeName: 'text' });
storeSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Store', storeSchema);
