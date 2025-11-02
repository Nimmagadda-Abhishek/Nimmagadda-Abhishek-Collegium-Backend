const UserSubscription = require('../models/UserSubscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Project = require('../models/Project');
const Post = require('../models/Post');
const Event = require('../models/Event');

/**
 * Get user's subscription limits
 * @param {string} userId - User ID
 * @returns {Object} - Limits object { projects: number, chats: number, events: number }
 */
const getUserLimits = async (userId) => {
  try {
    // Get user's active subscription
    const subscription = await UserSubscription.findOne({
      userId,
      status: { $in: ['active', 'trial'] }
    }).populate('planId');

    if (!subscription) {
      // Default to free plan limits
      return { projects: 2, chats: 5, events: 5 };
    }

    const plan = subscription.planId;
    const limits = plan.limits;

    // If limit is 0, treat as unlimited
    return {
      projects: limits.projects || 0,
      chats: limits.chats || 0,
      events: limits.events || 0,
    };
  } catch (error) {
    console.error('Error getting user limits:', error);
    // Return free plan limits on error
    return { projects: 2, chats: 5, events: 5 };
  }
};

/**
 * Check if user has exceeded their limit for a specific action type
 * @param {string} userId - User ID
 * @param {string} actionType - 'projects', 'chats', or 'events'
 * @returns {boolean} - True if limit exceeded, false otherwise
 */
const checkLimitExceeded = async (userId, actionType) => {
  try {
    const limits = await getUserLimits(userId);

    // If limit is 0, unlimited
    if (limits[actionType] === 0) {
      return false;
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    let count = 0;

    if (actionType === 'projects') {
      count = await Project.countDocuments({
        user: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
    } else if (actionType === 'chats') {
      count = await Post.countDocuments({
        user: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
    } else if (actionType === 'events') {
      // Count registrations in current month
      const events = await Event.find({
        'registrations.userId': userId,
        'registrations.registeredAt': { $gte: startOfMonth, $lte: endOfMonth }
      });
      count = events.reduce((total, event) => {
        return total + event.registrations.filter(reg => reg.userId.toString() === userId).length;
      }, 0);
    }

    return count >= limits[actionType];
  } catch (error) {
    console.error('Error checking limit:', error);
    // On error, allow the action to prevent blocking users
    return false;
  }
};

module.exports = {
  getUserLimits,
  checkLimitExceeded,
};
