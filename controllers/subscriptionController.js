const SubscriptionPlan = require('../models/SubscriptionPlan');
const UserSubscription = require('../models/UserSubscription');
const User = require('../models/User');

// ====================
// 📋 Get All Subscription Plans
// ====================
const getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ active: true }).sort({ price: 1 });
    res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error('❌ Get plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// ➕ Create Subscription Plan (Admin)
// ====================
const createPlan = async (req, res) => {
  try {
    const { name, price, period, description, features, limits, hasTrial, trialPrice, trialDays, popular } = req.body;

    const plan = new SubscriptionPlan({
      name,
      price,
      period,
      description,
      features,
      limits,
      hasTrial,
      trialPrice,
      trialDays,
      popular,
    });

    await plan.save();
    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      plan,
    });
  } catch (error) {
    console.error('❌ Create plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// 🔄 Update Subscription Plan (Admin)
// ====================
const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const plan = await SubscriptionPlan.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Plan updated successfully',
      plan,
    });
  } catch (error) {
    console.error('❌ Update plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// 🗑️ Delete Subscription Plan (Admin)
// ====================
const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findByIdAndUpdate(id, { active: false }, { new: true });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Plan deactivated successfully',
    });
  } catch (error) {
    console.error('❌ Delete plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// 👤 Get User's Current Subscription
// ====================
const getUserSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;

    const subscription = await UserSubscription.findOne({ userId }).populate('planId');

    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error('❌ Get user subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// 💳 Subscribe to a Plan
// ====================
const subscribe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { planId, paymentMethod } = req.body;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const startDate = new Date();
    let endDate = new Date(startDate);
    let status = 'active';
    let trialEndDate = null;

    if (plan.hasTrial) {
      status = 'trial';
      trialEndDate = new Date(startDate);
      trialEndDate.setDate(trialEndDate.getDate() + plan.trialDays);
      endDate.setDate(endDate.getDate() + plan.trialDays);
    } else {
      if (plan.period === 'month') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
    }

    const subscription = new UserSubscription({
      userId,
      planId,
      status,
      startDate,
      endDate,
      trialEndDate,
      paymentMethod,
    });

    await subscription.save();

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      subscription,
    });
  } catch (error) {
    console.error('❌ Subscribe error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// ❌ Cancel Subscription
// ====================
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.userId;

    const subscription = await UserSubscription.findOneAndUpdate(
      { userId, status: { $in: ['active', 'trial'] } },
      { status: 'cancelled', autoRenew: false, updatedAt: new Date() },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ error: 'Active subscription not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription,
    });
  } catch (error) {
    console.error('❌ Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// 📜 Get Subscription History
// ====================
const getSubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const history = await UserSubscription.find({ userId }).populate('planId').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('❌ Get subscription history error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// 🧪 Start Trial Period
// ====================
const startTrial = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { planId } = req.body;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.hasTrial) {
      return res.status(400).json({ error: 'Trial not available for this plan' });
    }

    const existingTrial = await UserSubscription.findOne({ userId, status: 'trial' });
    if (existingTrial) {
      return res.status(400).json({ error: 'Trial already active' });
    }

    const startDate = new Date();
    const trialEndDate = new Date(startDate);
    trialEndDate.setDate(trialEndDate.getDate() + plan.trialDays);

    const subscription = new UserSubscription({
      userId,
      planId,
      status: 'trial',
      startDate,
      endDate: trialEndDate,
      trialEndDate,
      paymentMethod: 'trial',
    });

    await subscription.save();

    res.status(201).json({
      success: true,
      message: 'Trial started successfully',
      subscription,
    });
  } catch (error) {
    console.error('❌ Start trial error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// 📊 Get Trial Status
// ====================
const getTrialStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    const trial = await UserSubscription.findOne({ userId, status: 'trial' }).populate('planId');

    if (!trial) {
      return res.status(404).json({ error: 'No active trial found' });
    }

    const now = new Date();
    const daysLeft = Math.ceil((trial.trialEndDate - now) / (1000 * 60 * 60 * 24));

    res.status(200).json({
      success: true,
      trial: {
        ...trial.toObject(),
        daysLeft,
      },
    });
  } catch (error) {
    console.error('❌ Get trial status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// 🔄 Convert Trial to Paid Subscription
// ====================
const convertTrial = async (req, res) => {
  try {
    const userId = req.user.userId;

    const trial = await UserSubscription.findOne({ userId, status: 'trial' });
    if (!trial) {
      return res.status(404).json({ error: 'No active trial found' });
    }

    const plan = await SubscriptionPlan.findById(trial.planId);
    let endDate = new Date();

    if (plan.period === 'month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    trial.status = 'active';
    trial.endDate = endDate;
    trial.updatedAt = new Date();

    await trial.save();

    res.status(200).json({
      success: true,
      message: 'Trial converted to paid subscription successfully',
      subscription: trial,
    });
  } catch (error) {
    console.error('❌ Convert trial error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// 🚀 Export
// ====================
module.exports = {
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
};
