const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

// Create payment order (requires auth)
router.post('/create-order', authenticateToken, paymentController.createOrder);

// Verify payment (requires auth)
router.post('/verify', authenticateToken, paymentController.verifyPayment);

// Handle Razorpay webhook (no auth required)
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;