const mongoose = require('mongoose');

const MILESTONE_STATUSES = ['Not Started', 'In Progress', 'Completed', 'Delayed', 'On Hold'];
const MILESTONE_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

// Predefined templates keyed by project type — client can accept, ignore, or customise
const MILESTONE_TEMPLATES = {
  default: [
    'Planning & Design',
    'Site Preparation',
    'Foundation',
    'Walling',
    'Roofing',
    'Plumbing',
    'Electrical',
    'Plastering',
    'Flooring',
    'Painting',
    'Finishing',
    'External Works',
    'Completion & Handover',
  ],
  Bungalow: [
    'Planning & Design',
    'Site Clearing & Preparation',
    'Foundation',
    'Ground Floor Slab',
    'Walling',
    'Roofing',
    'Plumbing Rough-In',
    'Electrical Rough-In',
    'Windows & Doors',
    'Plastering',
    'Tiling & Flooring',
    'Plumbing Finishing',
    'Electrical Finishing',
    'Painting',
    'Interior Finishing',
    'Landscaping & External Works',
    'Completion & Handover',
  ],
  Maisonette: [
    'Planning & Design',
    'Site Preparation',
    'Foundation',
    'Ground Floor Slab',
    'Ground Floor Walling',
    'First Floor Slab',
    'First Floor Walling',
    'Roofing',
    'Plumbing Rough-In',
    'Electrical Rough-In',
    'Windows & Doors',
    'Plastering',
    'Tiling & Flooring',
    'Plumbing Finishing',
    'Electrical Finishing',
    'Painting',
    'Interior Finishing',
    'Completion & Handover',
  ],
  'Commercial Building': [
    'Planning & Design',
    'Site Preparation',
    'Foundation',
    'Columns & Frame',
    'Slabs',
    'Walling',
    'Roofing',
    'Plumbing',
    'Electrical',
    'Windows & Curtain Walls',
    'Plastering & Screeding',
    'Flooring',
    'Ceiling Works',
    'Painting & Finishes',
    'MEP Finishing',
    'External Works',
    'Completion & Handover',
  ],
};

const milestoneSchema = new mongoose.Schema(
  {
    constructionProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConstructionProject',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Milestone name is required'],
      trim: true,
      maxlength: 150,
    },
    description: { type: String, trim: true, default: '', maxlength: 1000 },
    status: {
      type: String,
      enum: MILESTONE_STATUSES,
      default: 'Not Started',
    },
    priority: {
      type: String,
      enum: MILESTONE_PRIORITIES,
      default: 'Medium',
    },
    // Explicit ordering — lower = earlier
    order: { type: Number, default: 0 },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    startDate: { type: Date, default: null },
    plannedCompletionDate: { type: Date, default: null },
    actualCompletionDate: { type: Date, default: null },
    // Optional professional from the project's collaborators
    assignedProfessional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professional',
      default: null,
    },
    // Optional budget allocation for this milestone
    budget: { type: Number, default: null, min: 0 },
    notes: { type: String, trim: true, default: '', maxlength: 2000 },
  },
  { timestamps: true }
);

// ── Logical validation: status ↔ progress ─────────────────────────────────
milestoneSchema.pre('save', function (next) {
  if (this.status === 'Completed') {
    this.progress = 100;
    if (!this.actualCompletionDate) this.actualCompletionDate = new Date();
  } else if (this.status === 'Not Started') {
    this.progress = 0;
  } else if (this.status === 'In Progress') {
    if (this.progress === 0) this.progress = 1;
    if (this.progress === 100) this.progress = 99;
  }
  next();
});

milestoneSchema.index({ constructionProject: 1, order: 1 });
milestoneSchema.index({ constructionProject: 1, status: 1 });

module.exports = mongoose.model('Milestone', milestoneSchema);
module.exports.MILESTONE_STATUSES = MILESTONE_STATUSES;
module.exports.MILESTONE_PRIORITIES = MILESTONE_PRIORITIES;
module.exports.MILESTONE_TEMPLATES = MILESTONE_TEMPLATES;
