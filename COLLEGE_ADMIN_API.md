# College Admin API Documentation

## Overview
This API provides endpoints for college administrators to manage their college, students, events, and access dashboard statistics. All endpoints require proper authentication and authorization.

## Base URL
```
/api/college-admin
```

## Authentication
College admins use JWT tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Token Requirements
- Tokens are obtained through the login process
- Tokens expire after 7 days
- Admins must be approved by super admin before accessing protected endpoints

---

## 1. Registration and Authentication

### 1.1 Register College Admin
**Endpoint:** `POST /api/college-admin/register`

**Description:** Register a new college admin account. Requires super admin approval before login.

**Request Body:**
```json
{
  "collegeName": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "confirmPassword": "string (required)"
}
```

**Response (Success - 201):**
```json
{
  "message": "College admin registered successfully. Please verify your email and wait for super admin approval.",
  "firebaseUid": "string"
}
```

**Error Responses:**
- `400`: Missing required fields or passwords don't match
- `400`: Admin with this email already exists
- `500`: Internal server error

### 1.2 Send OTP
**Endpoint:** `POST /api/college-admin/send-otp`

**Description:** Send OTP to college admin's email for login verification.

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Response (Success - 200):**
```json
{
  "message": "OTP sent to your email successfully"
}
```

**Error Responses:**
- `400`: Email is required
- `403`: Admin not approved or email not verified
- `404`: College admin not found
- `500`: Internal server error

### 1.3 Login with OTP
**Endpoint:** `POST /api/college-admin/login`

**Description:** Login using email and OTP. Returns JWT token upon successful authentication.

**Request Body:**
```json
{
  "email": "string (required)",
  "otp": "string (required)"
}
```

**Response (Success - 200):**
```json
{
  "message": "Login successful",
  "admin": {
    "id": "string",
    "collegeId": "string",
    "email": "string"
  },
  "token": "string"
}
```

**Error Responses:**
- `400`: Missing email/OTP, invalid credentials, invalid/expired OTP
- `403`: Admin not approved or email not verified
- `500`: Internal server error

---

## 2. Profile Management

### 2.1 Get Admin Profile
**Endpoint:** `GET /api/college-admin/profile`

**Authentication:** Required (JWT token)

**Description:** Retrieve the authenticated college admin's profile information.

**Response (Success - 200):**
```json
{
  "profile": {
    "id": "string",
    "email": "string",
    "collegeName": "string",
    "collegeDomain": "string",
    "isApproved": "boolean",
    "createdAt": "date"
  }
}
```

**Error Responses:**
- `401`: Invalid or missing token
- `403`: Admin not approved
- `404`: College admin not found
- `500`: Internal server error


### 2.2 Update Admin Profile
**Endpoint:** `PUT /api/college-admin/profile`

**Authentication:** Required (JWT token)

**Description:** Update the authenticated college admin's profile information (College Name and/or Password).

**Request Body:**
```json
{
  "collegeName": "string (optional)",
  "password": "string (optional)",
  "confirmPassword": "string (required only if password is provided)"
}
```

**Response (Success - 200):**
```json
{
  "message": "Profile updated successfully (College Name, Password)",
  "profile": {
    "id": "string",
    "email": "string",
    "collegeName": "string"
  }
}
```

**Error Responses:**
- `400`: Passwords do not match or College Name already taken
- `401`: Invalid or missing token
- `403`: Admin not approved
- `404`: College admin not found
- `500`: Internal server error

---

## 3. Dashboard Statistics

### 3.1 Get Dashboard Stats
**Endpoint:** `GET /api/college-admin/dashboard/stats`

**Authentication:** Required (JWT token)

**Description:** Retrieve dashboard statistics for the college admin including student count, events, and registrations.

**Response (Success - 200):**
```json
{
  "stats": {
    "totalStudents": "number",
    "totalEvents": "number",
    "activeEvents": "number",
    "totalRegistrations": "number"
  }
}
```

**Error Responses:**
- `401`: Invalid or missing token
- `403`: Admin not approved
- `404`: College admin not found
- `500`: Internal server error

---

## 4. User/Student Management

### 4.1 Get Users
**Endpoint:** `GET /api/college-admin/users`

**Authentication:** Required (JWT token)

**Description:** Retrieve all users/students in the college. Can only view users from the admin's own college.

