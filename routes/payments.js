const express = require('express');
const { createOrder, verifyPayment, handleWebhook } = require('../controllers/paymentController');
const { verifyToken } = require('../controllers/authController');

const router = express.Router();

// ====================
// 🔒 Protected Routes
// ====================
router.post('/create-order', verifyToken, createOrder);
router.post('/verify', verifyToken, verifyPayment);

// ====================
// 🪝 Webhook Route (No auth needed, but verify signature)
// ====================
router.post('/webhook', handleWebhook);

module.exports = router;
