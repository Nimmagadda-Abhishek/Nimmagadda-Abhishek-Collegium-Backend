const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');

const JWT_SECRET = process.env.JWT_SECRET;

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey || privateKey.includes('your-private-key')) {
      throw new Error('Firebase private key not properly configured. Please set FIREBASE_PRIVATE_KEY in your .env file.');
    }

    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase initialization failed:', error.message);
    console.log('Continuing without Firebase. Auth endpoints will not work.');
  }
}

// Signup function
const signup = async (req, res) => {
  console.log('Signup API called with data:', { idToken: req.body.idToken ? '[PRESENT]' : '[MISSING]', fullName: req.body.fullName });

  try {
    const { idToken, fullName } = req.body;

    if (!idToken || !fullName) {
      console.error('Signup validation failed: Missing required fields');
      return res.status(400).json({ error: 'ID token and full name are required' });
    }

    console.log('Verifying Firebase ID token...');
    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    console.log('Firebase token verified for user:', email);

    // Extract domain from email
    const domain = email.split('@')[1];
    if (!domain) {
      console.error('Signup failed: Invalid email format');
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Find college by domain
    const College = require('../models/College');
    const college = await College.findOne({ domain });
    if (!college) {
      console.error('Signup failed: No college found for domain:', domain);
      return res.status(400).json({ error: 'Your email domain is not registered with any college' });
    }

    // Check if user already exists
    let user = await User.findOne({ firebaseUid: uid });

    if (user) {
      console.error('Signup failed: User already exists with Firebase UID:', uid);
      return res.status(400).json({ error: 'User already exists' });
    }

    console.log('Creating new user in database...');
    // Create new user
    user = new User({
      firebaseUid: uid,
      email,
      displayName: name || email.split('@')[0],
      fullName,
      collegeId: college._id,
      collegeName: college.collegeName,
      photoURL: picture,
    });

    await user.save();
    console.log('User created successfully with ID:', user._id);

    // Send welcome notification
    setImmediate(() => sendWelcomeNotification(user._id));

    // Set Firebase custom claims
    await admin.auth().setCustomUserClaims(uid, {
      collegeId: college._id.toString(),
    });
    console.log('Firebase custom claims set for user:', uid);

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, firebaseUid: uid, collegeId: college._id }, JWT_SECRET, { expiresIn: '7d' });
    console.log('JWT token generated for user:', user._id);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        fullName: user.fullName,
        collegeName: user.collegeName,
        photoURL: user.photoURL,
      },
      token,
    });
  } catch (error) {
    console.error('Signup error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login function
const login = async (req, res) => {
  console.log('Login API called with data:', { idToken: req.body.idToken ? '[PRESENT]' : '[MISSING]' });

  try {
    const { idToken } = req.body;

    if (!idToken) {
      console.error('Login validation failed: ID token is required');
      return res.status(400).json({ error: 'ID token is required' });
    }

    console.log('Verifying Firebase ID token...');
    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    console.log('Firebase token verified for user:', email);

    // Find user
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      console.log('User not found during login. User must signup first.');
      return res.status(404).json({ error: 'User not found. Please signup first.' });
    } else {
      console.log('Existing user found, updating last login and photo...');
      // Update last login and photoURL if available
      user.lastLogin = new Date();
      if (picture) {
        user.photoURL = picture;
      }
      await user.save();
      console.log('User last login and photo updated for ID:', user._id);
    }

    // Set Firebase custom claims if not set
    const customClaims = await admin.auth().getUser(uid).then(userRecord => userRecord.customClaims);
    if (!customClaims || !customClaims.collegeId) {
      await admin.auth().setCustomUserClaims(uid, {
        collegeId: user.collegeId.toString(),
      });
      console.log('Firebase custom claims set for user:', uid);
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, firebaseUid: uid, collegeId: user.collegeId }, JWT_SECRET, { expiresIn: '7d' });
    console.log('JWT token generated for user:', user._id);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
      token,
    });
  } catch (error) {
    console.error('Login error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  console.log('verifyToken middleware called for path:', req.path);

  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.error('verifyToken failed: No token provided in Authorization header');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log('verifyToken successful for user:', decoded.userId);
    next();
  } catch (error) {
    console.error('verifyToken failed: Invalid token', {
      message: error.message,
      name: error.name
    });
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  console.log('Get profile API called for user:', req.user.userId);

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.error('Get profile failed: User not found with ID:', req.user.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Get profile successful for user:', user._id);
    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        fullName: user.fullName,
        collegeName: user.collegeName,
        photoURL: user.photoURL,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('Get profile error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Search users by display name, email, or college name
const searchUsers = async (req, res) => {
  console.log('Search users API called with query:', req.query.q);

  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      console.error('Search users validation failed: Query must be at least 2 characters');
      return res.status(400).json({ error: 'Search query must be at least 2 characters long' });
    }

    const searchRegex = new RegExp(q.trim(), 'i'); // Case-insensitive regex

    console.log('Searching users with regex:', searchRegex);
    const users = await User.find({
      collegeId: req.user.collegeId,
      $or: [
        { displayName: searchRegex },
        { email: searchRegex },
        { collegeName: searchRegex },
      ],
    })
      .select('_id displayName email collegeName photoURL') // Include _id for profile lookup
      .limit(20) // Limit results to prevent overload
      .sort({ displayName: 1 }); // Sort alphabetically

    // Fetch associated profiles
    const userIds = users.map(user => user._id);
    const profiles = await Profile.find({ user: { $in: userIds } }).select('user profileImage bio branch year');

    // Create a map of userId to profile for easy lookup
    const profileMap = {};
    profiles.forEach(profile => {
      profileMap[profile.user.toString()] = profile;
    });

    // Merge profile data into users
    const usersWithProfiles = users.map(user => {
      const userObj = user.toObject();
      const profile = profileMap[user._id.toString()];
      if (profile) {
        userObj.profile = {
          profileImage: profile.profileImage,
          bio: profile.bio,
          branch: profile.branch,
          year: profile.year,
        };
      } else {
        userObj.profile = null; // No profile exists
      }
      return userObj;
    });

    console.log('Search users successful, returned', usersWithProfiles.length, 'results');
    res.status(200).json({ users: usersWithProfiles });
  } catch (error) {
    console.error('Search users error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      query: req.query?.q
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user account (soft delete)
const deleteAccount = async (req, res) => {
  console.log('Delete account API called for user:', req.user.userId);

  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      console.error('Delete account failed: User not found with ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isDeleted) {
      console.error('Delete account failed: User already deleted with ID:', userId);
      return res.status(400).json({ error: 'Account already deleted' });
    }

    // Soft delete the user
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    console.log('User account soft deleted successfully:', userId);

    // Note: In a real application, you might want to anonymize or remove associated data
    // For now, we'll keep the data but mark the user as deleted

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      userId: req.user?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Block a user
const blockUser = async (req, res) => {
  console.log('Block user API called by user:', req.user.userId, 'to block user:', req.params.userId);

  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    if (userId === currentUserId) {
      console.error('Block user failed: User cannot block themselves');
      return res.status(400).json({ error: 'You cannot block yourself' });
    }

    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      console.error('Block user failed: User to block not found with ID:', userId);
      return res.status(404).json({ error: 'User to block not found' });
    }

    const currentUser = await User.findById(currentUserId);
    if (currentUser.blockedUsers.includes(userId)) {
      console.error('Block user failed: User already blocked with ID:', userId);
      return res.status(400).json({ error: 'User already blocked' });
    }

    currentUser.blockedUsers.push(userId);
    await currentUser.save();

    console.log('User blocked successfully:', userId, 'by user:', currentUserId);

    res.status(200).json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Block user error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      userId: req.user?.userId,
      blockUserId: req.params?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Unblock a user
const unblockUser = async (req, res) => {
  console.log('Unblock user API called by user:', req.user.userId, 'to unblock user:', req.params.userId);

  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser.blockedUsers.includes(userId)) {
      console.error('Unblock user failed: User not blocked with ID:', userId);
      return res.status(400).json({ error: 'User not blocked' });
    }

    currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id.toString() !== userId);
    await currentUser.save();

    console.log('User unblocked successfully:', userId, 'by user:', currentUserId);

    res.status(200).json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Unblock user error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      userId: req.user?.userId,
      unblockUserId: req.params?.userId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  signup,
  login,
  verifyToken,
  getProfile,
  searchUsers,
  deleteAccount,
  blockUser,
  unblockUser,
};
