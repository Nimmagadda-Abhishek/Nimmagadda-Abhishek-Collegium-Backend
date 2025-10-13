const express = require('express');
const { createOrUpdateProfile, getProfile } = require('../controllers/profileController');
const { verifyToken } = require('../controllers/authController');

const router = express.Router();

// Create or update profile (protected route)
router.post('/', verifyToken, createOrUpdateProfile);

// Get profile (protected route)
router.get('/', verifyToken, getProfile);

module.exports = router;
