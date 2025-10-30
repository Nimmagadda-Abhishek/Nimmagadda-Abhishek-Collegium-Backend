const express = require('express');
const {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getUserSubscription,
  subscribe,
  cancelSubscription,
  getSubscriptionHistory,
  startTrial,
  getTrialStatus,
  convertTrial,
} = require('../controllers/subscriptionController');
const { verifyToken } = require('../controllers/authController');

const router = express.Router();

// ====================
// 📋 Public Routes
// ====================
router.get('/plans', getPlans);

// ====================
// 🔒 Protected Routes (User)
// ====================
router.get('/user', verifyToken, getUserSubscription);
router.post('/subscribe', verifyToken, subscribe);
router.put('/cancel', verifyToken, cancelSubscription);
router.get('/history', verifyToken, getSubscriptionHistory);

// ====================
// 🧪 Trial Routes
// ====================
router.post('/trials/start', verifyToken, startTrial);
router.get('/trials/status', verifyToken, getTrialStatus);
router.post('/trials/convert', verifyToken, convertTrial);

// ====================
// 👑 Admin Routes (Add admin middleware if needed)
// ====================
router.post('/plans', verifyToken, createPlan); // TODO: Add admin check
router.put('/plans/:id', verifyToken, updatePlan); // TODO: Add admin check
router.delete('/plans/:id', verifyToken, deletePlan); // TODO: Add admin check

module.exports = router;
