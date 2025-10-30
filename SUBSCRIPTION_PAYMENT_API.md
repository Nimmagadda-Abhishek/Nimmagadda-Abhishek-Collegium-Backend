# Subscription and Payment API Documentation

This document provides a comprehensive overview of the Subscription and Payment API endpoints, including their HTTP methods, request/response data structures, and descriptions. The API is built with Express.js, uses JWT for authentication, and integrates with Razorpay for payment processing.

## Base URL
```
http://localhost:4000
```

## Authentication
Most endpoints require authentication via JWT token. Include the token in the `Authorization` header as `Bearer <token>`.

## Data Models

### SubscriptionPlan
```json
{
  "name": "string (required, unique)",
  "price": "number (required, min: 0)",
  "period": "string (enum: 'month', 'year', required)",
  "description": "string (required)",
  "features": ["string"],
  "limits": {
    "chats": "number (default: 0)",
    "projects": "number (default: 0)",
    "events": "number (default: 0)",
    "resources": "number (default: 0)"
  },
  "hasTrial": "boolean (default: false)",
  "trialPrice": "number (default: 0)",
  "trialDays": "number (default: 0)",
  "popular": "boolean (default: false)",
  "active": "boolean (default: true)",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### UserSubscription
```json
{
  "userId": "ObjectId (ref: User, required)",
  "planId": "ObjectId (ref: SubscriptionPlan, required)",
  "status": "string (enum: 'trial', 'active', 'cancelled', 'expired', required)",
  "startDate": "date (required)",
  "endDate": "date (required)",
  "trialEndDate": "date",
  "autoRenew": "boolean (default: true)",
  "paymentMethod": "string (required)",
  "lastPaymentDate": "date",
  "nextBillingDate": "date",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Payment
```json
{
  "userId": "ObjectId (ref: User, required)",
  "subscriptionId": "ObjectId (ref: UserSubscription, required)",
  "amount": "number (required, min: 0)",
  "currency": "string (default: 'INR')",
  "paymentMethod": "string (required)",
  "gatewayOrderId": "string (required)",
  "gatewayPaymentId": "string",
  "status": "string (enum: 'pending', 'completed', 'failed', 'refunded', required)",
  "createdAt": "date",
  "completedAt": "date"
}
```

## Subscription Endpoints (`/api/subscriptions`)

### 1. Get All Subscription Plans
- **Method**: GET
- **Path**: `/api/subscriptions/plans`
- **Description**: Retrieves all active subscription plans, sorted by price.
- **Response** (Success - 200):
  ```json
  {
    "success": true,
    "plans": [
      {
        "name": "string",
        "price": 199,
        "period": "month",
        "description": "string",
        "features": ["string"],
        "limits": {
          "chats": 10,
          "projects": 5,
          "events": 2,
          "resources": 20
        },
        "hasTrial": true,
        "trialPrice": 0,
        "trialDays": 7,
        "popular": false,
        "active": true,
        "createdAt": "date",
        "updatedAt": "date"
      }
    ]
  }
  ```
- **Response** (Error - 500):
  ```json
  {
    "success": false,
    "error": "Internal server error",
    "details": "string"
  }
  ```

### 2. Create Subscription Plan (Admin)
- **Method**: POST
- **Path**: `/api/subscriptions/plans`
- **Description**: Creates a new subscription plan (requires admin privileges).
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "string",
    "price": 199,
    "period": "month",
    "description": "string",
    "features": ["string"],
    "limits": {
      "chats": 10,
      "projects": 5,
      "events": 2,
      "resources": 20
    },
    "hasTrial": true,
    "trialPrice": 0,
    "trialDays": 7,
    "popular": false
  }
  ```
- **Response** (Success - 201):
  ```json
  {
    "success": true,
    "message": "Plan created successfully",
    "plan": {
      "name": "string",
      "price": 199,
      "period": "month",
      "description": "string",
      "features": ["string"],
      "limits": {
        "chats": 10,
        "projects": 5,
        "events": 2,
        "resources": 20
      },
      "hasTrial": true,
      "trialPrice": 0,
      "trialDays": 7,
      "popular": false,
      "active": true,
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
  ```
- **Response** (Error - 500):
  ```json
  {
    "success": false,
    "error": "Internal server error",
    "details": "string"
  }
  ```

### 3. Update Subscription Plan (Admin)
- **Method**: PUT
- **Path**: `/api/subscriptions/plans/:id`
- **Description**: Updates an existing subscription plan (requires admin privileges).
- **Headers**: `Authorization: Bearer <token>`
- **Parameters**: `id` (path parameter, plan ID)
- **Request Body**: Partial plan object (same as create, optional fields)
- **Response** (Success - 200):
  ```json
  {
    "success": true,
    "message": "Plan updated successfully",
    "plan": {
      // Updated plan object
    }
  }
  ```
- **Response** (Error - 404/500):
  ```json
  {
    "error": "Plan not found"
  }
  ```

### 4. Delete Subscription Plan (Admin)
- **Method**: DELETE
- **Path**: `/api/subscriptions/plans/:id`
- **Description**: Deactivates a subscription plan (soft delete, requires admin privileges).
- **Headers**: `Authorization: Bearer <token>`
- **Parameters**: `id` (path parameter, plan ID)
- **Response** (Success - 200):
  ```json
  {
    "success": true,
    "message": "Plan deactivated successfully"
  }
  ```
- **Response** (Error - 404/500):
  ```json
  {
    "error": "Plan not found"
  }
  ```

### 5. Get User's Current Subscription (Protected)
- **Method**: GET
- **Path**: `/api/subscriptions/user`
- **Description**: Retrieves the authenticated user's current subscription.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (Success - 200):
  ```json
  {
    "success": true,
    "subscription": {
      "userId": "ObjectId",
      "planId": {
        "name": "string",
        "price": 199,
        "period": "month",
        "description": "string",
        "features": ["string"],
        "limits": {
          "chats": 10,
          "projects": 5,
          "events": 2,
          "resources": 20
        },
        "hasTrial": true,
        "trialPrice": 0,
        "trialDays": 7,
        "popular": false,
        "active": true,
        "createdAt": "date",
        "updatedAt": "date"
      },
      "status": "active",
      "startDate": "date",
      "endDate": "date",
      "trialEndDate": "date",
      "autoRenew": true,
      "paymentMethod": "razorpay",
      "lastPaymentDate": "date",
      "nextBillingDate": "date",
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
  ```
- **Response** (Error - 500):
  ```json
  {
    "success": false,
    "error": "Internal server error",
    "details": "string"
  }
  ```

### 6. Subscribe to a Plan (Protected)
- **Method**: POST
- **Path**: `/api/subscriptions/subscribe`
- **Description**: Subscribes the user to a plan, creating a new subscription.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "planId": "ObjectId",
    "paymentMethod": "string"
  }
  ```
- **Response** (Success - 201):
  ```json
  {
    "success": true,
    "message": "Subscription created successfully",
    "subscription": {
      // Subscription object
    }
  }
  ```
- **Response** (Error - 404/500):
  ```json
  {
    "error": "Plan not found"
  }
  ```

### 7. Cancel Subscription (Protected)
- **Method**: PUT
- **Path**: `/api/subscriptions/cancel`
- **Description**: Cancels the user's active subscription.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (Success - 200):
  ```json
  {
    "success": true,
    "message": "Subscription cancelled successfully",
    "subscription": {
      // Updated subscription object
    }
  }
  ```
- **Response** (Error - 404/500):
  ```json
  {
    "error": "Active subscription not found"
  }
  ```

### 8. Get Subscription History (Protected)
- **Method**: GET
- **Path**: `/api/subscriptions/history`
- **Description**: Retrieves the user's subscription history.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (Success - 200):
  ```json
  {
    "success": true,
    "history": [
      {
        // Subscription objects
      }
    ]
  }
  ```
- **Response** (Error - 500):
  ```json
  {
    "success": false,
    "error": "Internal server error",
    "details": "string"
  }
  ```

### 9. Start Trial Period (Protected)
- **Method**: POST
- **Path**: `/api/subscriptions/trials/start`
- **Description**: Starts a trial period for a plan.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "planId": "ObjectId"
  }
  ```
- **Response** (Success - 201):
  ```json
  {
    "success": true,
    "message": "Trial started successfully",
    "subscription": {
      // Subscription object
    }
  }
  ```
- **Response** (Error - 400/500):
  ```json
  {
    "error": "Trial not available for this plan"
  }
  ```

### 10. Get Trial Status (Protected)
- **Method**: GET
- **Path**: `/api/subscriptions/trials/status`
- **Description**: Retrieves the user's trial status and days left.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (Success - 200):
  ```json
  {
    "success": true,
    "trial": {
      // Subscription object with daysLeft
    }
  }
  ```
- **Response** (Error - 404/500):
  ```json
  {
    "error": "No active trial found"
  }
  ```

### 11. Convert Trial to Paid Subscription (Protected)
- **Method**: POST
- **Path**: `/api/subscriptions/trials/convert`
- **Description**: Converts an active trial to a paid subscription.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (Success - 200):
  ```json
  {
    "success": true,
    "message": "Trial converted to paid subscription successfully",
    "subscription": {
      // Updated subscription object
    }
  }
  ```
- **Response** (Error - 404/500):
  ```json
  {
    "error": "No active trial found"
  }
  ```

## Payment Endpoints (`/api/payments`)

### 1. Create Payment Order (Protected)
- **Method**: POST
- **Path**: `/api/payments/create-order`
- **Description**: Creates a Razorpay payment order for a subscription plan.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "planId": "ObjectId",
    "isTrial": false
  }
  ```
- **Response** (Success - 200):
  ```json
  {
    "success": true,
    "order": {
      "id": "string",
      "amount": 19900,
      "currency": "INR",
      "receipt": "string",
      "status": "created"
    },
    "paymentId": "ObjectId",
    "key": "string (Razorpay key ID)"
  }
  ```
- **Response** (Error - 404/500):
  ```json
  {
    "error": "Plan not found"
  }
  ```

### 2. Verify Payment (Protected)
- **Method**: POST
- **Path**: `/api/payments/verify`
- **Description**: Verifies a payment after completion and updates subscription.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "razorpay_order_id": "string",
    "razorpay_payment_id": "string",
    "razorpay_signature": "string",
    "paymentId": "ObjectId",
    "planId": "ObjectId",
    "isTrial": false
  }
  ```
- **Response** (Success - 200):
  ```json
  {
    "success": true,
    "message": "Payment verified and subscription activated",
    "subscription": {
      // Subscription object
    },
    "payment": {
      // Payment object
    }
  }
  ```
- **Response** (Error - 400/500):
  ```json
  {
    "error": "Payment verification failed"
  }
  ```

### 3. Handle Razorpay Webhook
- **Method**: POST
- **Path**: `/api/payments/webhook`
- **Description**: Handles Razorpay webhooks for payment confirmations (no auth, signature verification).
- **Request Body**: Razorpay webhook payload
- **Response** (Success - 200):
  ```json
  {
    "status": "ok"
  }
  ```
- **Response** (Error - 400/500):
  ```json
  {
    "error": "Invalid signature"
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
- Razorpay is used for payment processing.
- Environment variables required: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
- Admin routes currently lack admin middleware (marked as TODO).
- All amounts are in INR, with Razorpay expecting paise (amount * 100).
