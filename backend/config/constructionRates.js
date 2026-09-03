/**
 * Rule-based construction rates for Kenya.
 * Rates are cost per square metre (KSh/sqm) for structural + finishes.
 * These are approximate market figures (2024 Kenya market) — not ML predictions.
 *
 * Tier structure: basic < standard < premium < luxury
 * Each tier has { min, max } to return a cost RANGE rather than a single figure.
 *
 * County multipliers adjust Nairobi base rates by locality cost-of-living factor.
 */

// Base rates per sqm in KSh (Nairobi baseline)
const BASE_RATES = {
  basic:    { min: 28000, max: 34000 },
  standard: { min: 38000, max: 48000 },
  premium:  { min: 55000, max: 70000 },
  luxury:   { min: 80000, max: 110000 },
};

// County cost multipliers relative to Nairobi = 1.0
const COUNTY_MULTIPLIERS = {
  'Nairobi':       1.00,
  'Mombasa':       0.95,
  'Kisumu':        0.85,
  'Nakuru':        0.88,
  'Uasin Gishu':   0.85,
  'Kiambu':        0.95,
  'Machakos':      0.82,
  'Kajiado':       0.88,
  "Murang'a":      0.80,
  'Nyeri':         0.83,
  'Meru':          0.80,
  'Kakamega':      0.78,
  'Bungoma':       0.76,
  'Kilifi':        0.80,
  'Kisii':         0.78,
  'Trans Nzoia':   0.76,
  'Laikipia':      0.80,
  'Embu':          0.80,
  'Kitui':         0.76,
  'Garissa':       0.75,
  'Other':         0.80,
};

// Default floor areas (sqm) if user does not specify — based on house type + bedrooms
const DEFAULT_FLOOR_AREAS = {
  Bungalow: {
    1: 55,   // Studio / 1BR bungalow
    2: 80,
    3: 110,
    4: 145,
    5: 180,
  },
  Maisonette: {
    2: 100,
    3: 140,
    4: 175,
    5: 220,
  },
  Apartment: {
    1: 45,
    2: 70,
    3: 100,
    4: 130,
    5: 160,
  },
  'Rental Flats': {
    1: 35,
    2: 55,
    3: 75,
    4: 95,
    5: 115,
  },
  'Commercial Building': {
    // For commercial, bedrooms param is treated as number of floors
    1: 200,
    2: 400,
    3: 600,
    4: 800,
    5: 1000,
  },
};

/**
 * Compute estimated construction cost range.
 * @param {object} params
 * @param {string} params.county
 * @param {string} params.houseType
 * @param {number} params.bedrooms
 * @param {number|null} params.floorArea  – if null, auto-estimated
 * @param {string} params.finish  – basic | standard | premium | luxury
 * @returns {{ floorArea, min, max, county, houseType, bedrooms, finish }}
 */
const estimateBuildCost = ({ county, houseType, bedrooms, floorArea, finish }) => {
  const resolvedFinish = finish?.toLowerCase() || 'standard';
  const rate = BASE_RATES[resolvedFinish] || BASE_RATES.standard;

  const multiplier = COUNTY_MULTIPLIERS[county] || 0.85;

  // Auto-estimate floor area if not provided
  const bedroomKey = Math.min(Math.max(parseInt(bedrooms) || 3, 1), 5);
  const houseAreas = DEFAULT_FLOOR_AREAS[houseType] || DEFAULT_FLOOR_AREAS['Bungalow'];
  const resolvedArea = floorArea && floorArea > 0
    ? parseFloat(floorArea)
    : (houseAreas[bedroomKey] || houseAreas[Object.keys(houseAreas)[0]]);

  const minCost = Math.round(resolvedArea * rate.min * multiplier);
  const maxCost = Math.round(resolvedArea * rate.max * multiplier);

  return {
    floorArea: resolvedArea,
    minCost,
    maxCost,
    ratePerSqmMin: Math.round(rate.min * multiplier),
    ratePerSqmMax: Math.round(rate.max * multiplier),
    county,
    houseType,
    bedrooms: bedroomKey,
    finish: resolvedFinish,
    countyMultiplier: multiplier,
  };
};

// ─── Material quantity estimation rules ─────────────────────────────────────

/**
 * Engineering rule-of-thumb material estimates per sqm of floor area.
 * Sources: Kenyan QS industry benchmarks (2024).
 */
const MATERIAL_RULES = {
  // Cement bags (50kg) per sqm  ─ foundation + slab + plaster + screed
  cementBagsPerSqm: {
    basic:    0.55,
    standard: 0.65,
    premium:  0.75,
    luxury:   0.85,
  },

  // Sand (tonnes) per sqm
  sandTonnesPerSqm: {
    basic:    0.12,
    standard: 0.15,
    premium:  0.18,
    luxury:   0.22,
  },

  // Ballast (tonnes) per sqm  ─ concrete in foundations + slab
  ballastTonnesPerSqm: {
    basic:    0.10,
    standard: 0.13,
    premium:  0.16,
    luxury:   0.20,
  },

  // Roof area is typically 25–40% larger than floor area for overhang + pitch
  roofAreaMultiplier: 1.30,

  // Roofing sheets (count) per sqm of roof area — iron sheet standard size ~0.6m effective width
  roofingSheetsPerSqmRoof: 1.70,

  // Paint (litres) per sqm of floor area ─ 2 coats interior + exterior walls
  paintLitresPerSqm: {
    basic:    0.40,
    standard: 0.55,
    premium:  0.70,
    luxury:   0.90,
  },

  // Tiles (sqm) = floor area × coverage factor (some areas may not be tiled)
  tiledAreaFraction: {
    basic:    0.60,  // bathrooms + kitchen only
    standard: 0.80,  // all wet + living areas
    premium:  0.95,  // almost everywhere except bedrooms (wooden floor)
    luxury:   1.00,  // everywhere + feature walls
  },
};

/**
 * Estimate material quantities for a given build.
 */
const estimateMaterials = ({ floorArea, finish }) => {
  const resolvedFinish = finish?.toLowerCase() || 'standard';
  const area = parseFloat(floorArea) || 100;

  const cementBags      = Math.ceil(area * (MATERIAL_RULES.cementBagsPerSqm[resolvedFinish] || 0.65));
  const sandTonnes      = +(area * (MATERIAL_RULES.sandTonnesPerSqm[resolvedFinish] || 0.15)).toFixed(1);
  const ballastTonnes   = +(area * (MATERIAL_RULES.ballastTonnesPerSqm[resolvedFinish] || 0.13)).toFixed(1);
  const roofArea        = +(area * MATERIAL_RULES.roofAreaMultiplier).toFixed(1);
  const roofingSheets   = Math.ceil(roofArea * MATERIAL_RULES.roofingSheetsPerSqmRoof);
  const paintLitres     = Math.ceil(area * (MATERIAL_RULES.paintLitresPerSqm[resolvedFinish] || 0.55));
  const tiledAreaSqm    = +(area * (MATERIAL_RULES.tiledAreaFraction[resolvedFinish] || 0.80)).toFixed(1);

  return {
    cementBags,
    sandTonnes,
    ballastTonnes,
    roofArea,
    roofingSheets,
    paintLitres,
    tiledAreaSqm,
    floorArea: area,
    finish: resolvedFinish,
  };
};

module.exports = {
  BASE_RATES,
  COUNTY_MULTIPLIERS,
  DEFAULT_FLOOR_AREAS,
  MATERIAL_RULES,
  estimateBuildCost,
  estimateMaterials,
};
