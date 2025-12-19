const admin = require('firebase-admin');
const path = require('path');
const User = require('../models/User');
const { convertToFirebaseUid, convertToFirebaseUids, getUserByIdentifier } = require('./userUtils');

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
  const fullPath = path.resolve(__dirname, '..', serviceAccountPath);
  const serviceAccount = require(fullPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Send push notification to a single user
const sendPushNotification = async (userId, title, message, data = {}) => {
  try {
    // Convert userId to Firebase UID if it's a MongoDB ObjectId
    const firebaseUid = await convertToFirebaseUid(userId);
    if (!firebaseUid) {
      console.log('Could not convert userId to Firebase UID:', userId);
      return null;
    }

    // Find user by Firebase UID
    const user = await User.findOne({ firebaseUid });
    if (!user || !user.fcmToken) {
      console.log('User not found or no FCM token for Firebase UID:', firebaseUid);
      return null;
    }

    const payload = {
      notification: {
        title: title,
        body: message,
      },
      data: {
        ...data,
        userId: firebaseUid, // Use Firebase UID in push data
      },
      android: {
        priority: 'HIGH',
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
    // Convert all userIds to Firebase UIDs
    const firebaseUids = await convertToFirebaseUids(userIds);
    if (firebaseUids.length === 0) {
      console.log('No valid Firebase UIDs found for userIds:', userIds);
      return null;
    }

    const users = await User.find({
      firebaseUid: { $in: firebaseUids },
      fcmToken: { $exists: true, $ne: null }
    });

    if (users.length === 0) {
      console.log('No users with valid FCM tokens found for Firebase UIDs:', firebaseUids);
      return null;
    }

    const tokens = users.map(user => user.fcmToken);

    const message = {
      notification: {
        title: title,
        body: message,
      },
      data: {
        ...data,
        userIds: firebaseUids.join(','), // Include Firebase UIDs in push data
      },
      android: {
        priority: 'HIGH',
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
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
