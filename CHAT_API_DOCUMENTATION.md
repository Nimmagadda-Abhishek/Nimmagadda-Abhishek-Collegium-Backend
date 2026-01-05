# Chat System API Documentation

## Overview

This document describes the chat system backend implementation for the real-time chat feature in the React Native app. The system uses Firebase Firestore for storing real-time messages and a Node.js/Express backend for handling permissions, validation, notifications, blocking, and reporting.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Real-time Messaging**: Firebase Firestore
- **Notifications**: Firebase Cloud Messaging (FCM)
- **Authentication**: JWT

## Architecture

### Models

#### ChatRequest Model
```javascript
{
  senderId: ObjectId (ref: 'User'),
  receiverId: ObjectId (ref: 'User'),
  status: String (enum: ['pending', 'accepted', 'rejected']),
  createdAt: Date,
  updatedAt: Date
}
```
- Unique index on `{ senderId, receiverId }` to prevent duplicate requests

#### Report Model
```javascript
{
  reporterId: ObjectId (ref: 'User'),
  reportedUserId: ObjectId (ref: 'User'),
  reason: String (enum: ['harassment', 'spam', 'inappropriate_content', 'other']),
  description: String (max: 500 chars),
  createdAt: Date
}
```

#### User Model Updates
The existing User model already includes:
- `firebaseUid`: String (required, unique) - Firebase UID
- `blockedUsers`: Array of ObjectIds - List of blocked users
- `fcmToken`: String - FCM registration token for push notifications

## API Endpoints

All endpoints require JWT authentication via `Authorization: Bearer <jwt_token>` header.

### 1. Chat Request Validation

**Endpoint**: `POST /api/chat/validate`

**Description**: Validates if chat is allowed between two users and generates room ID.

**Request Body**:
```json
{
  "senderMongoId": "string",
  "receiverMongoId": "string"
}
```

**Response**:
```json
{
  "allowed": true,
  "roomId": "firebaseUid1_firebaseUid2"
}
```

**Error Responses**:
- `404`: One or both users not found
- `403`: Users are blocked from chatting

### 2. Send Chat Request

**Endpoint**: `POST /api/chat/send-request`

**Description**: Sends a chat request to another user.

**Request Body**:
```json
{
  "receiverMongoId": "string"
}
```

**Response**:
```json
{
  "message": "Chat request sent successfully",
  "requestId": "chatRequestObjectId"
}
```

**Error Responses**:
- `404`: User not found
- `403`: Cannot send request to blocked user
- `400`: Chat request already exists

### 3. Accept Chat Request

**Endpoint**: `POST /api/chat/accept-request`

**Description**: Accepts a pending chat request.

**Request Body**:
```json
{
  "requestId": "string"
}
```

**Response**:
```json
{
  "message": "Chat request accepted"
}
```

**Error Responses**:
- `404`: Chat request not found
- `403`: Not authorized to accept this request
- `400`: Request already processed

### 4. Reject Chat Request

**Endpoint**: `POST /api/chat/reject-request`

**Description**: Rejects a pending chat request.

**Request Body**:
```json
{
  "requestId": "string"
}
```

**Response**:
```json
{
  "message": "Chat request rejected"
}
```

**Error Responses**:
- `404`: Chat request not found
- `403`: Not authorized to reject this request
- `400`: Request already processed

### 5. Block User

**Endpoint**: `POST /api/chat/block`

**Description**: Blocks a user from chatting.

**Request Body**:
```json
{
  "userToBlockId": "string"
}
```

**Response**:
```json
{
  "message": "User blocked successfully"
}
```

**Error Responses**:
- `404`: User not found
- `400`: User already blocked

**Note**: Blocking automatically removes any existing chat requests between the users.

### 6. Unblock User

**Endpoint**: `POST /api/chat/unblock`

**Description**: Unblocks a previously blocked user.

**Request Body**:
```json
{
  "userToUnblockId": "string"
}
```

**Response**:
```json
{
  "message": "User unblocked successfully"
}
```

**Error Responses**:
- `404`: User not found
- `400`: User not blocked

### 7. Report User

**Endpoint**: `POST /api/chat/report`

**Description**: Reports a user for inappropriate behavior.

**Request Body**:
```json
{
  "reportedUserId": "string",
  "reason": "harassment|spam|inappropriate_content|other",
  "description": "string (optional, max 500 chars)"
}
```

**Response**:
```json
{
  "message": "User reported successfully"
}
```

**Error Responses**:
- `404`: User not found

### 8. Send Notification

**Endpoint**: `POST /api/chat/notify`

**Description**: Triggers FCM push notification for new messages.

**Request Body**:
```json
{
  "receiverId": "string (MongoDB ObjectId or Firebase UID)",
  "message": "string",
  "roomId": "string"
}
```

**Response**:
```json
{
  "message": "Notification sent",
  "success": true
}
```

**Error Responses**:
- `400`: Receiver not found or no FCM token

## Room ID Generation

Room IDs are generated deterministically using Firebase UIDs:
1. Get Firebase UIDs for both users
2. Sort them alphabetically
3. Join with underscore: `uid1_uid2`

This ensures consistent room IDs regardless of who initiates the chat.

## Security Features

- **JWT Authentication**: All endpoints require valid JWT tokens
- **User Validation**: All operations verify user existence
- **Blocking Logic**: Blocked users cannot send/receive chat requests or messages
- **Request Validation**: Prevents duplicate chat requests
- **Authorization Checks**: Users can only accept/reject requests sent to them

## Firebase Integration

### Firestore Structure (Conceptual)
```
chats/{roomId}/messages/{messageId}
{
  senderId: "firebaseUid",
  message: "text",
  timestamp: Timestamp,
  type: "text|image|file"
}
```

### FCM Notifications
- Triggered when receiver is offline
- Includes roomId in notification data for deep linking
- Uses stored FCM tokens from User model

## Error Handling

All endpoints include comprehensive error handling:
- User not found (404)
- Unauthorized actions (403)
- Invalid requests (400)
- Server errors (500)

## Implementation Notes

### Files Created/Modified

1. **models/ChatRequest.js** - Chat request schema
2. **models/Report.js** - User report schema
3. **controllers/chatController.js** - All chat logic
4. **routes/chat.js** - API route definitions
5. **index.js** - Added chat routes registration

### Dependencies

- Existing: mongoose, express, firebase-admin
- No new npm packages required

### Database Indexes

- ChatRequest: Unique compound index on `{ senderId, receiverId }`
- User: firebaseUid (unique), existing indexes

## Testing Examples

### Validate Chat
```bash
curl -X POST http://localhost:4000/api/chat/validate \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "senderMongoId": "507f1f77bcf86cd799439011",
    "receiverMongoId": "507f1f77bcf86cd799439012"
  }'
```

### Send Chat Request
```bash
curl -X POST http://localhost:4000/api/chat/send-request \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverMongoId": "507f1f77bcf86cd799439012"
  }'
```

## Production Considerations

- **Rate Limiting**: Implement rate limiting for chat requests
- **Monitoring**: Add logging and monitoring for chat activities
- **Backup**: Regular backups of chat-related data
- **Scaling**: Consider database sharding for high-volume chat systems
- **Security**: Regular security audits and updates

## Future Enhancements

- Group chats
- Message reactions
- Typing indicators
- Message search
- Chat history pagination
- File/image sharing
- Voice/video call integration
