# API Documentation

This document provides a comprehensive overview of the API endpoints, including their HTTP methods, request/response data, and descriptions. The API is built with Express.js and uses JWT for authentication where required.

## Base URL
```
http://localhost:4000
```

## Authentication
Most endpoints require authentication via JWT token. Include the token in the `Authorization` header as `Bearer <token>`.

## Endpoints

### Authentication Endpoints (`/api/auth`)

#### 1. User Signup
- **Method**: POST
- **Path**: `/api/auth/signup`
- **Description**: Registers a new user using Firebase ID token.
- **Request Body**:
  ```json
  {
    "idToken": "string (Firebase ID token)",
    "fullName": "string",
    "collegeName": "string"
  }
  ```
- **Response** (Success - 201):
  ```json
  {
    "message": "User created successfully",
    "user": {
      "id": "string",
      "email": "string",
      "displayName": "string",
      "fullName": "string",
      "collegeName": "string",
      "photoURL": "string"
    },
    "token": "string (JWT token)"
  }
  ```
- **Response** (Error - 400/500):
  ```json
  {
    "error": "string"
  }
  ```

#### 2. User Login
- **Method**: POST
- **Path**: `/api/auth/login`
- **Description**: Logs in a user using Firebase ID token. Creates user if not exists.
- **Request Body**:
  ```json
  {
    "idToken": "string (Firebase ID token)"
  }
  ```
