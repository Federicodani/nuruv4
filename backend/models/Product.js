const mongoose = require('mongoose');
const { PRODUCT_CATEGORIES } = require('../config/constants');

const productSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: PRODUCT_CATEGORIES,
    },
   
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 2000,
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    location: {
      type: String,
      required: true,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    // True if this product belongs to the Nuru Electricals store
    // AND falls under an electrical category - used to feature it
    // in electrical-related searches per business rules.
    isFeaturedNuru: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, location: 1 });
productSchema.index({ store: 1 });

module.exports = mongoose.model('Product', productSchema);