**Query Parameters:**
- `collegeId` (optional): College ID to filter users (defaults to admin's college)

**Response (Success - 200):**
```json
{
  "users": [
    {
      "name": "string",
      "email": "string",
      "department": "string",
      "year": "string",
      "status": "active",
      "profileImage": "string"
    }
  ]
}
```

**Error Responses:**
- `401`: Invalid or missing token
- `403`: Access denied (trying to view other college's users)
- `500`: Internal server error

### 4.2 Get Students
**Endpoint:** `GET /api/college-admin/students`

**Authentication:** Required (JWT token)

**Description:** Alias for getting users/students in the college. Returns student information.

**Response (Success - 200):**
```json
{
  "students": [
    {
      "name": "string",
      "email": "string",
      "department": "string",
      "year": "string",
      "status": "active",
      "profileImage": "string"
    }
  ]
}
```

**Error Responses:**
- `401`: Invalid or missing token
- `403`: Admin not approved
- `404`: College admin not found
- `500`: Internal server error

---

## 5. Event Management

### 5.1 Create Event
**Endpoint:** `POST /api/college-admin/events/create`

**Authentication:** Required (JWT token)

**Description:** Create a new event for the college. Requires banner image upload.

**Content-Type:** `multipart/form-data`

**Request Body:**
- `title`: string (required)
- `date`: string (required, ISO date format)
- `category`: string (required)
- `location`: string (required)
- `maxParticipants`: number (required)
- `description`: string (required)
- `banner`: file (required, image file)

**Response (Success - 201):**
```json
{
  "message": "Event created successfully",
  "event": {
    "_id": "string",
    "title": "string",
    "date": "date",
    "category": "string",
    "location": "string",
    "maxParticipants": "number",
    "description": "string",
    "banner": "string (Cloudinary URL)",
    "createdBy": "string",
    "collegeId": "string",
    "status": "active",
    "registrations": [],
    "likes": [],
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

**Error Responses:**
- `400`: Missing required fields or invalid data
- `401`: Invalid or missing token
- `403`: Admin not approved
- `404`: College admin not found
- `500`: Internal server error

### 5.2 Get Admin Events
**Endpoint:** `GET /api/college-admin/events`

**Authentication:** Required (JWT token)

**Description:** Retrieve all events created by the authenticated college admin.

**Response (Success - 200):**
```json
{
  "events": [
    {
      "_id": "string",
      "title": "string",
      "date": "date",
      "category": "string",
      "location": "string",
      "maxParticipants": "number",
      "description": "string",
      "banner": "string",
      "status": "active",
      "registrations": [
        {
          "userId": "string",
          "registeredAt": "date"
        }
      ],
      "likes": ["string"],
      "createdBy": {
        "email": "string"
      },
      "collegeId": "string",
      "createdAt": "date",
      "updatedAt": "date"
    }
  ]
}
```

**Error Responses:**
- `401`: Invalid or missing token
- `403`: Admin not approved
- `500`: Internal server error

### 5.3 View Event Registrations
**Endpoint:** `GET /api/college-admin/events/admin/registrations/:eventId`

**Authentication:** Required (JWT token)

**Description:** View all registrations for a specific event created by the admin.

**Path Parameters:**
- `eventId`: string (required) - ID of the event

**Response (Success - 200):**
```json
{
  "event": {
    "title": "string",
    "registrations": [
      {
        "displayName": "string",
        "email": "string",
        "fullName": "string",
        "collegeName": "string"
      }
    ]
  }
}
```

**Error Responses:**
- `401`: Invalid or missing token
- `403`: Admin not approved
- `404`: Event not found
- `500`: Internal server error

### 5.4 Update Event Status
**Endpoint:** `PUT /api/college-admin/events/admin/status/:eventId`

**Authentication:** Required (JWT token)

**Description:** Update the status of an event created by the admin.

**Path Parameters:**
- `eventId`: string (required) - ID of the event

**Request Body:**
```json
{
  "status": "active | closed | postponed"
}
```

**Response (Success - 200):**
```json
{
  "message": "Event status updated successfully",
  "event": {
    "_id": "string",
    "title": "string",
    "status": "string",
    "updatedAt": "date"
  }
}
```

**Error Responses:**
- `400`: Invalid status value
- `401`: Invalid or missing token
- `403`: Admin not approved
- `404`: Event not found or not authorized
- `500`: Internal server error

---

## Error Response Format
All error responses follow this format:
```json
{
  "error": "string"
}
```

## Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting
- OTP requests are rate-limited to prevent abuse
- Consider implementing rate limiting for other endpoints as needed

## File Upload Limits
- Event banner images: Maximum file size depends on Cloudinary configuration
- Supported formats: JPG, PNG, JPEG, GIF

## Notes
- All dates are in ISO 8601 format
- Image URLs are hosted on Cloudinary
- College admins can only manage resources within their own college
- Super admin approval is required before admin accounts become active
- Email verification is required before OTP login
