const express = require('express');
const router = express.Router();
const {
    getAllPlans,
    getPlanById,
    createPlan,
    updatePlan,
    deletePlan,
} = require('../controllers/companySubscriptionController');
const { verifySuperAdminToken } = require('../controllers/superAdminController');

// Get all plans (public/company)
router.get('/plans', getAllPlans);

// Get single plan (public/company)
router.get('/plans/:planId', getPlanById);

// Create plan (super admin)
router.post('/plans', verifySuperAdminToken, createPlan);

// Update plan (super admin)
router.put('/plans/:planId', verifySuperAdminToken, updatePlan);

// Delete/Deactivate plan (super admin)
router.delete('/plans/:planId', verifySuperAdminToken, deletePlan);

module.exports = router;
