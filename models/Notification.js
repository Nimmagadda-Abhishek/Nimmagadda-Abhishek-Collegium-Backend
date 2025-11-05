const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'event_reminder',
      'new_event',
      'post_like',
      'post_comment',
      'subscription_ending',
      'subscription_expired',
      'subscription_upgrade',
      'admin_custom',
      'message_offline'
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Flexible data for different notification types
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date, // For time-sensitive notifications
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
