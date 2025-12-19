const Notification = require('../models/Notification');
const User = require('../models/User');
const Event = require('../models/Event');
const UserSubscription = require('../models/UserSubscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const { sendPushNotification, sendPushNotificationToMultiple } = require('./firebaseService');
const { convertToFirebaseUid, convertToFirebaseUids, getUserByIdentifier } = require('./userUtils');

// Helper functions for subscription notifications
const MILESTONES = [1, 3, 7, 14, 30]; // Days before expiration

const daysUntil = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const alreadyNotified = async (userId, type, key, value) => {
  const existing = await Notification.findOne({
    userId,
    type,
    [`data.${key}`]: value,
  });
  return !!existing;
};

// Create a notification
const createNotification = async (userId, type, title, message, data = {}, expiresAt = null) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data,
      expiresAt,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notifications for a user
const getUserNotifications = async (userId, limit = 50, offset = 0) => {
  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

// Mark notification as read
const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
const markAllAsRead = async (userId) => {
  try {
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete a notification
const deleteNotification = async (notificationId, userId) => {
  try {
    await Notification.findOneAndDelete({ _id: notificationId, userId });
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Clean up expired notifications
const cleanupExpiredNotifications = async () => {
  try {
    const result = await Notification.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    console.log(`Cleaned up ${result.deletedCount} expired notifications`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
    throw error;
  }
};

// Event reminder notification (2 days before event)
const sendEventReminder = async (eventId) => {
  try {
    const event = await Event.findById(eventId).populate('registrations.userId');
    if (!event) return;

    const reminderDate = new Date(event.date);
    reminderDate.setDate(reminderDate.getDate() - 2);

    // Only send if it's time to remind (approximately now)
    const now = new Date();
    if (Math.abs(now - reminderDate) > 24 * 60 * 60 * 1000) return; // Within 24 hours window

    for (const registration of event.registrations) {
      await createNotification(
        registration.userId._id,
        'event_reminder',
        'Event Reminder',
        `Don't forget! The event "${event.title}" is happening in 2 days on ${event.date.toDateString()}.`,
        { eventId: event._id, eventDate: event.date },
        new Date(event.date.getTime() + 24 * 60 * 60 * 1000) // Expires 1 day after event
      );
    }
  } catch (error) {
    console.error('Error sending event reminders:', error);
  }
};

// New event notification (to all college users)
const sendNewEventNotification = async (eventId) => {
  try {
    const event = await Event.findById(eventId).populate('createdBy', 'displayName');
    if (!event) return;

    const users = await User.find({ collegeId: event.collegeId, isDeleted: false });
    const userIds = users.map(user => user._id);

    // Send push notifications to all users
    try {
      await sendPushNotificationToMultiple(
        userIds,
        'New Event Posted',
        `${event.createdBy.displayName} posted a new event: "${event.title}" on ${event.date.toDateString()}.`,
        { eventId: event._id.toString(), eventDate: event.date.toISOString() }
      );
    } catch (pushError) {
      console.error('Push notification failed for new event:', pushError);
    }

    // Create in-app notifications
    for (const user of users) {
      await createNotification(
        user._id,
        'new_event',
        'New Event Posted',
        `${event.createdBy.displayName} posted a new event: "${event.title}" on ${event.date.toDateString()}.`,
        { eventId: event._id, eventDate: event.date },
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
        false // Don't send push again
      );
    }
  } catch (error) {
    console.error('Error sending new event notifications:', error);
  }
};

// Post like notification
const sendPostLikeNotification = async (postId, likerId) => {
  try {
    const Post = require('../models/Post');
    const post = await Post.findById(postId).populate('user', 'displayName');
    if (!post || post.user._id.toString() === likerId.toString()) return;

    const liker = await User.findById(likerId);
    if (!liker) return;

    await createNotification(
      post.user._id,
      'post_like',
      'Post Liked',
      `${liker.displayName} liked your post.`,
      { postId, likerId },
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
    );
  } catch (error) {
    console.error('Error sending post like notification:', error);
  }
};

// Post comment notification
const sendPostCommentNotification = async (postId, commenterId, commentText) => {
  try {
    const Post = require('../models/Post');
    const post = await Post.findById(postId).populate('user', 'displayName');
    if (!post || post.user._id.toString() === commenterId.toString()) return;

    const commenter = await User.findById(commenterId);
    if (!commenter) return;

    await createNotification(
      post.user._id,
      'post_comment',
      'New Comment',
      `${commenter.displayName} commented on your post: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`,
      { postId, commenterId, commentText },
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
    );
  } catch (error) {
    console.error('Error sending post comment notification:', error);
  }
};

const sendSubscriptionEndingNotifications = async (subscriptionId) => {
  try {
    const sub = await UserSubscription.findById(subscriptionId)
      .populate('userId', 'displayName')
      .populate('planId', 'name');
    if (!sub || !sub.endDate || !sub.userId || !sub.planId) return;

    // Only for active or trial subs that haven't ended
    if (!['active', 'trial'].includes(sub.status)) return;

    const d = daysUntil(sub.endDate);
    if (!MILESTONES.includes(d)) return;

    // Idempotency: one notification per milestone per subscription
    const notified = await alreadyNotified(
      sub.userId._id,
      'subscription_ending',
      'milestone',
      d
    );
    if (notified) return;

    const friendly = d === 1 ? '1 day' : `${d} days`;
    await createNotification(
      sub.userId._id,
      'subscription_ending',
      'Subscription Ending Soon',
      `⏳ Your ${sub.planId.name} plan expires in ${friendly}. Renew now to keep all premium features.`,
      { subscriptionId, endDate: sub.endDate, milestone: d },
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // hide after 14 days
    );
  } catch (error) {
    console.error('Error(sendSubscriptionEndingNotifications):', error);
  }
};

// Expired (send once)
const sendSubscriptionExpiredNotification = async (subscriptionId) => {
  try {
    const sub = await UserSubscription.findById(subscriptionId)
      .populate('userId', 'displayName')
      .populate('planId', 'name');
    if (!sub || !sub.endDate || !sub.userId || !sub.planId) return;

    // Only fire when actually expired and not already notified
    if (new Date() < new Date(sub.endDate)) return;

    const already = await alreadyNotified(
      sub.userId._id,
      'subscription_expired',
      'subscriptionId',
      String(subscriptionId)
    );
    if (already) return;

    await createNotification(
      sub.userId._id,
      'subscription_expired',
      'Subscription Expired',
      `❌ Your ${sub.planId.name} plan has expired. Renew to unlock premium features again.`,
      { subscriptionId, expiredAt: sub.endDate },
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );
  } catch (error) {
    console.error('Error(sendSubscriptionExpiredNotification):', error);
  }
};

// Upgrade nudges (no more than once per 7 days)
const sendSubscriptionUpgradeReminder = async (userId) => {
  try {
    const user = await User.findById(userId).select('_id');
    if (!user) return;

    const sub = await UserSubscription.findOne({
      userId,
      status: { $in: ['trial', 'active'] },
    }).populate('planId', 'name');
    if (!sub) return;

    const recent = await Notification.findOne({
      userId,
      type: 'subscription_upgrade',
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }).select('_id');

    if (recent) return;

    await createNotification(
      userId,
      'subscription_upgrade',
      'Upgrade Your Plan',
      `🔥 Level up your experience with Collegium Pro. Your current ${sub.planId.name} plan has limits — see what you’re missing.`,
      { currentPlanId: sub.planId._id, subscriptionId: sub._id },
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );
  } catch (error) {
    console.error('Error(sendSubscriptionUpgradeReminder):', error);
  }
};

// Admin custom notification
const sendAdminCustomNotification = async (userIds, title, message, data = {}) => {
  try {
    const notifications = [];
    for (const userId of userIds) {
      const notification = await createNotification(
        userId,
        'admin_custom',
        title,
        message,
        data,
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
      );
      notifications.push(notification);
    }
    return notifications;
  } catch (error) {
    console.error('Error sending admin custom notifications:', error);
    throw error;
  }
};

// Offline message notification
const sendOfflineMessageNotification = async (receiverId, senderId, message) => {
  try {
    const sender = await User.findById(senderId);
    if (!sender) return;

    await createNotification(
      receiverId,
      'message_offline',
      'New Message',
      `${sender.displayName} sent you a message while you were offline: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`,
      { senderId, message },
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
    );
  } catch (error) {
    console.error('Error sending offline message notification:', error);
  }
};

// Welcome notification for new users
const sendWelcomeNotification = async (userId) => {
  try {
    await createNotification(
      userId,
      'welcome',
      'Welcome to Collegium!',
      'Welcome to Collegium! 🎉 Explore events, connect with peers, and make the most of your college experience.',
      {},
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
    );
  } catch (error) {
    console.error('Error sending welcome notification:', error);
  }
};

// Login welcome back notification
const sendLoginWelcomeBackNotification = async (userId) => {
  try {
    // Don't send more than once per 24 hours
    const recent = await Notification.findOne({
      userId,
      type: 'login_welcome_back',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }).select('_id');

    if (recent) return;

    await createNotification(
      userId,
      'login_welcome_back',
      'Welcome Back to Collegium!',
      'Welcome back to Collegium! Make wonders by connecting with your College Buddy! 🎉',
      {},
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
    );
  } catch (error) {
    console.error('Error sending login welcome back notification:', error);
  }
};// Send promotional notification to all users (for promotions or new features)
const sendPromotionalNotification = async (title, message, data = {}) => {
  try {
    const users = await User.find({ isDeleted: false });
    const userIds = users.map(user => user._id);

    if (userIds.length === 0) {
      console.log('No active users to send promotional notification to');
      return { sentCount: 0 };
    }

    // Send push notifications to all users
    try {
      await sendPushNotificationToMultiple(
        userIds,
        title,
        message,
        { ...data, type: 'promotion' }
      );
    } catch (pushError) {
      console.error('Push notification failed for promotional notification:', pushError);
    }

    // Create in-app notifications for all users
    const notifications = [];
    for (const user of users) {
      const notification = await createNotification(
        user._id,
        'promotion',
        title,
        message,
        { ...data, type: 'promotion' },
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
      );
      notifications.push(notification);
    }

    console.log(`Sent promotional notification to ${notifications.length} users`);
    return { sentCount: notifications.length, notifications };
  } catch (error) {
    console.error('Error sending promotional notification:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  cleanupExpiredNotifications,
  sendEventReminder,
  sendNewEventNotification,
  sendPostLikeNotification,
  sendPostCommentNotification,
  sendSubscriptionEndingNotifications,
  sendSubscriptionExpiredNotification,
  sendSubscriptionUpgradeReminder,
  sendAdminCustomNotification,
  sendOfflineMessageNotification,
  sendWelcomeNotification,
  sendLoginWelcomeBackNotification,
  sendPromotionalNotification,
};