- **Response** (Success - 200):
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": "string",
      "email": "string",
      "displayName": "string",
      "photoURL": "string"
    },
    "token": "string (JWT token)"
  }
  ```
- **Response** (Error - 400/500):
  ```json
  {
    "error": "string"
  }
  ```

#### 3. Get User Profile (Protected)
- **Method**: GET
- **Path**: `/api/auth/profile`
- **Description**: Retrieves the authenticated user's profile information.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (Success - 200):
  ```json
  {
    "user": {
      "id": "string",
      "email": "string",
      "displayName": "string",
      "fullName": "string",
      "collegeName": "string",
      "photoURL": "string",
      "createdAt": "date",
      "lastLogin": "date"
    }
  }
  ```
- **Response** (Error - 401/404/500):
  ```json
  {
    "error": "string"
  }
  ```

### Profile Endpoints (`/api/profile`)

#### 1. Create or Update Profile (Protected)
- **Method**: POST
- **Path**: `/api/profile`
- **Description**: Creates or updates the user's profile, including optional image upload and social links.
- **Headers**: `Authorization: Bearer <token>`
- **Content-Type**: `multipart/form-data` (for image upload)
- **Request Body**:
  - `profileImage`: File (optional)
  - `bio`: string (required)
  - `branch`: string (required)
  - `year`: string (required)
  - `githubUsername`: string (optional)
  - `linkedinUrl`: string (optional)
- **Response** (Success - 200):
  ```json
  {
    "message": "Profile updated successfully",
    "profile": {
      "user": "string",
      "profileImage": "string (URL)",
      "bio": "string",
      "branch": "string",
      "year": "string",
      "githubProfile": {
        "username": "string",
        "profileData": "object or null"
      },
      "linkedinProfile": {
        "url": "string",
        "profileData": "object or null"
      },
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
  ```
- **Response** (Error - 400/404/500):
  ```json
  {
    "error": "string"
  }
  ```

#### 2. Get Profile (Protected)
- **Method**: GET
- **Path**: `/api/profile`
- **Description**: Retrieves the authenticated user's profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (Success - 200):
  ```json
  {
    "profile": {
      "user": {
        "email": "string",
        "displayName": "string",
        "fullName": "string",
        "collegeName": "string",
        "photoURL": "string"
      },
      "profileImage": "string (URL)",
      "bio": "string",
      "branch": "string",
      "year": "string",
      "githubProfile": "object",
      "linkedinProfile": "object",
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
  ```
- **Response** (Error - 401/404/500):
  ```json
  {
    "error": "string"
  }
  ```

### Post Endpoints (`/api/posts`)

#### 1. Create Post (Protected)
- **Method**: POST
- **Path**: `/api/posts`
- **Description**: Creates a new post with caption and image.
- **Headers**: `Authorization: Bearer <token>`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `caption`: string (required)
  - `image`: File (required)
- **Response** (Success - 201):
  ```json
  {
    "message": "Post created successfully",
    "post": {
      "user": {
        "displayName": "string",
        "photoURL": "string"
      },
      "caption": "string",
      "image": "string (URL)",
      "likes": [],
      "comments": [],
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
  ```
- **Response** (Error - 400/500):
  ```json
  {
    "error": "string"
  }
  ```

#### 2. Get All Posts (Feed)
- **Method**: GET
- **Path**: `/api/posts`
- **Description**: Retrieves all posts in the feed, sorted by most recent.
- **Response** (Success - 200):
  ```json
  {
    "posts": [
      {
        "user": {
          "displayName": "string",
          "photoURL": "string"
        },
        "caption": "string",
        "image": "string (URL)",
        "likes": ["userId1", "userId2"],
        "comments": [
          {
            "user": {
              "displayName": "string"
            },
            "text": "string",
            "createdAt": "date"
          }
        ],
        "createdAt": "date",
        "updatedAt": "date"
      }
    ]
  }
  ```
- **Response** (Error - 500):
  ```json
  {
    "error": "string"
  }
  ```

#### 3. Get Posts by User
- **Method**: GET
- **Path**: `/api/posts/user/:userId`
- **Description**: Retrieves posts by a specific user.
- **Parameters**: `userId` (path parameter)
- **Response** (Success - 200):
  ```json
  {
    "posts": [
      {
        "user": {
          "displayName": "string",
          "photoURL": "string"
        },
        "caption": "string",
        "image": "string (URL)",
        "likes": ["userId1"],
        "comments": [],
        "createdAt": "date",
        "updatedAt": "date"
      }
    ]
  }
  ```
- **Response** (Error - 500):
  ```json
  {
    "error": "string"
  }
  ```

#### 4. Like or Unlike Post (Protected)
- **Method**: POST
- **Path**: `/api/posts/:postId/like`
- **Description**: Likes or unlikes a post.
- **Headers**: `Authorization: Bearer <token>`
- **Parameters**: `postId` (path parameter)
- **Response** (Success - 200):
  ```json
  {
    "message": "Post liked" or "Post unliked",
    "likesCount": number
  }
  ```
- **Response** (Error - 401/404/500):
  ```json
  {
    "error": "string"
  }
  ```

#### 5. Add Comment to Post (Protected)
- **Method**: POST
- **Path**: `/api/posts/:postId/comment`
- **Description**: Adds a comment to a post.
- **Headers**: `Authorization: Bearer <token>`
- **Parameters**: `postId` (path parameter)
- **Request Body**:
  ```json
  {
    "text": "string"
  }
  ```
- **Response** (Success - 201):
  ```json
  {
    "message": "Comment added successfully",
    "comment": {
      "user": {
        "displayName": "string"
      },
      "text": "string",
      "createdAt": "date"
    }
  }
  ```
- **Response** (Error - 400/404/500):
  ```json
  {
    "error": "string"
  }
  ```

#### 6. Delete Post (Protected)
- **Method**: DELETE
- **Path**: `/api/posts/:postId`
- **Description**: Deletes a post (only by the owner).
- **Headers**: `Authorization: Bearer <token>`
- **Parameters**: `postId` (path parameter)
- **Response** (Success - 200):
  ```json
  {
    "message": "Post deleted successfully"
  }
  ```
- **Response** (Error - 403/404/500):
  ```json
  {
    "error": "string"
  }
  ```

### Health Check Endpoint

#### 1. Health Check
- **Method**: GET
- **Path**: `/health`
- **Description**: Returns the health status and a list of all routes.
- **Response** (Success - 200):
  ```json
  {
    "status": "ok",
    "routes": {
      "/api/auth/signup": "POST - User signup",
      "/api/auth/login": "POST - User login",
      "/api/auth/profile": "GET - Get user profile (protected)",
      "/api/profile": "POST - Create or update profile (protected)",
      "/api/profile": "GET - Get profile (protected)",
      "/api/posts": "POST - Create a new post (protected)",
      "/api/posts": "GET - Get all posts (feed)",
      "/api/posts/user/:userId": "GET - Get posts by a specific user",
      "/api/posts/:postId/like": "POST - Like or unlike a post (protected)",
      "/api/posts/:postId/comment": "POST - Add a comment to a post (protected)",
      "/api/posts/:postId": "DELETE - Delete a post (protected)",
      "/health": "GET - Health check"
    }
  }
  ```

## Error Handling
All endpoints return appropriate HTTP status codes and error messages in JSON format:
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (not authorized)
- 404: Not Found
- 500: Internal Server Error

## Notes
- Image uploads are handled via Cloudinary.
- Firebase is used for authentication.
- MongoDB is used for data storage.
