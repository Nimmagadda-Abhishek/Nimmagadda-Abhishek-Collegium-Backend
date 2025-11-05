const express = require('express');
const {
  register,
  login,
  getCollegeAdmins,
  approveCollegeAdmin,
  createCollege,
  getColleges,
  updateCollege,
  deleteCollege,
  getAllUsers,
  getAllEvents,
  getAllProjects,
  getAllSubscriptions,
  sendNotification,
  verifySuperAdminToken,
  blockUser,
  unblockUser,
  deleteUserAccount
} = require('../controllers/superAdminController');

const router = express.Router();

// Register route (one-time setup)
router.post('/register', register);

// Login route
router.post('/login', login);

// Get all college admins route (protected)
router.get('/college-admins', verifySuperAdminToken, getCollegeAdmins);

// Approve/reject college admin route (protected)
router.put('/college-admins/:adminId/approve', verifySuperAdminToken, approveCollegeAdmin);

// Get all users route (protected)
router.get('/users', verifySuperAdminToken, getAllUsers);

// Get all events route (protected)
router.get('/events', verifySuperAdminToken, getAllEvents);

// Get all projects route (protected)
router.get('/projects', verifySuperAdminToken, getAllProjects);

// Get all subscriptions route (protected)
router.get('/subscriptions', verifySuperAdminToken, getAllSubscriptions);

// College management routes (protected)
router.post('/colleges', verifySuperAdminToken, createCollege);
router.get('/colleges', verifySuperAdminToken, getColleges);
router.put('/colleges/:collegeId', verifySuperAdminToken, updateCollege);
router.delete('/colleges/:collegeId', verifySuperAdminToken, deleteCollege);

// User management routes (protected)
router.post('/users/:userId/block', verifySuperAdminToken, blockUser);
router.post('/users/:userId/unblock', verifySuperAdminToken, unblockUser);
router.delete('/users/:userId', verifySuperAdminToken, deleteUserAccount);

// Send notification route (protected)
router.post('/notifications', verifySuperAdminToken, sendNotification);

module.exports = router;
