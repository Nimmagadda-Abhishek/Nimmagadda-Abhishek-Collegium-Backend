# Backend API with Firebase Authentication

This is a Node.js backend API that integrates Firebase Authentication for user signup and login.

## Features

- User signup and login using Firebase ID tokens
- JWT token generation for session management
- User profile retrieval
- MongoDB integration for user data storage

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Firebase project with Authentication enabled

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables in `.env` file (see `.env` template)
4. Start the server:
   ```
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/your-database-name

# JWT Secret
JWT_SECRET=your-jwt-secret-key
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User signup
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires authentication)

### Health Check

- `GET /health` - Server health check

## Usage

### Signup/Login Flow

1. User authenticates with Firebase on the frontend
2. Frontend sends the Firebase ID token to the backend along with additional user details (for signup)
3. Backend verifies the token and creates/updates user in database
4. Backend returns a JWT token for session management

### Example Requests

```javascript
// Signup
fetch('/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    idToken: 'firebase-id-token-here',
    fullName: 'John Doe',
    collegeName: 'Example University'
  })
})
.then(response => response.json())
.then(data => {
  // Handle response
  console.log(data.token); // JWT token
});

// Login
fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    idToken: 'firebase-id-token-here'
  })
})
.then(response => response.json())
.then(data => {
  // Handle response
  console.log(data.token); // JWT token
});
```

### Protected Routes

For protected routes, include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## Firebase Setup

1. Create a Firebase project
2. Enable Authentication
3. Generate a service account key (JSON file)
4. Extract the values from the JSON file and add them to your `.env` file

## MongoDB Setup

Make sure MongoDB is running locally or update the `MONGODB_URI` in `.env` to point to your MongoDB instance.

## Security Notes

- Never commit the `.env` file to version control
- Use strong, unique JWT secrets
- Validate and sanitize all inputs
- Use HTTPS in production
