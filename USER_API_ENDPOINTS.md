# User and College Admin API Endpoints

This document lists all API endpoints except super admin ones, including sample requests and responses. It highlights changes made to differentiate between regular users and college admins.

## Authentication (Users)

### POST /api/auth/signup
**Description:** Register a new user with Firebase ID token.

**Request Body:**
```json
{
  "idToken": "firebase_id_token_here",
  "fullName": "John Doe"
}
```

**Response (Success):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "displayName": "john",
    "fullName": "John Doe",
    "collegeName": "Example College",
    "photoURL": "https://...",
    "createdAt": "2023-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

### POST /api/auth/login
**Description:** Login user with Firebase ID token.

**Request Body:**
```json
{
  "idToken": "firebase_id_token_here"
}
```

**Response (Success):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "displayName": "john",
    "photoURL": "https://..."
  },
  "token": "jwt_token_here"
}
```

### GET /api/auth/profile
**Description:** Get authenticated user's profile.

**Headers:** `Authorization: Bearer jwt_token`

**Response (Success):**
```json
{
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "displayName": "john",
    "fullName": "John Doe",
    "collegeName": "Example College",
    "photoURL": "https://...",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "lastLogin": "2023-01-01T00:00:00.000Z"
  }
}
```

### GET /api/auth/search?q=search_term
**Description:** Search users by name, email, or college name (within same college).

**Headers:** `Authorization: Bearer jwt_token`

**Response (Success):**
```json
{
  "users": [
    {
      "id": "user_id",
      "displayName": "john",
      "email": "john@example.com",
      "collegeName": "Example College",
      "photoURL": "https://...",
      "profile": {
        "profileImage": "https://...",
        "bio": "Student bio",
        "branch": "Computer Science",
        "year": "3rd"
      }
    }
  ]
}
```

### GET /api/auth/colleges
**Description:** Get list of approved colleges for signup.

**Response (Success):**
```json
{
  "colleges": [
    {
      "_id": "college_id",
      "collegeName": "Example College"
    }
  ]
}
```

## College Admin Authentication

### POST /api/college-admin/register
**Description:** Register a new college admin.

**Request Body:**
```json
{
  "collegeName": "Example College",
  "email": "admin@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (Success):**
```json
{
  "message": "College admin registered successfully"
}
```

### POST /api/college-admin/login
**Description:** Login college admin.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "message": "Login successful",
  "admin": {
    "id": "admin_id",
    "collegeName": "Example College",
    "email": "admin@example.com"
  },
  "token": "jwt_token_here"
}
```

### GET /api/college-admin/users
**Description:** Get all users in the college admin's college.

**Headers:** `Authorization: Bearer jwt_token`

**Response (Success):**
```json
{
  "users": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "department": "Computer Science",
      "year": "3rd",
      "status": "active",
      "profileImage": "https://..."
    }
  ]
}
```

## Profile Management

### POST /api/profile
**Description:** Create or update user profile (supports image upload).

**Headers:** `Authorization: Bearer jwt_token`

**Request Body (form-data):**
```
bio: Student bio here
branch: Computer Science
year: 3rd
githubUsername: johndoe
linkedinUrl: https://linkedin.com/in/johndoe
profileImage: [file]
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Profile saved successfully",
  "profile": {
    "user": "user_id",
    "profileImage": "https://cloudinary.com/...",
    "bio": "Student bio here",
    "branch": "Computer Science",
    "year": "3rd",
    "githubProfile": {
      "username": "johndoe",
      "profileData": { /* GitHub API data */ }
    },
    "linkedinProfile": {
      "url": "https://linkedin.com/in/johndoe",
      "profileData": null
    }
  }
}
```

### GET /api/profile
**Description:** Get authenticated user's profile.

**Headers:** `Authorization: Bearer jwt_token`

**Response (Success):**
```json
{
  "success": true,
  "profile": {
    "user": {
      "email": "john@example.com",
      "displayName": "john",
      "fullName": "John Doe",
      "collegeName": "Example College",
      "photoURL": "https://..."
    },
    "profileImage": "https://...",
    "bio": "Student bio",
    "branch": "Computer Science",
    "year": "3rd",
    "githubProfile": { /* ... */ },
    "linkedinProfile": { /* ... */ }
  }
}
```

## Posts

### POST /api/posts
**Description:** Create a new post with image.

**Headers:** `Authorization: Bearer jwt_token`

**Request Body (form-data):**
```
caption: My awesome project!
image: [file]
```

**Response (Success):**
```json
{
  "message": "Post created successfully",
  "post": {
    "user": {
      "displayName": "john",
      "photoURL": "https://..."
    },
    "caption": "My awesome project!",
    "image": "https://cloudinary.com/...",
    "likes": [],
    "comments": [],
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### GET /api/posts
**Description:** Get all posts (feed, within college).

**Headers:** `Authorization: Bearer jwt_token`

**Response (Success):**
```json
{
  "posts": [
    {
      "user": {
        "displayName": "john",
        "photoURL": "https://..."
      },
      "caption": "My awesome project!",
      "image": "https://...",
      "likes": ["user_id"],
      "comments": [
        {
          "user": { "displayName": "jane" },
          "text": "Great work!",
          "createdAt": "2023-01-01T00:00:00.000Z"
        }
      ],
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/posts/user/:userId
**Description:** Get posts by a specific user.

**Response (Success):** Same as GET /api/posts

### POST /api/posts/:postId/like
**Description:** Like or unlike a post.

**Headers:** `Authorization: Bearer jwt_token`

**Response (Success):**
```json
{
  "message": "Post liked",
  "likesCount": 1
}
```

### POST /api/posts/:postId/comment
**Description:** Add a comment to a post.

**Headers:** `Authorization: Bearer jwt_token`

**Request Body:**
```json
{
  "text": "Great work!"
}
```

**Response (Success):**
```json
{
  "message": "Comment added successfully",
  "comment": {
    "user": { "displayName": "john" },
    "text": "Great work!",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### DELETE /api/posts/:postId
**Description:** Delete a post (owner only).

**Headers:** `Authorization: Bearer jwt_token`

**Response (Success):**
```json
{
  "message": "Post deleted successfully"
}
```

## Projects

### POST /api/projects
**Description:** Create a new project.

**Headers:** `Authorization: Bearer jwt_token`

**Request Body:**
```json
{
  "name": "My Project",
  "description": "Project description",
  "githubRepo": "https://github.com/user/repo",
  "tags": ["react", "nodejs"],
  "allowCollaborations": true
}
```

**Response (Success):**
```json
{
  "message": "Project created successfully",
  "project": {
    "user": { "displayName": "john", "photoURL": "https://..." },
    "collegeId": "college_id",
    "name": "My Project",
    "description": "Project description",
    "githubRepo": "https://github.com/user/repo",
    "tags": ["react", "nodejs"],
    "allowCollaborations": true,
    "collaborators": [],
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### GET /api/projects
**Description:** Get all projects (feed, within college).

**Headers:** `Authorization: Bearer jwt_token`

**Response (Success):**
```json
{
  "projects": [
    {
      "user": { "displayName": "john", "photoURL": "https://..." },
      "name": "My Project",
      "description": "Project description",
      "tags": ["react", "nodejs"],
      "collaborators": [{ "displayName": "jane", "photoURL": "https://..." }],
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/projects/user/:userId
**Description:** Get projects by a specific user.

**Response (Success):** Same as GET /api/projects

### GET /api/projects/search?q=search_term
**Description:** Search projects by name or collaborator.

**Headers:** `Authorization: Bearer jwt_token`

**Response (Success):** Same as GET /api/projects

### PUT /api/projects/:projectId
**Description:** Update a project (owner only).

**Headers:** `Authorization: Bearer jwt_token`

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

**Response (Success):**
```json
{
  "message": "Project updated successfully",
  "project": { /* updated project object */ }
}
```

### DELETE /api/projects/:projectId
**Description:** Delete a project (owner only).

**Headers:** `Authorization: Bearer jwt_token`

**Response (Success):**
```json
{
  "message": "Project deleted successfully"
}
```

### POST /api/projects/:projectId/collaborator
**Description:** Add a collaborator to a project (owner only, if collaborations allowed).

**Headers:** `Authorization: Bearer jwt_token`

**Request Body:**
```json
{
  "collaboratorId": "user_id"
}
```

**Response (Success):**
```json
{
  "message": "Collaborator added successfully",
  "project": { /* updated project object */ }
}
```

### DELETE /api/projects/:projectId/collaborator
**Description:** Remove a collaborator from a project (owner or self).

**Headers:** `Authorization: Bearer jwt_token`

**Request Body:**
```json
{
  "collaboratorId": "user_id"
}
```

**Response (Success):**
```json
{
  "message": "Collaborator removed successfully",
  "project": { /* updated project object */ }
}
```

## Events

### POST /api/events/create
**Description:** Create a new event (College Admin Only).

**Headers:** `Authorization: Bearer jwt_token` (College Admin)

**Request Body:**
```json
{
  "title": "Tech Conference 2023",
  "date": "2023-12-01T10:00:00.000Z",
  "category": "Technology",
  "location": "Auditorium",
  "maxParticipants": 100,
  "description": "Annual tech conference",
  "banner": "https://..."
}
```

**Response (Success):**
```json
{
  "message": "Event created successfully",
  "event": {
    "title": "Tech Conference 2023",
    "date": "2023-12-01T10:00:00.000Z",
    "category": "Technology",
    "location": "Auditorium",
    "maxParticipants": 100,
    "description": "Annual tech conference",
    "banner": "https://...",
    "createdBy": "admin_id",
    "collegeId": "college_id",
    "registrations": [],
    "status": "active"
  }
}
```

### POST /api/events/register/:eventId
**Description:** Register for an event (Users Only).

**Headers:** `Authorization: Bearer jwt_token` (User)

**Response (Success):**
```json
{
  "message": "Registered successfully",
  "event": { /* updated event object */ }
}
```

### GET /api/events
**Description:** Get all events (within college).

**Headers:** `Authorization: Bearer jwt_token`

**Response (Success):**
```json
{
  "events": [
    {
      "title": "Tech Conference 2023",
      "date": "2023-12-01T10:00:00.000Z",
      "category": "Technology",
      "location": "Auditorium",
      "maxParticipants": 100,
      "description": "Annual tech conference",
      "banner": "https://...",
      "createdBy": { "displayName": "admin", "email": "admin@example.com" },
      "registrations": ["user_id"],
      "status": "active"
    }
  ]
}
```

### GET /api/events/:eventId
**Description:** Get a single event by ID.

**Headers:** `Authorization: Bearer jwt_token`

**Response (Success):**
```json
{
  "event": {
    "title": "Tech Conference 2023",
    "date": "2023-12-01T10:00:00.000Z",
    "category": "Technology",
    "location": "Auditorium",
    "maxParticipants": 100,
    "description": "Annual tech conference",
    "banner": "https://...",
    "createdBy": { "displayName": "admin", "email": "admin@example.com" },
    "registrations": [
      { "displayName": "john", "email": "john@example.com" }
    ],
    "status": "active"
  }
}
```

### GET /api/events/admin/registrations/:eventId
**Description:** Admin view: Get registered users for an event (College Admin Only).

**Headers:** `Authorization: Bearer jwt_token` (College Admin)

**Response (Success):**
```json
{
  "event": {
    "title": "Tech Conference 2023",
    "registrations": [
      {
        "displayName": "john",
        "email": "john@example.com",
        "fullName": "John Doe",
        "collegeName": "Example College"
      }
    ]
  }
}
```

### GET /api/events/admin/events
**Description:** Get all events created by the admin (College Admin Only).

**Headers:** `Authorization: Bearer jwt_token` (College Admin)

**Response (Success):**
```json
{
  "events": [
    {
      "title": "Tech Conference 2023",
      "date": "2023-12-01T10:00:00.000Z",
      "category": "Technology",
      "location": "Auditorium",
      "maxParticipants": 100,
      "description": "Annual tech conference",
      "banner": "https://...",
      "createdBy": { "collegeName": "Example College", "email": "admin@example.com" },
      "registrations": ["user_id"],
      "status": "active"
    }
  ]
}
```

### PUT /api/events/admin/status/:eventId
**Description:** Update event status (College Admin Only).

**Headers:** `Authorization: Bearer jwt_token` (College Admin)

**Request Body:**
```json
{
  "status": "closed"
}
```

**Response (Success):**
```json
{
  "message": "Event status updated successfully",
  "event": { /* updated event object */ }
}
```

## Subscriptions

### GET /api/subscriptions/plans
**Description:** Get all active subscription plans.

**Response (Success):**
```json
{
  "success": true,
  "plans": [
    {
      "name": "Basic Plan",
      "price": 99,
      "period": "month",
      "description": "Basic features",
      "features": ["Feature 1", "Feature 2"],
      "limits": { "projects": 5, "storage": "1GB" },
      "hasTrial": true,
      "trialPrice": 0,
      "trialDays": 7,
      "popular": false
    }
  ]
}
```

### GET /api/subscriptions/user
**Description:** Get user's current subscription.

**Headers:** `Authorization: Bearer jwt_token`

**Response (Success):**
```json
{
  "success": true,
  "subscription": {
    "userId": "user_id",
    "planId": { /* plan object */ },
    "status": "active",
    "startDate": "2023-01-01T00:00:00.000Z",
    "endDate": "2023-02-01T00:00:00.000Z",
    "trialEndDate": null,
    "paymentMethod": "razorpay"
  }
}
```

### POST /api/subscriptions/subscribe
**Description:** Subscribe to a plan.

**Headers:** `Authorization: Bearer jwt_token`

**Request Body:**
```json
{
  "planId": "plan_id",
  "paymentMethod": "razorpay"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "subscription": { /* subscription object */ }
}
```

### PUT /api/subscriptions/cancel
**Description:** Cancel subscription.

**Headers:** `Authorization: Bearer jwt_token`

**Response (Success):**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "subscription": { /* updated subscription object */ }
}
```

### GET /api/subscriptions/history
**Description:** Get subscription history.

**Headers:** `Authorization: Bearer jwt_token`

**Response (Success):**
```json
{
  "success": true,
  "history": [
    {
      "userId": "user_id",
      "planId": { /* plan object */ },
      "status": "cancelled",
      "startDate": "2023-01-01T00:00:00.000Z",
      "endDate": "2023-02-01T00:00:00.000Z",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/subscriptions/trials/start
**Description:** Start trial period.

**Headers:** `Authorization: Bearer jwt_token`

**Request Body:**
```json
{
  "planId": "plan_id"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Trial started successfully",
  "subscription": { /* subscription object */ }
}
```

### GET /api/subscriptions/trials/status
**Description:** Get trial status.

**Headers:** `Authorization: Bearer jwt_token`

**Response (Success):**
```json
{
  "success": true,
  "trial": {
    "userId": "user_id",
    "planId": { /* plan object */ },
    "status": "trial",
    "startDate": "2023-01-01T00:00:00.000Z",
    "endDate": "2023-01-08T00:00:00.000Z",
    "trialEndDate": "2023-01-08T00:00:00.000Z",
    "daysLeft": 5
  }
}
```

### POST /api/subscriptions/trials/convert
**Description:** Convert trial to paid subscription.

**Headers:** `Authorization: Bearer jwt_token`

**Response (Success):**
```json
{
  "success": true,
  "message": "Trial converted to paid subscription successfully",
  "subscription": { /* updated subscription object */ }
}
```

### POST /api/subscriptions/plans
**Description:** Create subscription plan (Admin - TODO: Add admin check).

**Headers:** `Authorization: Bearer jwt_token`

**Request Body:**
```json
{
  "name": "Premium Plan",
  "price": 199,
  "period": "month",
  "description": "Premium features",
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "limits": { "projects": 20, "storage": "10GB" },
  "hasTrial": true,
  "trialPrice": 0,
  "trialDays": 14,
  "popular": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Plan created successfully",
  "plan": { /* plan object */ }
}
```

### PUT /api/subscriptions/plans/:id
**Description:** Update subscription plan (Admin - TODO: Add admin check).

**Headers:** `Authorization: Bearer jwt_token`

**Request Body:**
```json
{
  "price": 249
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Plan updated successfully",
  "plan": { /* updated plan object */ }
}
```

### DELETE /api/subscriptions/plans/:id
**Description:** Delete subscription plan (Admin - TODO: Add admin check).

**Headers:** `Authorization: Bearer jwt_token`

**Response (Success):**
```json
{
  "success": true,
  "message": "Plan deactivated successfully"
}
```

## Payments

### POST /api/payments/create-order
**Description:** Create payment order for subscription.

**Headers:** `Authorization: Bearer jwt_token`

**Request Body:**
```json
{
  "planId": "plan_id",
  "isTrial": false
}
```

**Response (Success):**
```json
{
  "success": true,
  "order": { /* Razorpay order object */ },
  "paymentId": "payment_id",
  "key": "razorpay_key_id"
}
```

### POST /api/payments/verify
**Description:** Verify payment after completion.

**Headers:** `Authorization: Bearer jwt_token`

**Request Body:**
```json
{
  "razorpay_order_id": "order_id",
  "razorpay_payment_id": "payment_id",
  "razorpay_signature": "signature",
  "paymentId": "payment_id",
  "planId": "plan_id",
  "isTrial": false
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment verified and subscription activated",
  "subscription": { /* subscription object */ },
  "payment": { /* payment object */ }
}
```

### POST /api/payments/webhook
**Description:** Handle Razorpay webhooks (No auth required, but verifies signature).

**Request Body:** Razorpay webhook payload

**Response (Success):**
```json
{
  "status": "ok"
}
```

## Differentiation with College Admin

The key changes made to differentiate college admin functionality from regular users:

1. **Separate Authentication:**
   - Users authenticate via Firebase (signup/login with ID tokens)
   - College admins have separate register/login endpoints with email/password

2. **Event Management:**
   - College admins can create events (`POST /api/events/create`)
   - College admins can view registrations for their events (`GET /api/events/admin/registrations/:eventId`)
   - College admins can update event status (`PUT /api/events/admin/status/:eventId`)
   - College admins can view all events they created (`GET /api/events/admin/events`)
   - Users can only register for events (`POST /api/events/register/:eventId`) and view events

3. **User Management:**
   - College admins can view all users in their college (`GET /api/college-admin/users`)

4. **Subscription Plans:**
   - Admin routes exist for managing plans but are marked as TODO for admin checks (not fully implemented)

5. **College Isolation:**
   - All user data (projects, events, posts) is scoped to their college
   - Users can only interact with content from their own college

This separation ensures college admins have administrative control over events and user management within their institution, while regular users have access to collaborative features like projects, posts, and event registration.
