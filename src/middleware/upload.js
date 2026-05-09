const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'repairlink',
    allowed_formats: ['jpeg', 'png', 'webp', 'jpg', 'mp4'],
    resource_type: 'auto'
  }
});

const fileFilter = (req, file, cb) => {
  if (['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'video/mp4'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and MP4 are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter
});

const uploadSingle = (field) => upload.single(field);
const uploadMultiple = (field, maxCount) => upload.array(field, maxCount);

module.exports = {
  uploadSingle,
  uploadMultiple
};
