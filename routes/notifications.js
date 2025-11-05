const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/superAdmin');

// All notification routes require authentication
router.use(authenticateToken);

// Get user notifications
router.get('/', notificationController.getNotifications);

// Mark notification as read
router.put('/:notificationId/read', notificationController.markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', notificationController.markAllNotificationsAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotificationById);

// Send custom notification (super admin only)
router.post('/custom', requireSuperAdmin, notificationController.sendCustomNotification);

// Update FCM token
router.post('/fcm-token', notificationController.updateFCMToken);

module.exports = router;
