const mongoose = require('mongoose');

// ─── Construction Stages ────────────────────────────────────────────────────
const CONSTRUCTION_STAGES = [
  'Planning & Design',
  'Site Preparation',
  'Foundation',
  'Walling / Superstructure',
  'Roofing',
  'Electrical Rough-In',
  'Plumbing Rough-In',
  'Plastering & Screeding',
  'Windows & Doors',
  'Electrical Finishing',
  'Plumbing Finishing',
  'Tiling',
  'Painting',
  'Interior Finishing',
  'Landscaping',
  'Completion & Handover',
];

// ─── Project Types ───────────────────────────────────────────────────────────
const CONSTRUCTION_PROJECT_TYPES = [
  'Bungalow',
  'Maisonette',
  'Apartment',
  'Rental Flats',
  'Commercial Building',
  'Renovation / Extension',
  'Other',
];

// ─── Collaborator Roles ──────────────────────────────────────────────────────
const COLLABORATOR_ROLES = [
  'Contractor',
  'Architect',
  'Engineer',
  'Quantity Surveyor',
  'Electrician',
  'Plumber',
  'Site Supervisor',
  'Project Manager',
  'Other Professional',
  'Viewer',
];

// ─── Collaborator Permissions ────────────────────────────────────────────────
// Centralised permission map — checked by the authorize middleware
const COLLABORATOR_PERMISSIONS = {
  Contractor: ['view', 'upload_photos', 'add_updates', 'add_expenses'],
  Architect: ['view', 'upload_photos', 'add_updates'],
  Engineer: ['view', 'upload_photos', 'add_updates'],
  'Quantity Surveyor': ['view', 'upload_photos', 'add_updates', 'add_expenses'],
  Electrician: ['view', 'upload_photos', 'add_updates', 'add_expenses'],
  Plumber: ['view', 'upload_photos', 'add_updates', 'add_expenses'],
  'Site Supervisor': ['view', 'upload_photos', 'add_updates', 'add_expenses'],
  'Project Manager': ['view', 'upload_photos', 'add_updates', 'add_expenses'],
  'Other Professional': ['view', 'upload_photos', 'add_updates'],
  Viewer: ['view'],
};

// ─── Collaborator Sub-Schema ─────────────────────────────────────────────────
const collaboratorSchema = new mongoose.Schema(
  {
    // Links to an existing Professional registered on Nuru
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professional',
      required: true,
    },
    role: {
      type: String,
      enum: COLLABORATOR_ROLES,
      required: true,
    },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ─── Main ConstructionProject Schema ─────────────────────────────────────────
const constructionProjectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: 150,
    },
    projectType: {
      type: String,
      enum: CONSTRUCTION_PROJECT_TYPES,
      required: true,
    },
    county: { type: String, required: true, trim: true },
    town: { type: String, trim: true, default: '' },
    // Location for geospatial project queries (future use)
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    budget: {
      type: Number,
      required: [true, 'Project budget is required'],
      min: 0,
    },
    startDate: { type: Date, default: null },
    expectedCompletionDate: { type: Date, default: null },
    currentStage: {
      type: String,
      enum: CONSTRUCTION_STAGES,
      default: 'Planning & Design',
    },
    // 0–100 progress percentage set manually by the client
    progress: { type: Number, default: 0, min: 0, max: 100 },
    description: { type: String, trim: true, default: '', maxlength: 2000 },
    collaborators: [collaboratorSchema],
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Geospatial index for future project-location queries
constructionProjectSchema.index({ location: '2dsphere' });
constructionProjectSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('ConstructionProject', constructionProjectSchema);
module.exports.CONSTRUCTION_STAGES = CONSTRUCTION_STAGES;
module.exports.CONSTRUCTION_PROJECT_TYPES = CONSTRUCTION_PROJECT_TYPES;
module.exports.COLLABORATOR_ROLES = COLLABORATOR_ROLES;
module.exports.COLLABORATOR_PERMISSIONS = COLLABORATOR_PERMISSIONS;
