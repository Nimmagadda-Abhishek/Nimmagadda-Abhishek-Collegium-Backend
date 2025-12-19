# College Admin API Documentation

This document provides a comprehensive overview of the college admin-specific API endpoints, including their HTTP methods, request/response data, and descriptions. These endpoints are restricted to approved college admins and require appropriate authentication. College admins have administrative control over their college's events, user management, and related data.

## Base URL
```
http://localhost:4000/api/college-admin
```

## Authentication
College admin endpoints require JWT token from college admin login. Include the token in the `Authorization` header as `Bearer <college-admin-token>`. College admins must be approved by a super admin before they can log in and access these endpoints.

## College Admin Endpoints

### Authentication Endpoints

#### 1. Register College Admin
- **Method**: POST
- **Path**: `/register`
- **Description**: Registers a new college admin account. The admin will need to be approved by a super admin before they can log in.
- **Request Body**:
  ```json
  {
    "collegeName": "string",
    "email": "string",
    "password": "string",
    "confirmPassword": "string"
  }
  ```
- **Response** (Success - 201):
  ```json
  {
    "message": "College admin registered successfully"
  }
  ```
- **Response** (Error - 400/500):
  ```json
  {
    "error": "string"
  }
  ```
- **Notes**: If the college doesn't exist, it will be created automatically. Passwords must match.

#### 2. Login College Admin
- **Method**: POST
- **Path**: `/login`
- **Description**: Logs in a college admin using email and password, returns JWT token. Admin must be approved.
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response** (Success - 200):
  ```json
  {
    "message": "Login successful",
    "admin": {
      "id": "string",
      "collegeId": "string",
      "email": "string"
    },
    "token": "string (JWT token)"
  }
  ```
- **Response** (Error - 400/403/500):
  ```json
  {
    "error": "string"
  }
  ```

### User Management Endpoints

