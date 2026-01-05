const express = require('express');
const router = express.Router();
const { signup, login, onboarding, getCompanyProfile, getCompanyDashboard, verifyCompanyToken } = require('../controllers/companyAuthController');

// Company signup
router.post('/signup', signup);

// Company login
router.post('/login', login);

// Company onboarding (requires authentication)
router.post('/onboarding', [verifyCompanyToken, ...onboarding]);

// Get company profile (requires authentication)
router.get('/profile', verifyCompanyToken, getCompanyProfile);

// Get company dashboard data (requires authentication)
router.get('/dashboard', verifyCompanyToken, getCompanyDashboard);

module.exports = router;
