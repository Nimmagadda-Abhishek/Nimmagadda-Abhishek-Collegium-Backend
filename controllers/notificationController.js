const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendAdminCustomNotification,
} = require('../utils/notificationService');
const { updateUserFCMToken } = require('../utils/firebaseService');

// Get notifications for the authenticated user
const getNotifications = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const notifications = await getUserNotifications(req.user.userId, parseInt(limit), parseInt(offset));
    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark a notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await markAsRead(notificationId, req.user.userId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    await markAllAsRead(req.user.userId);
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a notification
const deleteNotificationById = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await deleteNotification(notificationId, req.user.userId);
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send custom notification (admin only)
const sendCustomNotification = async (req, res) => {
  try {
    const { userIds, title, message, data } = req.body;

    if (!userIds || !Array.isArray(userIds) || !title || !message) {
      return res.status(400).json({ error: 'userIds (array), title, and message are required' });
    }

    const notifications = await sendAdminCustomNotification(userIds, title, message, data || {});
    res.status(201).json({ message: 'Notifications sent successfully', count: notifications.length });
  } catch (error) {
    console.error('Send custom notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update FCM token for user
const updateFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    await updateUserFCMToken(req.user.userId, fcmToken);
    res.status(200).json({ message: 'FCM token updated successfully' });
  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationById,
  sendCustomNotification,
  updateFCMToken,
};
