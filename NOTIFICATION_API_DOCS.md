# Notification API Documentation

## Overview

The Collegium Notification API provides comprehensive notification management with Firebase Cloud Messaging (FCM) integration. It supports both manual and automated notifications for events, posts, subscriptions, and administrative messages.

## Base URL
```
/api/notifications
```

## Authentication
All notification endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Get User Notifications

**GET** `/api/notifications`

Retrieves paginated list of notifications for the authenticated user.

**Query Parameters:**
- `limit` (optional): Number of notifications to return (default: 50, max: 100)
- `offset` (optional): Number of notifications to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "notification_id",
      "userId": "user_id",
      "type": "event_reminder|new_event|post_like|post_comment|subscription_ending|subscription_expired|subscription_upgrade|admin_custom|message_offline|welcome",
      "title": "Notification Title",
      "message": "Notification message content",
      "data": {
        "eventId": "event_id",
        "postId": "post_id",
        // Additional data based on notification type
      },
      "isRead": false,
      "readAt": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": "2024-01-08T00:00:00.000Z"
    }
  ],
  "total": 25,
  "unreadCount": 5
}
```

---

### 2. Mark Notification as Read

**PUT** `/api/notifications/:notificationId/read`

Marks a specific notification as read.

**Parameters:**
- `notificationId`: ID of the notification to mark as read

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "notification": {
    "_id": "notification_id",
    "isRead": true,
    "readAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 3. Mark All Notifications as Read

**PUT** `/api/notifications/read-all`

Marks all notifications for the authenticated user as read.

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "markedCount": 5
}
```

---

### 4. Delete Notification

**DELETE** `/api/notifications/:notificationId`

Deletes a specific notification.

**Parameters:**
- `notificationId`: ID of the notification to delete

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

### 5. Send Custom Notification (Super Admin Only)

**POST** `/api/notifications/custom`

Allows super admins to send custom notifications to users.

**Request Body:**
```json
{
  "userIds": ["user_id_1", "user_id_2"],
  "title": "Custom Notification Title",
  "message": "Custom notification message",
  "data": {
    "customField": "custom_value"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Custom notifications sent successfully",
  "sentCount": 2
}
```

---

### 6. Update FCM Token

**POST** `/api/notifications/fcm-token`

Updates the Firebase Cloud Messaging token for push notifications.

**Request Body:**
```json
{
  "fcmToken": "firebase_messaging_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "FCM token updated successfully"
}
```

---

## Notification Types

### 1. Welcome (`welcome`)
- **Trigger**: Automatically sent when user creates account
- **Content**: Welcome message for new users
- **Expiry**: 30 days

### 2. Event Reminder (`event_reminder`)
- **Trigger**: Automatically sent 1 day before registered events
- **Content**: Reminder about upcoming events
- **Expiry**: 1 day after event date

### 3. New Event (`new_event`)
- **Trigger**: Automatically sent when admin creates new event
- **Recipients**: All users in the same college
- **Content**: Notification about new event posting
- **Expiry**: 7 days

### 4. Post Like (`post_like`)
- **Trigger**: When someone likes user's post
- **Content**: Notification about post like
- **Expiry**: 30 days

### 5. Post Comment (`post_comment`)
- **Trigger**: When someone comments on user's post
- **Content**: Notification about new comment
- **Expiry**: 30 days

### 6. Subscription Ending (`subscription_ending`)
- **Trigger**: Automatically sent 1, 3, 7, 14, or 30 days before subscription expires
- **Content**: Warning about upcoming subscription expiration
- **Expiry**: 14 days

### 7. Subscription Expired (`subscription_expired`)
- **Trigger**: Automatically sent when subscription expires
- **Content**: Notification about expired subscription
- **Expiry**: 30 days

### 8. Subscription Upgrade (`subscription_upgrade`)
- **Trigger**: Sent after subscription upgrades (not more than once per 7 days)
- **Content**: Encouragement to upgrade plan
- **Expiry**: 7 days

### 9. Admin Custom (`admin_custom`)
- **Trigger**: Manually sent by super admins
- **Content**: Custom administrative messages
- **Expiry**: 30 days

### 10. Offline Message (`message_offline`)
- **Trigger**: When user receives message while offline
- **Content**: Offline message notification
- **Expiry**: 7 days

---

## Automated Features

### Daily Scheduler
Runs every day at 9:00 AM to perform automated tasks:

1. **Event Reminders**: Checks for events happening tomorrow and sends reminders to registered users
2. **Subscription Ending Notifications**: Checks for subscriptions expiring in 1, 3, 7, 14, or 30 days
3. **Expired Subscription Notifications**: Sends notifications for subscriptions that have expired

### Real-time Notifications
- **Event Creation**: Automatically notifies all college users when new events are posted
- **Post Interactions**: Sends notifications for likes and comments on posts
- **Subscription Changes**: Sends upgrade reminders after subscription purchases

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (notification/user not found)
- `500`: Internal Server Error

---

## Firebase Integration

### Push Notifications
- All notifications are sent via Firebase Cloud Messaging (FCM)
- Users must provide FCM tokens via the `/fcm-token` endpoint
- Push notifications include both title and message
- Additional data is passed for deep linking

### Token Management
- FCM tokens are stored in the User model
- Tokens are updated via the dedicated endpoint
- Invalid tokens are automatically cleaned up

---

## Rate Limiting & Performance

### Notification Limits
- Maximum 50 notifications per page (configurable)
- Automatic cleanup of expired notifications
- Idempotent operations prevent duplicate notifications

### Scheduler Performance
- Daily cron job runs efficiently with database indexing
- Background processing using `setImmediate()` for non-blocking operations
- Error handling prevents scheduler failures from affecting main application

---

## Testing

### Manual Testing Checklist
1. **Signup Flow**: Verify welcome notification is sent
2. **Event Creation**: Check notifications are sent to all college users
3. **Post Interactions**: Test like/comment notifications
4. **Subscription Management**: Verify subscription notifications
5. **Admin Features**: Test custom notification sending
6. **Scheduler**: Confirm daily automated notifications work

### API Testing Examples

```bash
# Get notifications
curl -X GET "http://localhost:5000/api/notifications" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Mark as read
curl -X PUT "http://localhost:5000/api/notifications/NOTIFICATION_ID/read" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update FCM token
curl -X POST "http://localhost:5000/api/notifications/fcm-token" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fcmToken": "your_fcm_token"}'
```

---

## Security Considerations

- All endpoints require authentication
- Super admin permissions required for custom notifications
- Input validation on all parameters
- Rate limiting on notification creation
- Secure FCM token handling

---

## Maintenance

### Monitoring
- Check server logs for notification failures
- Monitor FCM token validity
- Track notification delivery rates
- Review expired notification cleanup

### Troubleshooting
- Verify FCM configuration in environment variables
- Check database connectivity for notification storage
- Ensure cron jobs are running (check server logs)
- Validate user permissions for admin operations
