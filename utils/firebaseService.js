const admin = require('firebase-admin');
const User = require('../models/User');

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  const serviceAccount = require('../collegium-e1d79-firebase-adminsdk-fbsvc-9f55125016.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Send push notification to a single user
const sendPushNotification = async (userId, title, message, data = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmToken) {
      console.log('User not found or no FCM token for user:', userId);
      return null;
    }

    const payload = {
      notification: {
        title: title,
        body: message,
      },
      data: {
        ...data,
        userId: userId.toString(),
      },
      token: user.fcmToken,
    };

    const response = await admin.messaging().send(payload);
    console.log('Successfully sent push notification:', response);
    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

// Send push notification to multiple users
const sendPushNotificationToMultiple = async (userIds, title, message, data = {}) => {
  try {
    const users = await User.find({
      _id: { $in: userIds },
      fcmToken: { $exists: true, $ne: null }
    });

    if (users.length === 0) {
      console.log('No users with valid FCM tokens found');
      return null;
    }

    const tokens = users.map(user => user.fcmToken);

    const payload = {
      notification: {
        title: title,
        body: message,
      },
      data: data,
    };

    const response = await admin.messaging().sendMulticast(payload, tokens);
    console.log('Successfully sent push notifications:', response);
    return response;
  } catch (error) {
    console.error('Error sending push notifications:', error);
    throw error;
  }
};

// Update user's FCM token
const updateUserFCMToken = async (userId, fcmToken) => {
  try {
    await User.findByIdAndUpdate(userId, { fcmToken });
    console.log('FCM token updated for user:', userId);
    return true;
  } catch (error) {
    console.error('Error updating FCM token:', error);
    throw error;
  }
};

module.exports = {
  sendPushNotification,
  sendPushNotificationToMultiple,
  updateUserFCMToken,
};
