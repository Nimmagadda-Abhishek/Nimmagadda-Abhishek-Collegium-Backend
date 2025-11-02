const express = require('express');
const { register, login, getUsers, verifyCollegeAdminToken } = require('../controllers/collegeAdminController');
const { verifyToken } = require('../controllers/authController');

const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get users route (protected)
router.get('/users', verifyToken, getUsers);

module.exports = router;
