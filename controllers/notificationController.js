const { Expo } = require('expo-server-sdk');
const expo = new Expo();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendAdminCustomNotification,
} = require('../utils/notificationService');
const { updateUserFCMToken } = require('../utils/firebaseService');
const { convertToFirebaseUids } = require('../utils/userUtils');

// Send push notification
exports.sendPushNotification = async (req, res) => {
  try {
    const { tokens, title, body, data, channelId, sound, badge } = req.body;

    // Validate required fields
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'tokens array is required and must not be empty'
      });
    }

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        error: 'title and body are required'
      });
    }

    // Validate tokens
    const validTokens = tokens.filter(token => Expo.isExpoPushToken(token));

    if (validTokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid Expo push tokens'
      });
    }
    console.log(`📤 Sending push notifications to ${validTokens.length} devices`);

    // Create notification messages
    const messages = validTokens.map(token => ({
      to: token,
      sound: sound || 'default',
      title,
      body: body.length > 200 ? body.substring(0, 200) + '...' : body,
      data: data || {},
      priority: 'high',
      channelId: channelId || 'default',
      badge: badge !== undefined ? badge : 1,    }));

    // Send in chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    const errors = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);

        // Log errors
        ticketChunk.forEach((ticket, index) => {
          if (ticket.status === 'error') {
            console.error(`❌ Error sending to ${chunk[index].to}:`, ticket.message);
            errors.push({
              token: chunk[index].to,
              error: ticket.message,
            });
          }
        });
      } catch (error) {
        console.error('❌ Error sending chunk:', error);
        errors.push({ error: error.message });
      }
    }

    console.log(`✅ Sent ${tickets.length} notifications`);

    res.json({
      success: true,
      tickets,
      sentCount: tickets.filter(t => t.status === 'ok').length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('❌ Error in sendPushNotification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update FCM token
exports.updateFCMToken = async (req, res) => {
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

// Get notifications (existing endpoint - keep as is)
exports.getNotifications = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const notifications = await getUserNotifications(req.user.userId, parseInt(limit), parseInt(offset));
    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark as read (existing endpoint - keep as is)
exports.markNotificationAsRead = async (req, res) => {
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

// Mark all as read (existing endpoint - keep as is)
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    await markAllAsRead(req.user.userId);
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete notification (existing endpoint - keep as is)
exports.deleteNotificationById = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await deleteNotification(notificationId, req.user.userId);
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send custom notification (existing endpoint - keep as is)
exports.sendCustomNotification = async (req, res) => {
  try {
    const { userIds, title, message, data } = req.body;

    if (!userIds || !Array.isArray(userIds) || !title || !message) {
      return res.status(400).json({ error: 'userIds (array), title, and message are required' });
    }

    // Convert userIds to Firebase UIDs for push notifications
    const firebaseUids = await convertToFirebaseUids(userIds);

    const notifications = await sendAdminCustomNotification(userIds, title, message, {
      ...data,
      firebaseUids, // Include Firebase UIDs in notification data
    });
    res.status(201).json({ message: 'Notifications sent successfully', count: notifications.length });
  } catch (error) {
    console.error('Send custom notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
