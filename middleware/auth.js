const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  console.log('authenticateToken middleware called for path:', req.path);

  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.error('authenticateToken failed: No token provided in Authorization header');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log('authenticateToken successful for user:', decoded.userId);
    next();
  } catch (error) {
    console.error('authenticateToken failed: Invalid token', {
      message: error.message,
      name: error.name
    });
    res.status(400).json({ error: 'Invalid token.' });
  }
};

module.exports = {
  authenticateToken,
};
