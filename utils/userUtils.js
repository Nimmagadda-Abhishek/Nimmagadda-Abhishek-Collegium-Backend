const User = require('../models/User');

/**
 * Convert MongoDB ObjectId or Firebase UID to Firebase UID
 * @param {string} userIdentifier - MongoDB ObjectId or Firebase UID
 * @returns {string|null} - Firebase UID or null if not found
 */
const convertToFirebaseUid = async (userIdentifier) => {
  try {
    // If it's already a Firebase UID (longer string), return as is
    if (userIdentifier && userIdentifier.length > 20) {
      return userIdentifier;
    }

    // Try to find user by MongoDB ObjectId
    const user = await User.findById(userIdentifier);
    if (user && user.firebaseUid) {
      return user.firebaseUid;
    }

    // If not found by ObjectId, try to find by Firebase UID directly
    const userByUid = await User.findOne({ firebaseUid: userIdentifier });
    if (userByUid) {
      return userByUid.firebaseUid;
    }

    return null;
  } catch (error) {
    console.error('Error converting to Firebase UID:', error);
    return null;
  }
};

/**
 * Convert multiple user identifiers to Firebase UIDs
 * @param {Array<string>} userIdentifiers - Array of MongoDB ObjectIds or Firebase UIDs
 * @returns {Array<string>} - Array of Firebase UIDs
 */
const convertToFirebaseUids = async (userIdentifiers) => {
  try {
    const firebaseUids = [];
    for (const identifier of userIdentifiers) {
      const firebaseUid = await convertToFirebaseUid(identifier);
      if (firebaseUid) {
        firebaseUids.push(firebaseUid);
      }
    }
    return firebaseUids;
  } catch (error) {
    console.error('Error converting to Firebase UIDs:', error);
    return [];
  }
};

/**
 * Get user by Firebase UID or MongoDB ObjectId
 * @param {string} userIdentifier - Firebase UID or MongoDB ObjectId
 * @returns {Object|null} - User object or null if not found
 */
const getUserByIdentifier = async (userIdentifier) => {
  try {
    // Try to find by Firebase UID first
    let user = await User.findOne({ firebaseUid: userIdentifier });
    if (user) return user;

    // If not found, try by MongoDB ObjectId
    user = await User.findById(userIdentifier);
    return user;
  } catch (error) {
    console.error('Error getting user by identifier:', error);
    return null;
  }
};

module.exports = {
  convertToFirebaseUid,
  convertToFirebaseUids,
  getUserByIdentifier,
};
