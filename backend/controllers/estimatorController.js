const asyncHandler = require('express-async-handler');
const { estimateBuildCost, estimateMaterials } = require('../config/constructionRates');
const { KENYA_COUNTIES } = require('../config/constants');

const HOUSE_TYPES = ['Bungalow', 'Maisonette', 'Apartment', 'Rental Flats', 'Commercial Building'];
const FINISH_LEVELS = ['basic', 'standard', 'premium', 'luxury'];

// @desc    Estimate construction cost (rule-based)
// @route   POST /api/estimator/cost
// @access  Public
const estimateCost = asyncHandler(async (req, res) => {
  const { county, houseType, bedrooms, floorArea, finish } = req.body;

  if (!county || !houseType || !bedrooms || !finish) {
    res.status(400);
    throw new Error('County, house type, bedrooms, and finish level are required');
  }

  if (!HOUSE_TYPES.includes(houseType)) {
    res.status(400);
    throw new Error(`Invalid house type. Must be one of: ${HOUSE_TYPES.join(', ')}`);
  }

  if (!FINISH_LEVELS.includes(finish.toLowerCase())) {
    res.status(400);
    throw new Error(`Invalid finish level. Must be one of: ${FINISH_LEVELS.join(', ')}`);
  }

  const result = estimateBuildCost({ county, houseType, bedrooms, floorArea, finish });

  res.json({
    success: true,
    estimate: result,
  });
});

// @desc    Estimate material quantities (rule-based)
// @route   POST /api/estimator/materials
// @access  Public
const estimateMaterialQuantities = asyncHandler(async (req, res) => {
  const { county, houseType, bedrooms, floorArea, finish } = req.body;

  if (!county || !houseType || !bedrooms || !finish) {
    res.status(400);
    throw new Error('County, house type, bedrooms, and finish level are required');
  }

  // First resolve floor area (same logic as cost estimator so they stay consistent)
  const costResult = estimateBuildCost({ county, houseType, bedrooms, floorArea, finish });
  const resolvedArea = costResult.floorArea;

  const materials = estimateMaterials({ floorArea: resolvedArea, finish });

  res.json({
    success: true,
    materials: {
      ...materials,
      county,
      houseType,
      bedrooms: parseInt(bedrooms),
    },
  });
});

// @desc    Get valid options for estimator forms
// @route   GET /api/estimator/options
// @access  Public
const getEstimatorOptions = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    houseTypes: HOUSE_TYPES,
    finishLevels: FINISH_LEVELS,
    counties: KENYA_COUNTIES,
  });
});

module.exports = { estimateCost, estimateMaterialQuantities, getEstimatorOptions };
