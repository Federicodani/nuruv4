const mongoose = require('mongoose');

const TASK_STATUSES = ['To Do', 'In Progress', 'Completed', 'Delayed', 'Cancelled'];
const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const taskSchema = new mongoose.Schema(
  {
    constructionProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConstructionProject',
      required: true,
    },
    milestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: 200,
    },
    description: { type: String, trim: true, default: '', maxlength: 1000 },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: 'To Do',
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: 'Medium',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    // Optional: links to an existing Nuru Professional (from the project team)
    assignedProfessional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professional',
      default: null,
    },
    startDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    completedDate: { type: Date, default: null },
    notes: { type: String, trim: true, default: '', maxlength: 1000 },
    // Optional link to an expense recorded in the existing Expense collection
    expense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      default: null,
    },
    // Who last updated this task
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// ── Logical validation: status ↔ progress ─────────────────────────────────
taskSchema.pre('save', function (next) {
  if (this.status === 'Completed') {
    this.progress = 100;
    if (!this.completedDate) this.completedDate = new Date();
  } else if (this.status === 'To Do' || this.status === 'Cancelled') {
    if (this.status === 'To Do') this.progress = 0;
  } else if (this.status === 'In Progress') {
    if (this.progress === 0) this.progress = 1;
    if (this.progress === 100) this.progress = 99;
  }
  next();
});

taskSchema.index({ constructionProject: 1, milestone: 1 });
taskSchema.index({ constructionProject: 1, status: 1 });
taskSchema.index({ assignedProfessional: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
module.exports.TASK_STATUSES = TASK_STATUSES;
module.exports.TASK_PRIORITIES = TASK_PRIORITIES;
