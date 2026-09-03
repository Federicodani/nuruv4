const express = require('express');
const router = express.Router();
const {
  estimateCost,
  estimateMaterialQuantities,
  getEstimatorOptions,
} = require('../controllers/estimatorController');

router.get('/options', getEstimatorOptions);
router.post('/cost', estimateCost);
router.post('/materials', estimateMaterialQuantities);

module.exports = router;
