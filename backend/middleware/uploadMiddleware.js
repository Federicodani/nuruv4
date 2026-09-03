const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Generic factory to create an upload middleware for a given Cloudinary folder
const createUploader = (folder) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `nuru-construction-hub/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto' }],
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    },
  });
};

module.exports = {
  uploadProfileImage: createUploader('profiles'),
  uploadCoverImage: createUploader('covers'),
  uploadPortfolio: createUploader('portfolio'),
  uploadStoreImages: createUploader('stores'),
  uploadProductImages: createUploader('products'),
  uploadProjectImages: createUploader('projects'),
  uploadReceipts: createUploader('receipts'),
};
