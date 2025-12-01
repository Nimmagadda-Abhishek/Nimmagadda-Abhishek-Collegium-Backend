const express = require('express');
const { createOrUpdateProfile, getProfile, getCollegeUsers, upload } = require('../controllers/profileController');
const { verifyToken } = require('../controllers/authController');
const multer = require('multer');

const router = express.Router();

// Custom error handler for Multer
const uploadWithErrorHandler = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        error: 'File upload error',
        details: err.message,
      });
    } else if (err) {
      // An unknown error occurred when uploading.
      console.error('Unknown upload error:', err);
      return res.status(500).json({
        success: false,
        error: 'Internal server error during upload',
        details: err.message,
      });
    }
    // Everything went fine.
    next();
  });
};


// Create or update profile (protected route) - with multer middleware for image upload
const multerUpload = uploadWithErrorHandler(upload.single('profileImage'));

const conditionalMulter = (req, res, next) => {
  if (req.is('multipart/form-data')) {
    multerUpload(req, res, next);
  } else {
    next();
  }
};

// Create or update profile (protected route) - with conditional multer middleware
router.post('/', verifyToken, conditionalMulter, createOrUpdateProfile);

// Get profile (protected route)
router.get('/', verifyToken, getProfile);

// Get college users (protected route)
router.get('/college-users', verifyToken, getCollegeUsers);

module.exports = router;
