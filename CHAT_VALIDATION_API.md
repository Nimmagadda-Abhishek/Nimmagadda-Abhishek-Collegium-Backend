# Chat Validation & Notification API

This documentation details the API endpoints for chat validation and notifications.

## Base URL
`/api/chat`

## 1. Validate Chat
**Endpoint:** `POST /validate`
**Purpose:** Check if users can chat (e.g., block status).
**Headers:** `Authorization: Bearer <token>`
**Payload:**
```json
{
  "senderId": "string", // Mongo ID of user initiating
  "receiverId": "string" // Mongo ID of other user
}
```
**Response:**
*   **Allowed:**
    ```json
    {
      "allowed": true,
      "roomId": "uid1_uid2" // Deterministic Room ID based on Firebase UIDs
    }
    ```
*   **Blocked:**
    ```json
    {
      "allowed": false,
      "reason": "Users are blocked from chatting"
    }
    ```

## 2. Send Chat Request
**Endpoint:** `POST /send-request`
**Purpose:** Notify the receiver that a new chat request is pending.
**Headers:** `Authorization: Bearer <token>`
**Payload:**
```json
{
  "receiverId": "string" // Mongo ID
}
```
**Response:**
```json
{
  "message": "Chat request sent successfully",
  "requestId": "..."
}
```
**Side Effect:** Sends a push notification to the receiver.

## 3. Accept Chat Request
**Endpoint:** `POST /accept-request`
**Purpose:** Notify the original sender that their request was accepted.
**Headers:** `Authorization: Bearer <token>`
**Payload:**
```json
{
  "requestId": "string"
}
```
**Response:**
```json
{
  "message": "Chat request accepted",
  "roomId": "uid1_uid2"
}
```
**Side Effect:** Sends a push notification to the sender.

## 4. Message Push Notification
**Endpoint:** `POST /notify`
**Purpose:** Trigger a push notification (FCM) when a message is sent. This is used by the frontend after writing to Firestore if needed, or by backend triggers.
**Headers:** `Authorization: Bearer <token>`
**Payload:**
```json
{
  "receiverId": "string", // Mongo ID
  "title": "New Message",
  "body": "Hey, are you free?",
  "data": { 
    "roomId": "123", 
    "type": "chat_message" 
  }
}
```
**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully"
}
```
