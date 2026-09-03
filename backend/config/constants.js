// Centralized constants used across the application.
// Keeping these in one place makes it easy to update categories/professions later.

const PROFESSIONS = [
  'Architect',
  'Contractor',
  'Mason',
  'Carpenter',
  'Welder',
  'Electrician',
  'Solar Technician',
  'Plumber',
  'Painter',
  'Tiler',
  'Project Manager',
  'Roofing Contractor',
  'Interior Designer',
  'Quantity Surveyor',
  'CCTV & Security Installer',
  'Hardware / Materials Supplier',
  'Electrical Supplier',
];

const PRODUCT_CATEGORIES = [
  'Electrical',
  'Building Materials',
  'Plumbing',
  'Roofing',
  'Paint',
  'Tiles',
  'Tools',
];

const USER_ROLES = ['client', 'professional', 'store_owner', 'admin'];

const KENYA_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Uasin Gishu', 'Kiambu',
  'Machakos', 'Kajiado', 'Murang\'a', 'Nyeri', 'Meru', 'Kakamega',
  'Bungoma', 'Kilifi', 'Kisii', 'Trans Nzoia', 'Laikipia', 'Embu',
  'Kitui', 'Garissa', 'Other',
];

// Keywords that should trigger Nuru Electricals to appear as a
// "Recommended Partner" at the top of professional/search results.
const NURU_PRIORITY_KEYWORDS = [
  'electrician',
  'electrical',
  'solar',
  'cctv',
  'electric fence',
  'security',
];

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

module.exports = {
  PROFESSIONS,
  PRODUCT_CATEGORIES,
  PROJECT_CATEGORIES,
  USER_ROLES,
  KENYA_COUNTIES,
  NURU_PRIORITY_KEYWORDS,
  // Re-export from models so controllers can import from one place
  CONSTRUCTION_STAGES: require('../models/ConstructionProject').CONSTRUCTION_STAGES,
  CONSTRUCTION_PROJECT_TYPES: require('../models/ConstructionProject').CONSTRUCTION_PROJECT_TYPES,
  COLLABORATOR_ROLES: require('../models/ConstructionProject').COLLABORATOR_ROLES,
  EXPENSE_CATEGORIES: require('../models/Expense').EXPENSE_CATEGORIES,
  PAYMENT_METHODS: require('../models/Expense').PAYMENT_METHODS,
};
