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
  deleteUserAccount,
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getCompanies,
  getCompanyById,
  approveCompany,
  verifyCompany,
  deleteCompany
} = require('../controllers/superAdminController');
const {
  getAllPlans: getAllCompanyPlans,
  createPlan: createCompanyPlan,
  updatePlan: updateCompanyPlan,
  deletePlan: deleteCompanyPlan
} = require('../controllers/companySubscriptionController');

const router = express.Router();

// Register route (one-time setup)
router.post('/register', register);

// Login route
router.post('/login', login);

// Get all college admins route (protected)
router.get('/college-admins', verifySuperAdminToken, getCollegeAdmins);

// Approve/reject college admin route (protected)
router.put('/college-admins/:adminId/approve', verifySuperAdminToken, approveCollegeAdmin);

// Company management routes (protected)
router.get('/companies', verifySuperAdminToken, getCompanies);
router.get('/companies/:companyId', verifySuperAdminToken, getCompanyById);
router.put('/companies/:companyId/approve', verifySuperAdminToken, approveCompany);
router.put('/companies/:companyId/verify', verifySuperAdminToken, verifyCompany);
router.delete('/companies/:companyId', verifySuperAdminToken, deleteCompany);

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

// Subscription plan management routes (protected)
router.get('/subscription-plans', verifySuperAdminToken, getSubscriptionPlans);
router.post('/subscription-plans', verifySuperAdminToken, createSubscriptionPlan);
router.put('/subscription-plans/:planId', verifySuperAdminToken, updateSubscriptionPlan);
router.delete('/subscription-plans/:planId', verifySuperAdminToken, deleteSubscriptionPlan);

// Company Subscription plan management routes (protected)
router.get('/company-subscription-plans', verifySuperAdminToken, getAllCompanyPlans);
router.post('/company-subscription-plans', verifySuperAdminToken, createCompanyPlan);
router.put('/company-subscription-plans/:planId', verifySuperAdminToken, updateCompanyPlan);
router.delete('/company-subscription-plans/:planId', verifySuperAdminToken, deleteCompanyPlan);

module.exports = router;
