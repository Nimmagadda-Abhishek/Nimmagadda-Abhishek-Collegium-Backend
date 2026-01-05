const express = require('express');
const router = express.Router();
const {
    createCompanyOrder,
    verifyCompanyPayment,
    handleCompanyWebhook,
    getCompanySubscription,
} = require('../controllers/companyPaymentController');
const { verifyCompanyToken } = require('../controllers/companyAuthController');

// Create payment order
router.post('/create-order', verifyCompanyToken, createCompanyOrder);

// Verify payment
router.post('/verify', verifyCompanyToken, verifyCompanyPayment);

// Webhook handling
router.post('/webhook', handleCompanyWebhook);

// Get subscription status
router.get('/subscription', verifyCompanyToken, getCompanySubscription);

module.exports = router;
