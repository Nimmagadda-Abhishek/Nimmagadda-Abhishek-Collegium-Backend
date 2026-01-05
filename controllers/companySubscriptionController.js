const CompanySubscriptionPlan = require('../models/CompanySubscriptionPlan');

// Get all company subscription plans
const getAllPlans = async (req, res) => {
  try {
    const plans = await CompanySubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    res.status(200).json({ plans });
  } catch (error) {
    console.error('Get all company plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single plan by ID
const getPlanById = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await CompanySubscriptionPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.status(200).json({ plan });
  } catch (error) {
    console.error('Get plan by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new plan (super admin only)
const createPlan = async (req, res) => {
  try {
    const { name, price, duration, features } = req.body;

    if (!name || !price || !features) {
      return res.status(400).json({ error: 'Name, price, and features are required' });
    }

    // Check if plan name already exists
    const existingPlan = await CompanySubscriptionPlan.findOne({ name });
    if (existingPlan) {
      return res.status(400).json({ error: 'Plan with this name already exists' });
    }

    const plan = new CompanySubscriptionPlan({
      name,
      price,
      duration: duration || 'monthly',
      features,
    });

    await plan.save();
    res.status(201).json({
      message: 'Company subscription plan created successfully',
      plan
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a plan (super admin only)
const updatePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const updates = req.body;

    const plan = await CompanySubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (key !== 'name') { // Don't allow name changes
        plan[key] = updates[key];
      }
    });

    await plan.save();
    res.status(200).json({
      message: 'Company subscription plan updated successfully',
      plan
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete/deactivate a plan (super admin only)
const deletePlan = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await CompanySubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    plan.isActive = false;
    await plan.save();

    res.status(200).json({
      message: 'Company subscription plan deactivated successfully'
    });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
};
