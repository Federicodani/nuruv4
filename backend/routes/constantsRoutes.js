const express = require('express');
const router = express.Router();
const {
  PROFESSIONS,
  PRODUCT_CATEGORIES,
  PROJECT_CATEGORIES,
  KENYA_COUNTIES,
  CONSTRUCTION_STAGES,
  CONSTRUCTION_PROJECT_TYPES,
  COLLABORATOR_ROLES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
} = require('../config/constants');

// @desc    Get shared dropdown/filter constants used by the frontend
// @route   GET /api/constants
// @access  Public
router.get('/', (req, res) => {
  res.json({
    success: true,
    professions: PROFESSIONS,
    productCategories: PRODUCT_CATEGORIES,
    projectCategories: PROJECT_CATEGORIES,
    counties: KENYA_COUNTIES,
    constructionStages: CONSTRUCTION_STAGES,
    constructionProjectTypes: CONSTRUCTION_PROJECT_TYPES,
    collaboratorRoles: COLLABORATOR_ROLES,
    expenseCategories: EXPENSE_CATEGORIES,
    paymentMethods: PAYMENT_METHODS,
  });
});

module.exports = router;
