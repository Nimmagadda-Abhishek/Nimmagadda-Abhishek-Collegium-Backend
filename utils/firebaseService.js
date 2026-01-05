const admin = require('firebase-admin');
const path = require('path');
const User = require('../models/User');
const { convertToFirebaseUid, convertToFirebaseUids, getUserByIdentifier } = require('./userUtils');

// Initialize Firebase Admin (only if not already initialized)
// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  try {
    let credential;
    // Try environment variables first (since the file key seems to be failing)
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      console.log('Initializing Firebase Admin using environment variables...');
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      };
      credential = admin.credential.cert(serviceAccount);
    }
    // Fallback to file if env vars not sufficient
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH) {
      console.log('Initializing Firebase Admin using service account file...');
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
      const fullPath = path.resolve(__dirname, '..', serviceAccountPath);
      credential = admin.credential.cert(require(fullPath));
    }

    if (credential) {
      admin.initializeApp({
        credential: credential,
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } else {
      console.error('Failed to initialize Firebase: No credentials found.');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
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

    // Ensure data values are strings (FCM requirement)
    const stringData = {};
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        stringData[key] = String(value);
      }
    }
    stringData.userId = String(firebaseUid);

    const payload = {
      notification: {
        title: title,
        body: message,
      },
      data: stringData,
      android: {
        priority: 'high',
        notification: {
          channelId: 'default',
          sound: 'default',
          priority: 'high',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          defaultSound: true,
          defaultVibrateTimings: true,
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: title,
              body: message,
            },
            sound: 'default',
            contentAvailable: true,
          },
        },
        headers: {
          'apns-priority': '10',
        },
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

    const messagePayload = {
      notification: {
        title: title,
        body: message,
      },
      data: {
        ...data,
        userIds: firebaseUids.join(','), // Include Firebase UIDs in push data
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'default',
          sound: 'default',
          priority: 'high',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          defaultSound: true,
          defaultVibrateTimings: true,
        },
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendMulticast(messagePayload);
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
