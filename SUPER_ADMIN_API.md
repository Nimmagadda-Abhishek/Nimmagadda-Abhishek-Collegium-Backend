# Super Admin API Documentation

This document provides a comprehensive overview of the super admin-specific API endpoints, including their HTTP methods, request/response data, and descriptions. These endpoints are restricted to super admins and require appropriate authentication. Super admins have system-wide access to manage colleges, college admins, and view all data across the platform.

## Base URL
```
http://localhost:4000/api/super-admin
```

## Authentication
Super admin endpoints require JWT token from super admin login. Include the token in the `Authorization` header as `Bearer <super-admin-token>`.

## Super Admin Endpoints

### Authentication Endpoints

#### 1. Register Super Admin
- **Method**: POST
- **Path**: `/register`
- **Description**: Registers a new super admin account (one-time setup). This endpoint should be used only once to create the initial super admin account.
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "confirmPassword": "string"
  }
  ```
- **Response** (Success - 201):
  ```json
  {
    "message": "Super admin registered successfully"
  }
  ```
- **Response** (Error - 400/500):
  ```json
  {
    "error": "string"
  }
  ```
- **Notes**: This endpoint is for initial setup only. Multiple super admin accounts are not recommended.

#### 2. Login Super Admin
- **Method**: POST
- **Path**: `/login`
- **Description**: Logs in a super admin using email and password, returns JWT token.
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
    "superAdmin": {
      "id": "string",
      "email": "string"
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

### College Management Endpoints

#### 3. Create College
- **Method**: POST
- **Path**: `/colleges`
- **Description**: Creates a new college in the system with name, domain, and unique college ID.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Request Body**:
  ```json
  {
    "collegeName": "string",
    "domain": "string (e.g., 'college.edu')",
    "collegeId": "string (unique identifier)"
  }
  ```
- **Response** (Success - 201):
  ```json
  {
    "message": "College created successfully",
    "college": {
      "collegeName": "string",
      "domain": "string",
      "collegeId": "string",
      "_id": "string",
      "createdAt": "date"
    }
  }
  ```
- **Response** (Error - 400/500):
  ```json
  {
    "error": "string"
  }
  ```

#### 4. Get All Colleges
- **Method**: GET
- **Path**: `/colleges`
- **Description**: Retrieves the list of all colleges in the system.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Response** (Success - 200):
  ```json
  {
    "colleges": [
      {
        "collegeName": "string",
        "domain": "string",
        "collegeId": "string",
        "_id": "string",
        "createdAt": "date"
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

#### 5. Update College
- **Method**: PUT
- **Path**: `/colleges/:collegeId`
- **Description**: Updates an existing college's information (name and/or domain).
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Parameters**: `collegeId` (path parameter)
- **Request Body**:
  ```json
  {
    "collegeName": "string (optional)",
    "domain": "string (optional)"
  }
  ```
- **Response** (Success - 200):
  ```json
  {
    "message": "College updated successfully",
    "college": {
      "collegeName": "string",
      "domain": "string",
      "collegeId": "string",
      "_id": "string",
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

#### 6. Delete College
- **Method**: DELETE
- **Path**: `/colleges/:collegeId`
- **Description**: Deletes a college from the system. Can only be deleted if no associated data exists (admins, users, events, projects).
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Parameters**: `collegeId` (path parameter)
- **Response** (Success - 200):
  ```json
  {
    "message": "College deleted successfully"
  }
  ```
- **Response** (Error - 400/404/500):
  ```json
  {
    "error": "string"
  }
  ```

### College Admin Management Endpoints

#### 7. Get All College Admins
- **Method**: GET
- **Path**: `/college-admins`
- **Description**: Retrieves the list of all college admins across all colleges, including their approval status.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Response** (Success - 200):
  ```json
  {
    "collegeAdmins": [
      {
        "collegeName": "string",
        "email": "string",
        "isApproved": boolean,
        "_id": "string",
        "createdAt": "date"
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

#### 8. Approve/Reject College Admin
- **Method**: PUT
- **Path**: `/college-admins/:adminId/approve`
- **Description**: Approves or rejects a college admin registration. Only approved admins can log in and manage their college.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Parameters**: `adminId` (path parameter)
- **Request Body**:
  ```json
  {
    "isApproved": boolean
  }
  ```
- **Response** (Success - 200):
  ```json
  {
    "message": "College admin approved/rejected successfully",
    "admin": {
      "collegeName": "string",
      "email": "string",
      "isApproved": boolean,
      "_id": "string",
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

### System Data Overview Endpoints

#### 9. Get All Users
- **Method**: GET
- **Path**: `/users`
- **Description**: Retrieves the list of all users across all colleges, including their college information.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Response** (Success - 200):
  ```json
  {
    "users": [
      {
        "firebaseUid": "string",
        "email": "string",
        "displayName": "string",
        "fullName": "string",
        "collegeId": {
          "collegeName": "string",
          "_id": "string"
        },
        "collegeName": "string",
        "photoURL": "string",
        "_id": "string",
        "createdAt": "date",
        "lastLogin": "date"
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

#### 10. Get All Events
- **Method**: GET
- **Path**: `/events`
- **Description**: Retrieves the list of all events across all colleges, including creator and college information.
- **Headers**: `Authorization: Bearer <super-admin-token>`
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
          "_id": "string"
        },
        "collegeId": {
          "collegeName": "string",
          "_id": "string"
        },
        "registrations": ["userId1", "userId2"],
        "status": "active|closed|postponed",
        "_id": "string",
        "createdAt": "date"
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

#### 11. Get All Projects
- **Method**: GET
- **Path**: `/projects`
- **Description**: Retrieves the list of all projects across all colleges, including owner and college information.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Response** (Success - 200):
  ```json
  {
    "projects": [
      {
        "name": "string",
        "description": "string",
        "githubRepo": "string",
        "tags": ["tag1", "tag2"],
        "allowCollaborations": boolean,
        "collaborators": ["userId1", "userId2"],
        "user": {
          "displayName": "string",
          "_id": "string"
        },
        "collegeId": {
          "collegeName": "string",
          "_id": "string"
        },
        "_id": "string",
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

#### 12. Get All Subscriptions
- **Method**: GET
- **Path**: `/subscriptions`
- **Description**: Retrieves the list of all user subscriptions across all colleges, including user and plan information.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Response** (Success - 200):
  ```json
  {
    "subscriptions": [
      {
        "userId": "userId",
        "planId": "planId",
        "status": "trial|active|cancelled|expired",
        "startDate": "date",
        "endDate": "date",
        "trialEndDate": "date",
        "autoRenew": boolean,
        "paymentMethod": "string",
        "lastPaymentDate": "date",
        "nextBillingDate": "date",
        "user": {
          "displayName": "string",
          "email": "string",
          "_id": "string"
        },
        "plan": {
          "name": "string",
          "_id": "string"
        },
        "_id": "string",
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

### User Management Endpoints

#### 13. Block User
- **Method**: POST
- **Path**: `/users/:userId/block`
- **Description**: Blocks a user account (super admin action). Blocked users cannot access the platform.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Parameters**: `userId` (path parameter)
- **Response** (Success - 200):
  ```json
  {
    "message": "User blocked by super admin successfully"
  }
  ```
- **Response** (Error - 400/404/500):
  ```json
  {
    "error": "string"
  }
  ```

#### 14. Unblock User
- **Method**: POST
- **Path**: `/users/:userId/unblock`
- **Description**: Unblocks a previously blocked user account.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Parameters**: `userId` (path parameter)
- **Response** (Success - 200):
  ```json
  {
    "message": "User unblocked by super admin successfully"
  }
  ```
- **Response** (Error - 400/404/500):
  ```json
  {
    "error": "string"
  }
  ```

#### 15. Delete User Account
- **Method**: DELETE
- **Path**: `/users/:userId`
- **Description**: Soft deletes a user account. The user data is retained but marked as deleted.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Parameters**: `userId` (path parameter)
- **Response** (Success - 200):
  ```json
  {
    "message": "User account deleted successfully"
  }
  ```
- **Response** (Error - 400/404/500):
  ```json
  {
    "error": "string"
  }
  ```

### Subscription Plan Management Endpoints

#### 16. Get All Subscription Plans
- **Method**: GET
- **Path**: `/subscription-plans`
- **Description**: Retrieves all subscription plans in the system.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Response** (Success - 200):
  ```json
  {
    "plans": [
      {
        "name": "string",
        "price": "number",
        "period": "month|year",
        "description": "string",
        "features": ["string"],
        "limits": {
          "chats": "number",
          "projects": "number",
          "events": "number",
          "resources": "number"
        },
        "hasTrial": "boolean",
        "trialPrice": "number",
        "trialDays": "number",
        "popular": "boolean",
        "active": "boolean",
        "_id": "string",
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

#### 17. Create Subscription Plan
- **Method**: POST
- **Path**: `/subscription-plans`
- **Description**: Creates a new subscription plan.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Request Body**:
  ```json
  {
    "name": "string",
    "price": "number",
    "period": "month|year",
    "description": "string",
    "features": ["string"],
    "limits": {
      "chats": "number",
      "projects": "number",
      "events": "number",
      "resources": "number"
    },
    "hasTrial": "boolean",
    "trialPrice": "number",
    "trialDays": "number",
    "popular": "boolean",
    "active": "boolean"
  }
  ```
- **Response** (Success - 201):
  ```json
  {
    "message": "Subscription plan created successfully",
    "plan": {
      // Plan object
    }
  }
  ```
- **Response** (Error - 400/500):
  ```json
  {
    "error": "string"
  }
  ```

#### 18. Update Subscription Plan
- **Method**: PUT
- **Path**: `/subscription-plans/:planId`
- **Description**: Updates an existing subscription plan.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Parameters**: `planId` (path parameter)
- **Request Body**: (same as create, all fields optional)
- **Response** (Success - 200):
  ```json
  {
    "message": "Subscription plan updated successfully",
    "plan": {
      // Updated plan object
    }
  }
  ```
- **Response** (Error - 400/404/500):
  ```json
  {
    "error": "string"
  }
  ```

#### 19. Delete Subscription Plan
- **Method**: DELETE
- **Path**: `/subscription-plans/:planId`
- **Description**: Deletes a subscription plan (only if no active subscriptions exist).
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Parameters**: `planId` (path parameter)
- **Response** (Success - 200):
  ```json
  {
    "message": "Subscription plan deleted successfully"
  }
  ```
- **Response** (Error - 400/404/500):
  ```json
  {
    "error": "string"
  }
  ```

### Company Management Endpoints

#### 20. Get All Companies
- **Method**: GET
- **Path**: `/companies`
- **Description**: Retrieves all companies (pending and approved) in the system.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Response** (Success - 200):
  ```json
  {
    "companies": [
      {
        "companyName": "string",
        "contactName": "string",
        "email": "string",
        "phone": "string",
        "isApproved": "boolean",
        "isVerified": "boolean",
        "_id": "string",
        "createdAt": "date"
      }
    ]
  }
  ```
  {
    "error": "string"
  }
  ```

#### 21. Get Company by ID
- **Method**: GET
- **Path**: `/companies/:companyId`
- **Description**: Retrieves detailed information about a specific company, including onboarding documents.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Parameters**: `companyId` (path parameter)
- **Response** (Success - 200):
  ```json
  {
    "company": {
      "companyName": "string",
      "contactName": "string",
      "email": "string",
      "phone": "string",
      "website": "string",
      "natureOfWork": "string",
      "yearOfIncorporation": "number",
      "registrationNumber": "string",
      "registeredAddress": "string",
      "city": "string",
      "state": "string",
      "country": "string",
      "pincode": "string",
      "certificateOfIncorporation": "string (url)",
      "gstCertificate": "string (url)",
      "companyIdProof": "string (url)",
      "authorizedSignatoryIdProof": "string (url)",
      "isApproved": "boolean",
      "isVerified": "boolean",
      "_id": "string",
      "createdAt": "date"
    }
  }
  ```
- **Response** (Error - 404/500):
  ```json
  {
    "error": "string"
  }
  ```

#### 22. Approve/Reject Company
- **Method**: PUT
- **Path**: `/companies/:companyId/approve`
- **Description**: Approves or rejects a company registration.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Parameters**: `companyId` (path parameter)
- **Request Body**:
  ```json
  {
    "isApproved": "boolean"
  }
  ```
- **Response** (Success - 200):
  ```json
  {
    "message": "Company approved/rejected successfully",
    "company": {
      // Company object
    }
  }
  ```
- **Response** (Error - 400/404/500):
  ```json
  {
    "error": "string"
  }
  ```

### Company Subscription Plan Management Endpoints

#### 23. Get All Company Subscription Plans
- **Method**: GET
- **Path**: `/company-subscription-plans`
- **Description**: Retrieves all company subscription plans in the system.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Response** (Success - 200):
  ```json
  {
    "plans": [
      {
        "name": "string",
        "price": "number",
        "duration": "monthly|yearly",
        "description": "string",
        "features": {
          "hiringPosts": "number",
          "support": "string",
          "visibility": "string",
          "analytics": "boolean",
          "customBranding": "boolean"
        },
        "isActive": "boolean",
        "_id": "string",
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

#### 24. Create Company Subscription Plan
- **Method**: POST
- **Path**: `/company-subscription-plans`
- **Description**: Creates a new company subscription plan.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Request Body**:
  ```json
  {
    "name": "string",
    "price": "number",
    "duration": "string",
    "features": {
       "hiringPosts": "number",
       "support": "string",
       "visibility": "string",
       "analytics": "boolean",
       "customBranding": "boolean"
    }
  }
  ```
- **Response** (Success - 201):
  ```json
  {
    "message": "Company subscription plan created successfully",
    "plan": {
      // Plan object
    }
  }
  ```
- **Response** (Error - 400/500):
  ```json
  {
    "error": "string"
  }
  ```

#### 25. Update Company Subscription Plan
- **Method**: PUT
- **Path**: `/company-subscription-plans/:planId`
- **Description**: Updates an existing company subscription plan.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Parameters**: `planId` (path parameter)
- **Request Body**: (same as create, all fields optional)
- **Response** (Success - 200):
  ```json
  {
    "message": "Company subscription plan updated successfully",
    "plan": {
      // Updated plan object
    }
  }
  ```
- **Response** (Error - 400/404/500):
  ```json
  {
    "error": "string"
  }
  ```

#### 26. Delete Company Subscription Plan
- **Method**: DELETE
- **Path**: `/company-subscription-plans/:planId`
- **Description**: Deactivated a company subscription plan (soft delete).
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Parameters**: `planId` (path parameter)
- **Response** (Success - 200):
  ```json
  {
    "message": "Company subscription plan deactivated successfully"
  }
  ```
- **Response** (Error - 400/404/500):
  ```json
  {
    "error": "string"
  }
  ```

### Notification Endpoints

#### 22. Send Notification
- **Method**: POST
- **Path**: `/notifications`
- **Description**: Sends a promotional notification to all users.
- **Headers**: `Authorization: Bearer <super-admin-token>`
- **Request Body**:
  ```json
  {
    "title": "string",
    "message": "string",
    "data": "object (optional)"
  }
  ```
- **Response** (Success - 200):
  ```json
  {
    "message": "Promotional notification sent successfully",
    "sentCount": "number"
  }
  ```
- **Response** (Error - 400/500):
  ```json
  {
    "error": "string"
  }
  ```

## Error Handling
All endpoints return appropriate HTTP status codes and error messages in JSON format:
- 200: Success
- 201: Created
- 400: Bad Request (validation errors, missing required fields, conflicts)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (not authorized - though super admin has highest privileges)
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
  "error": "Invalid token for super admin."
}
```
```json
{
  "error": "College admin not found"
}
```
```json
{
  "error": "Cannot delete college with associated data. Please remove all college admins, users, events, and projects first."
}
```

## Security Features

### Authentication & Authorization
- **JWT Token Verification**: All protected endpoints require valid super admin JWT token
- **Token Validation**: Tokens are verified for super admin privileges specifically
- **Password Security**: Passwords are hashed using bcryptjs
- **Unique Constraints**: Email uniqueness enforced for super admin accounts

### Data Access Control
- **System-Wide Access**: Super admins can view and manage all data across colleges
- **No Restrictions**: Unlike college admins, super admins are not limited by college boundaries
- **Audit Trail**: All operations are logged with super admin context

## Usage Notes

### Initial Setup
1. Use `/register` endpoint once to create the super admin account
2. Use `/login` to authenticate and get JWT token
3. Use the token for all subsequent API calls

### College Management Workflow
1. Create colleges using `/colleges` POST endpoint
2. College admins register through their separate endpoint
3. Review and approve college admins using `/college-admins/:adminId/approve`
4. Monitor system data using overview endpoints

### Data Monitoring
- Use overview endpoints (`/users`, `/events`, `/projects`, `/subscriptions`) to monitor platform activity
- Use college management endpoints to maintain college registry
- Use notification endpoint for system-wide announcements

### Best Practices
- **Single Super Admin**: Typically only one super admin account should exist
- **Secure Token Storage**: Store JWT tokens securely and rotate regularly
- **Regular Monitoring**: Use overview endpoints to monitor platform health
- **Data Validation**: Always validate input data before operations
- **Error Handling**: Implement proper error handling in client applications

## Database Models

### SuperAdmin Model
```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
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

### SubscriptionPlan Model
```javascript
{
  name: String (required, unique),
  price: Number (required),
  period: String (required, enum: ['month', 'year']),
  description: String (required),
  features: [String],
  limits: {
    chats: Number,
    projects: Number,
    events: Number,
    resources: Number
  },
  hasTrial: Boolean (default: false),
  trialPrice: Number (default: 0),
  trialDays: Number (default: 0),
  popular: Boolean (default: false),
  active: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## API Integration Examples

### JavaScript (Node.js) - Login Example
```javascript
const loginSuperAdmin = async (email, password) => {
  const response = await fetch('http://localhost:4000/api/super-admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('superAdminToken', data.token);
    return data;
  } else {
    throw new Error(data.error);
  }
};
```

### JavaScript - Get All Colleges Example
```javascript
const getAllColleges = async () => {
  const token = localStorage.getItem('superAdminToken');
  const response = await fetch('http://localhost:4000/api/super-admin/colleges', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (response.ok) {
    return data.colleges;
  } else {
    throw new Error(data.error);
  }
};
```

This documentation covers all super admin functionality available in the Collegium backend system. The super admin role provides complete oversight and management capabilities across the entire platform.