#### 3. Get Users
- **Method**: GET
- **Path**: `/users`
- **Description**: Retrieves the list of all users (students) in the authenticated college admin's college.
- **Headers**: `Authorization: Bearer <college-admin-token>`
- **Query Parameters** (optional): `collegeId` (defaults to admin's college)
- **Response** (Success - 200):
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
- **Response** (Error - 403/500):
  ```json
  {
    "error": "string"
  }
  ```

### Event Management Endpoints

#### 4. Create Event
- **Method**: POST
- **Path**: `/events/create`
- **Description**: Creates a new event for the college admin's college. Requires a banner image upload.
- **Headers**: `Authorization: Bearer <college-admin-token>`
- **Request Body** (form-data):
  ```
  title: string
  date: string (ISO date)
  category: string
  location: string
  maxParticipants: number
  description: string
  banner: [file] (image file)
  ```
- **Response** (Success - 201):
  ```json
  {
    "message": "Event created successfully",
    "event": {
      "title": "string",
      "date": "date",
      "category": "string",
      "location": "string",
      "maxParticipants": number,
      "description": "string",
      "banner": "string (URL)",
      "createdBy": "string",
      "collegeId": "string",
      "registrations": [],
      "status": "active"
    }
  }
  ```
- **Response** (Error - 400/500):
  ```json
  {
    "error": "string"
  }
  ```

#### 5. Get Admin Events
- **Method**: GET
- **Path**: `/events/admin/events`
- **Description**: Retrieves all events created by the authenticated college admin.
- **Headers**: `Authorization: Bearer <college-admin-token>`
- **Response** (Success - 200):
  ```json
  {
    "events": [
      {
        "title": "string",
        "date": "date",
        "category": "string",
        "location": "string",
        "maxParticipants": number,
        "description": "string",
        "banner": "string",
        "createdBy": {
          "collegeName": "string",
          "email": "string"
        },
        "registrations": ["userId1", "userId2"],
        "status": "active|closed|postponed"
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

#### 6. Admin View Registrations
- **Method**: GET
- **Path**: `/events/admin/registrations/:eventId`
- **Description**: Retrieves the list of users registered for a specific event created by the admin.
- **Headers**: `Authorization: Bearer <college-admin-token>`
- **Parameters**: `eventId` (path parameter)
- **Response** (Success - 200):
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
- **Response** (Error - 404/500):
  ```json
  {
    "error": "string"
  }
  ```

#### 7. Update Event Status
- **Method**: PUT
- **Path**: `/events/admin/status/:eventId`
- **Description**: Updates the status of an event created by the admin (active, closed, or postponed).
- **Headers**: `Authorization: Bearer <college-admin-token>`
- **Parameters**: `eventId` (path parameter)
- **Request Body**:
  ```json
  {
    "status": "active|closed|postponed"
  }
  ```
- **Response** (Success - 200):
  ```json
  {
    "message": "Event status updated successfully",
    "event": { /* updated event object */ }
  }
  ```
- **Response** (Error - 400/404/500):
  ```json
  {
    "error": "string"
  }
  ```

## Error Handling
All endpoints return appropriate HTTP status codes and error messages in JSON format:
- 200: Success
- 201: Created
- 400: Bad Request (validation errors, missing required fields)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (admin not approved, access denied)
- 404: Not Found (resource not found)
- 500: Internal Server Error

Common error responses:
```json
{
  "error": "Access denied. No token provided."
}
```
```json
{
  "error": "Invalid token for college admin."
}
```
```json
{
  "error": "College admin not approved yet."
}
```
```json
{
  "error": "Event not found or not authorized"
}
```

## Security Features

### Authentication & Authorization
- **JWT Token Verification**: All protected endpoints require valid college admin JWT token
- **Token Validation**: Tokens are verified for college admin privileges specifically
- **Approval Check**: College admins must be approved by super admin before access
- **Password Security**: Passwords are hashed using bcryptjs
- **College Isolation**: Admins can only manage data within their own college

### Data Access Control
- **College-Scoped Access**: College admins can only view and manage data for their assigned college
- **Event Ownership**: Admins can only modify events they created
- **User Management**: Limited to viewing users within their college
- **Audit Trail**: All operations are logged with college admin context

## Usage Notes

### Initial Setup
1. Register using `/register` endpoint
2. Wait for super admin approval
3. Use `/login` to authenticate and get JWT token
4. Use the token for all subsequent API calls

### Event Management Workflow
1. Create events using `/events/create` with banner image
2. Monitor registrations using `/events/admin/registrations/:eventId`
3. View all created events using `/events/admin/events`
4. Update event status as needed using `/events/admin/status/:eventId`

### User Management
- Use `/users` to view all students in your college
- This helps in understanding the college community and planning events

### Best Practices
- **Secure Token Storage**: Store JWT tokens securely and rotate regularly
- **Image Upload**: Ensure banner images are in supported formats (jpg, png, jpeg, gif)
- **Event Planning**: Check max participants and plan accordingly
- **Regular Monitoring**: Use admin endpoints to monitor event registrations and user engagement
- **Data Validation**: Always validate input data before operations

## Database Models

### CollegeAdmin Model
```javascript
{
  collegeId: ObjectId (ref: 'College'),
  email: String (required, unique),
  password: String (required, hashed),
  isApproved: Boolean (default: false),
  createdAt: Date
}
```

### College Model
```javascript
{
  collegeName: String (required, unique),
  domain: String (required, unique),
  collegeId: String (required, unique),
  createdAt: Date
}
```

### Event Model
```javascript
{
  title: String (required),
  date: Date (required),
  category: String (required),
  location: String (required),
  maxParticipants: Number (required),
  description: String (required),
  banner: String (required),
  createdBy: ObjectId (ref: 'CollegeAdmin'),
  collegeId: ObjectId (ref: 'College'),
  registrations: [{
    userId: ObjectId (ref: 'User'),
    registeredAt: Date
  }],
  likes: [ObjectId (ref: 'User')],
  status: String (enum: ['active', 'closed', 'postponed']),
  createdAt: Date
}
```

## API Integration Examples

### JavaScript (Node.js) - Login Example
```javascript
const loginCollegeAdmin = async (email, password) => {
  const response = await fetch('http://localhost:4000/api/college-admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('collegeAdminToken', data.token);
    return data;
  } else {
    throw new Error(data.error);
  }
};
```

### JavaScript - Create Event Example
```javascript
const createEvent = async (eventData, bannerFile) => {
  const token = localStorage.getItem('collegeAdminToken');
  const formData = new FormData();
  formData.append('title', eventData.title);
  formData.append('date', eventData.date);
  formData.append('category', eventData.category);
  formData.append('location', eventData.location);
  formData.append('maxParticipants', eventData.maxParticipants);
  formData.append('description', eventData.description);
  formData.append('banner', bannerFile);

  const response = await fetch('http://localhost:4000/api/college-admin/events/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (response.ok) {
    return data;
  } else {
    throw new Error(data.error);
  }
};
```

This documentation covers all college admin functionality available in the Collegium backend system. The college admin role provides essential administrative capabilities for managing events and monitoring users within their institution.
