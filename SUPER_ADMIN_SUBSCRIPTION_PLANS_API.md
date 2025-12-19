# Super Admin Subscription Plan Management API

This document provides detailed API documentation for the subscription plan management endpoints available to super admins in the Collegium platform.

## Base URL
```
http://localhost:4000/api/super-admin
```

## Authentication
All subscription plan management endpoints require super admin JWT token authentication. Include the token in the `Authorization` header as `Bearer <super-admin-token>`.

## Subscription Plan Management Endpoints

### Get All Subscription Plans

**Endpoint:** `GET /api/super-admin/subscription-plans`

**Description:** Retrieve all subscription plans available in the system.

**Headers:**
- `Authorization: Bearer <super_admin_token>`

**Response (Success - 200):**
```json
{
  "plans": [
    {
      "_id": "60f1b2b3c4d5e6f7g8h9i0j1",
      "name": "Basic Plan",
      "price": 9.99,
      "period": "month",
      "description": "Perfect for individual users",
      "features": ["5 Projects", "10 Events", "Basic Support"],
      "limits": {
        "chats": 50,
        "projects": 5,
        "events": 10,
        "resources": 100
      },
      "hasTrial": true,
      "trialPrice": 0,
      "trialDays": 7,
      "popular": false,
      "active": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

**Response (Error - 500):**
```json
{
  "error": "Internal server error"
}
```

### Create New Subscription Plan

**Endpoint:** `POST /api/super-admin/subscription-plans`

**Description:** Create a new subscription plan.

**Headers:**
- `Authorization: Bearer <super_admin_token>`

**Request Body:**
```json
{
  "name": "Premium Plan",
  "price": 29.99,
  "period": "month",
  "description": "Advanced features for power users",
  "features": ["Unlimited Projects", "Unlimited Events", "Priority Support"],
  "limits": {
    "chats": 500,
    "projects": -1,
    "events": -1,
    "resources": 1000
  },
  "hasTrial": true,
  "trialPrice": 0,
  "trialDays": 14,
  "popular": true,
  "active": true
}
```

**Response (Success - 201):**
```json
{
  "message": "Subscription plan created successfully",
  "plan": {
    "_id": "60f1b2b3c4d5e6f7g8h9i0j2",
    "name": "Premium Plan",
    "price": 29.99,
    "period": "month",
    "description": "Advanced features for power users",
    "features": ["Unlimited Projects", "Unlimited Events", "Priority Support"],
    "limits": {
      "chats": 500,
      "projects": -1,
      "events": -1,
      "resources": 1000
    },
    "hasTrial": true,
    "trialPrice": 0,
    "trialDays": 14,
    "popular": true,
    "active": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "error": "Name, price, period, and description are required"
}
```

**Response (Error - 400):**
```json
{
  "error": "Subscription plan with this name already exists"
}
```

### Update Subscription Plan

**Endpoint:** `PUT /api/super-admin/subscription-plans/:planId`

**Description:** Update an existing subscription plan.

**Headers:**
- `Authorization: Bearer <super_admin_token>`

**Parameters:**
- `planId` (path parameter) - The ID of the subscription plan to update

**Request Body:**
```json
{
  "price": 34.99,
  "limits": {
    "chats": 600,
    "projects": -1,
    "events": -1,
    "resources": 1200
  },
  "popular": false
}
```

**Response (Success - 200):**
```json
{
  "message": "Subscription plan updated successfully",
  "plan": {
    "_id": "60f1b2b3c4d5e6f7g8h9i0j2",
    "name": "Premium Plan",
    "price": 34.99,
    "period": "month",
    "description": "Advanced features for power users",
    "features": ["Unlimited Projects", "Unlimited Events", "Priority Support"],
    "limits": {
      "chats": 600,
      "projects": -1,
      "events": -1,
      "resources": 1200
    },
    "hasTrial": true,
    "trialPrice": 0,
    "trialDays": 14,
    "popular": false,
    "active": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

**Response (Error - 404):**
```json
{
  "error": "Subscription plan not found"
}
```

**Response (Error - 400):**
```json
{
  "error": "Subscription plan with this name already exists"
}
```

### Delete Subscription Plan

**Endpoint:** `DELETE /api/super-admin/subscription-plans/:planId`

**Description:** Delete a subscription plan (only if no active subscriptions exist).

**Headers:**
- `Authorization: Bearer <super_admin_token>`

**Parameters:**
- `planId` (path parameter) - The ID of the subscription plan to delete

**Response (Success - 200):**
```json
{
  "message": "Subscription plan deleted successfully"
}
```

**Response (Error - 404):**
```json
{
  "error": "Subscription plan not found"
}
```

**Response (Error - 400):**
```json
{
  "error": "Cannot delete subscription plan with active subscriptions. Please deactivate the plan instead."
}
```

## Request Body Fields

### Required Fields for Creating Plans
- `name` (string): Unique name of the subscription plan
- `price` (number): Price of the subscription
- `period` (string): Billing period ("month" or "year")
- `description` (string): Description of the plan

### Optional Fields
- `features` (array of strings): List of features included in the plan
- `limits` (object): Usage limits for the plan
  - `chats` (number): Maximum number of chats (-1 for unlimited)
  - `projects` (number): Maximum number of projects (-1 for unlimited)
  - `events` (number): Maximum number of events (-1 for unlimited)
  - `resources` (number): Maximum resources (-1 for unlimited)
- `hasTrial` (boolean): Whether the plan has a trial period (default: false)
- `trialPrice` (number): Price for trial period (default: 0)
- `trialDays` (number): Number of trial days (default: 0)
- `popular` (boolean): Whether this is a popular plan (default: false)
- `active` (boolean): Whether the plan is active (default: true)

## Error Handling

All endpoints return appropriate HTTP status codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors, missing required fields, conflicts)
- **401**: Unauthorized (missing/invalid token)
- **404**: Not Found (plan not found)
- **500**: Internal Server Error

## Database Model

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

## Usage Examples

### JavaScript - Get All Plans
```javascript
const getSubscriptionPlans = async () => {
  const token = localStorage.getItem('superAdminToken');
  const response = await fetch('http://localhost:4000/api/super-admin/subscription-plans', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (response.ok) {
    return data.plans;
  } else {
    throw new Error(data.error);
  }
};
```

### JavaScript - Create New Plan
```javascript
const createSubscriptionPlan = async (planData) => {
  const token = localStorage.getItem('superAdminToken');
  const response = await fetch('http://localhost:4000/api/super-admin/subscription-plans', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(planData),
  });

  const data = await response.json();
  if (response.ok) {
    return data.plan;
  } else {
    throw new Error(data.error);
  }
};
