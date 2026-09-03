const mongoose = require('mongoose');

const EXPENSE_CATEGORIES = [
  'Materials',
  'Labour',
  'Transport',
  'Professional Fees',
  'Equipment',
  'Permits & Fees',
  'Miscellaneous',
];

const PAYMENT_METHODS = ['Cash', 'M-Pesa', 'Bank Transfer', 'Cheque', 'Other'];

const { CONSTRUCTION_STAGES } = require('./ConstructionProject');

const expenseSchema = new mongoose.Schema(
  {
    constructionProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConstructionProject',
      required: true,
    },
    // Who recorded this expense — the client or an authorized collaborator
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    category: {
      type: String,
      enum: EXPENSE_CATEGORIES,
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 500,
    },
    date: {
      type: Date,
      required: [true, 'Expense date is required'],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: 'Cash',
    },
    // Optional stage association for per-stage budget tracking
    stage: {
      type: String,
      enum: CONSTRUCTION_STAGES,
      default: null,
    },
    // Optional link to an existing Nuru Store (supplier)
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      default: null,
    },
    // Optional link to an existing Nuru Professional
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professional',
      default: null,
    },
    // Optional link to an existing Nuru Product
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    // Receipt image (uploaded to Cloudinary)
    receipt: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    notes: { type: String, trim: true, default: '', maxlength: 1000 },
    // Optional link to a Milestone (Phase 2)
    milestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
      default: null,
    },
    // Optional link to a Task (Phase 2)
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
  },
  { timestamps: true }
);

expenseSchema.index({ constructionProject: 1, date: -1 });
expenseSchema.index({ constructionProject: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
module.exports.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
