const mongoose = require('mongoose');

const PROJECT_CATEGORIES = [
  'Modern Houses',
  'Bungalows',
  'Maisonettes',
  'Apartments',
  'Roofing',
  'Electrical',
  'Solar',
  'Plumbing',
  'Painting',
  'Ceilings',
  'Interior Design',
  'Landscaping',
  'Commercial',
  'Industrial',
];

const projectSchema = new mongoose.Schema(
  {
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professional',
      required: [true, 'Professional reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 2000,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: PROJECT_CATEGORIES,
    },
    county: {
      type: String,
      required: [true, 'County is required'],
      trim: true,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    // First image used as thumbnail for listings
    thumbnail: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Admin can mark a project as featured to appear in homepage section
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

projectSchema.index({ title: 'text', description: 'text' });
projectSchema.index({ category: 1, county: 1 });
projectSchema.index({ professional: 1 });
projectSchema.index({ isFeatured: -1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
module.exports.PROJECT_CATEGORIES = PROJECT_CATEGORIES;
