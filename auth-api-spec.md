# Authentication API Specification

This document describes how the server expects data from the frontend for login and signup operations. The backend uses Firebase authentication.

## Signup Endpoint

- **Route**: `POST /auth/signup`
- **Content-Type**: `application/json`
- **Expected Request Body**:

```json
{
  "idToken": "firebase_id_token_here",
  "fullName": "User's Full Name",
  "collegeName": "User's College Name"
}
```

- **Required Fields**:
  - `idToken`: Firebase ID token obtained after Firebase authentication
  - `fullName`: User's full name
  - `collegeName`: User's college name

- **Response (Success - 201)**:

```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "displayName": "display_name",
    "fullName": "User's Full Name",
    "collegeName": "User's College Name",
    "photoURL": "profile_picture_url"
  },
  "token": "jwt_token_here"
}
```

- **Response (Error - 400)**:

```json
{
  "error": "ID token, full name, and college name are required"
}
```

## Login Endpoint

- **Route**: `POST /auth/login`
- **Content-Type**: `application/json`
- **Expected Request Body**:

```json
{
  "idToken": "firebase_id_token_here"
}
```

- **Required Fields**:
  - `idToken`: Firebase ID token obtained after Firebase authentication

- **Response (Success - 200)**:

```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "displayName": "display_name",
    "photoURL": "profile_picture_url"
  },
  "token": "jwt_token_here"
}
```

- **Response (Error - 400)**:

```json
{
  "error": "ID token is required"
}
```

## Additional Notes

- Both endpoints validate the `idToken` using Firebase Admin SDK to verify user authenticity
- For signup, additional user details (`fullName`, `collegeName`) are required and stored in the database
- For login, if the user doesn't exist in the database, it automatically creates a user account
- Successful authentication returns a JWT token that expires in 7 days
- The JWT token should be included in the `Authorization` header as `Bearer <token>` for accessing protected routes
- Protected routes use the `verifyToken` middleware to validate the JWT token

## Example Frontend Implementation

### Firebase Authentication Setup
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Initialize Firebase
const firebaseConfig = {
  // Your Firebase config
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
```

### Signup Example
```javascript
const handleSignup = async (email, password, fullName, collegeName) => {
  try {
    // Firebase signup
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    // Backend signup
    const response = await fetch('/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken,
        fullName,
        collegeName,
      }),
    });

    const data = await response.json();
    // Store JWT token for future requests
    localStorage.setItem('token', data.token);
  } catch (error) {
    console.error('Signup failed:', error);
  }
};
```

### Login Example
```javascript
const handleLogin = async (email, password) => {
  try {
    // Firebase login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    // Backend login
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken,
      }),
    });

    const data = await response.json();
    // Store JWT token for future requests
    localStorage.setItem('token', data.token);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Making Authenticated Requests
```javascript
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
