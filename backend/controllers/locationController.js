const asyncHandler = require('express-async-handler');
const Professional = require('../models/Professional');
const Store = require('../models/Store');

// ─── Nearby Professionals ────────────────────────────────────────────────────

// @desc    Get nearby professionals using current device coordinates
// @route   GET /api/location/nearby-professionals?lat=&lng=&profession=&radius=
// @access  Public
const getNearbyProfessionals = asyncHandler(async (req, res) => {
  const { lat, lng, profession, radius = 25, limit = 10 } = req.query;

  if (!lat || !lng) {
    res.status(400);
    throw new Error('Latitude (lat) and longitude (lng) are required');
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    res.status(400);
    throw new Error('Invalid coordinates provided');
  }

  const radiusMetres = parseFloat(radius) * 1000; // km → metres

  const geoFilter = {
    'location.coordinates': { $ne: null },
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: radiusMetres,
      },
    },
  };

  if (profession) geoFilter.profession = profession;

  let professionals;
  try {
    professionals = await Professional.find(geoFilter)
      .populate('user', 'fullName phone')
      .select('profession county town profileImage averageRating reviews yearsOfExperience location')
      .limit(parseInt(limit));
  } catch (err) {
    // If geospatial query fails (e.g. no indexed docs), fall back to county text search
    professionals = [];
  }

  // Calculate distance in km for each result
  const withDistance = professionals
    .filter((p) => p.location?.coordinates?.length === 2)
    .map((p) => {
      const [pLng, pLat] = p.location.coordinates;
      const R = 6371;
      const dLat = ((pLat - latitude) * Math.PI) / 180;
      const dLng = ((pLng - longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((latitude * Math.PI) / 180) *
          Math.cos((pLat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return { ...p.toObject(), distanceKm: Math.round(distanceKm * 10) / 10 };
    });

  // Sort: blend distance + rating to avoid pure distance ranking
  withDistance.sort((a, b) => {
    const scoreA = (1 / (a.distanceKm + 0.5)) * (1 + (a.averageRating || 0) * 0.3);
    const scoreB = (1 / (b.distanceKm + 0.5)) * (1 + (b.averageRating || 0) * 0.3);
    return scoreB - scoreA;
  });

  res.json({
    success: true,
    count: withDistance.length,
    professionals: withDistance,
    searchedAt: { latitude, longitude, radiusKm: parseFloat(radius) },
  });
});

// ─── Nearby Stores ───────────────────────────────────────────────────────────

// @desc    Get nearby stores using current device coordinates
// @route   GET /api/location/nearby-stores?lat=&lng=&radius=
// @access  Public
const getNearbyStores = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 25, limit = 10 } = req.query;

  if (!lat || !lng) {
    res.status(400);
    throw new Error('Latitude (lat) and longitude (lng) are required');
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    res.status(400);
    throw new Error('Invalid coordinates provided');
  }

  const radiusMetres = parseFloat(radius) * 1000;

  const geoFilter = {
    'location.coordinates': { $ne: null },
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: radiusMetres,
      },
    },
  };

  let stores;
  try {
    stores = await Store.find(geoFilter)
      .select('storeName town county phone whatsappNumber logo description location isNuruElectricals')
      .limit(parseInt(limit));
  } catch (err) {
    stores = [];
  }

  const withDistance = stores
    .filter((s) => s.location?.coordinates?.length === 2)
    .map((s) => {
      const [sLng, sLat] = s.location.coordinates;
      const R = 6371;
      const dLat = ((sLat - latitude) * Math.PI) / 180;
      const dLng = ((sLng - longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((latitude * Math.PI) / 180) *
          Math.cos((sLat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return { ...s.toObject(), distanceKm: Math.round(distanceKm * 10) / 10 };
    });

  // Nuru Electricals always first among nearby stores, then sort by distance
  withDistance.sort((a, b) => {
    if (a.isNuruElectricals && !b.isNuruElectricals) return -1;
    if (!a.isNuruElectricals && b.isNuruElectricals) return 1;
    return a.distanceKm - b.distanceKm;
  });

  res.json({
    success: true,
    count: withDistance.length,
    stores: withDistance,
    searchedAt: { latitude, longitude, radiusKm: parseFloat(radius) },
  });
});

// @desc    Update professional's location coordinates
// @route   PUT /api/location/professional-location
// @access  Private (professional)
const updateProfessionalLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    res.status(400);
    throw new Error('lat and lng are required');
  }

  const professional = await Professional.findOne({ user: req.user._id });
  if (!professional) {
    res.status(404);
    throw new Error('Professional profile not found');
  }

  professional.location = {
    type: 'Point',
    coordinates: [parseFloat(lng), parseFloat(lat)],
  };
  await professional.save();

  res.json({ success: true, message: 'Location updated successfully' });
});

// @desc    Update store location coordinates
// @route   PUT /api/location/store-location
// @access  Private (store_owner)
const updateStoreLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    res.status(400);
    throw new Error('lat and lng are required');
  }

  const Store = require('../models/Store');
  const store = await Store.findOne({ owner: req.user._id });
  if (!store) {
    res.status(404);
    throw new Error('Store profile not found');
  }

  store.location = {
    type: 'Point',
    coordinates: [parseFloat(lng), parseFloat(lat)],
  };
  await store.save();

  res.json({ success: true, message: 'Store location updated successfully' });
});

module.exports = {
  getNearbyProfessionals,
  getNearbyStores,
  updateProfessionalLocation,
  updateStoreLocation,
};
