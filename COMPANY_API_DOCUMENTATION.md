# Company API Documentation

This document provides complete API documentation for company-related endpoints in the Collegium Backend system.

## Base URLs
- Authentication endpoints: `/api/company-auth`
- Job management: `/api/jobs`
- Job applications: `/api/job-applications`
- Subscription plans: `/api/company-subscriptions`
- Payments: `/api/company-payments`

## Authentication
Company endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 1. Authentication Endpoints

### 1.1 Company Signup
**Endpoint:** `POST /api/company-auth/signup`

**Description:** Register a new company account.

**Request Body:**
```json
{
  "companyName": "string",
  "contactName": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

**Response (201):**
```json
{
  "message": "Company registered successfully",
  "company": {
    "id": "string",
    "companyName": "string",
    "contactName": "string",
    "email": "string",
    "phone": "string"
  },
  "token": "string"
}
```

**Error Responses:**
- 400: All fields are required / Passwords do not match / Company already exists
- 500: Internal server error

### 1.2 Company Login
**Endpoint:** `POST /api/company/auth/login`

**Description:** Authenticate a company user.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "company": {
    "id": "string",
    "companyName": "string",
    "contactName": "string",
    "email": "string",
    "phone": "string",
    "isOnboarded": "boolean",
    "isVerified": "boolean"
  },
  "token": "string"
}
```

**Error Responses:**
- 400: Email and password required / Invalid credentials
- 403: Company registration pending approval
- 404: Company not found
- 500: Internal server error

### 1.3 Company Onboarding
**Endpoint:** `POST /api/company/auth/onboarding`

**Description:** Complete company onboarding with document uploads.

**Authentication:** Required (JWT token)

**Content-Type:** `multipart/form-data`

**Request Body:**
```json
{
  "website": "string",
  "natureOfWork": "string",
  "yearOfIncorporation": "number",
  "registrationNumber": "string",
  "registeredAddress": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "pincode": "string"
}
```

**Files:**
- certificateOfIncorporation: File
- gstCertificate: File
- companyIdProof: File
- authorizedSignatoryIdProof: File

**Response (200):**
```json
{
  "message": "Onboarding completed successfully",
  "company": {
    "id": "string",
    "companyName": "string",
    "website": "string",
    "natureOfWork": "string",
    "yearOfIncorporation": "number",
    "registrationNumber": "string",
    "registeredAddress": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "pincode": "string",
    "certificateOfIncorporation": "string",
    "gstCertificate": "string",
    "companyIdProof": "string",
    "authorizedSignatoryIdProof": "string",
    "isOnboarded": true
  }
}
```

**Error Responses:**
- 401: Access denied
- 404: Company not found
- 500: Internal server error

### 1.4 Get Company Profile
**Endpoint:** `GET /api/company/auth/profile`

**Description:** Retrieve the authenticated company's profile information.

**Authentication:** Required (JWT token)

**Response (200):**
```json
{
  "message": "Company profile retrieved successfully",
  "company": {
    "id": "string",
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
    "certificateOfIncorporation": "string",
    "gstCertificate": "string",
    "companyIdProof": "string",
    "authorizedSignatoryIdProof": "string",
    "isOnboarded": "boolean",
    "isVerified": "boolean",
    "createdAt": "date",
    "lastLogin": "date"
  }
}
```

**Error Responses:**
- 401: Access denied
- 404: Company not found
- 500: Internal server error

### 1.5 Get Company Dashboard
**Endpoint:** `GET /api/company/auth/dashboard`

**Description:** Retrieve dashboard data for the authenticated company.

**Authentication:** Required (JWT token)

**Response (200):**
```json
{
  "message": "Company dashboard data retrieved successfully",
  "dashboard": {
    "activePlan": {
      "name": "string",
      "expiresOn": "string"
    },
    "postsRemaining": {
      "current": "number",
      "limit": "number or 'Unlimited'",
      "display": "string",
      "percentageChange": "string"
    },
    "applications": {
      "activeHirings": "number",
      "recent": [
        {
          "status": "string",
          "appliedAt": "date",
          "jobId": {
            "title": "string"
          },
          "studentId": {
            "displayName": "string",
            "email": "string"
          }
        }
      ]
    },
    "recentHirings": [
      {
        "status": "string",
        "appliedAt": "date",
        "reviewedAt": "date",
        "jobId": {
          "title": "string"
        },
        "studentId": {
          "displayName": "string",
          "email": "string"
        }
      }
    ]
  }
}
```

**Error Responses:**
- 401: Access denied
- 500: Internal server error

## 2. Job Management Endpoints

### 2.1 Create Job Posting
**Endpoint:** `POST /api/company/jobs`

**Description:** Create a new job posting.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "hiringType": "internship|full-time|part-time|contract|freelance",
  "workLocation": "remote|on-site|hybrid",
  "budget": "number",
  "stipend": "number",
  "duration": "string",
  "numberOfOpenings": "number",
  "requiredSkills": ["string"]
}
```

**Response (201):**
```json
{
  "message": "Job created successfully",
  "job": {
    "id": "string",
    "title": "string",
    "description": "string",
    "hiringType": "string",
    "workLocation": "string",
    "budget": "number",
    "stipend": "number",
    "duration": "string",
    "numberOfOpenings": "number",
    "requiredSkills": ["string"],
    "isActive": true,
    "createdAt": "date"
  }
}
```

**Error Responses:**
- 401: Access denied
- 400: Validation errors
- 500: Internal server error

### 2.2 Get Company Jobs
**Endpoint:** `GET /api/company/jobs/company`

**Description:** Retrieve all jobs posted by the authenticated company.

**Authentication:** Required (JWT token)

**Response (200):**
```json
{
  "message": "Jobs retrieved successfully",
  "jobs": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "hiringType": "string",
      "workLocation": "string",
      "budget": "number",
      "stipend": "number",
      "duration": "string",
      "numberOfOpenings": "number",
      "requiredSkills": ["string"],
      "isActive": "boolean",
      "createdAt": "date",
      "updatedAt": "date"
    }
  ]
}
```

**Error Responses:**
- 401: Access denied
- 500: Internal server error

### 2.3 Get Job by ID
**Endpoint:** `GET /api/company/jobs/:jobId`

**Description:** Retrieve a specific job posting by ID.

**Authentication:** Required (JWT token)

**Parameters:**
- jobId: Job ID (URL parameter)

**Response (200):**
```json
{
  "message": "Job retrieved successfully",
  "job": {
    "id": "string",
    "title": "string",
    "description": "string",
    "hiringType": "string",
    "workLocation": "string",
    "budget": "number",
    "stipend": "number",
    "duration": "string",
    "numberOfOpenings": "number",
    "requiredSkills": ["string"],
    "isActive": "boolean",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

**Error Responses:**
- 401: Access denied
- 404: Job not found
- 500: Internal server error

### 2.4 Update Job Posting
**Endpoint:** `PUT /api/company/jobs/:jobId`

**Description:** Update an existing job posting.

**Authentication:** Required (JWT token)

**Parameters:**
- jobId: Job ID (URL parameter)

**Request Body:** (same as create job, all fields optional)

**Response (200):**
```json
{
  "message": "Job updated successfully",
  "job": {
    // Updated job object
  }
}
```

**Error Responses:**
- 401: Access denied
- 404: Job not found
- 400: Validation errors
- 500: Internal server error

### 2.5 Delete Job Posting
**Endpoint:** `DELETE /api/company/jobs/:jobId`

**Description:** Delete a job posting.

**Authentication:** Required (JWT token)

**Parameters:**
- jobId: Job ID (URL parameter)

**Response (200):**
```json
{
  "message": "Job deleted successfully"
}
```

**Error Responses:**
- 401: Access denied
- 404: Job not found
- 500: Internal server error

### 2.6 Get All Active Jobs
**Endpoint:** `GET /api/company/jobs`

**Description:** Retrieve all active job postings (public endpoint for students).

**Authentication:** None required

**Response (200):**
```json
{
  "message": "Active jobs retrieved successfully",
  "jobs": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "hiringType": "string",
      "workLocation": "string",
      "budget": "number",
      "stipend": "number",
      "duration": "string",
      "numberOfOpenings": "number",
      "requiredSkills": ["string"],
      "companyId": {
        "companyName": "string"
      },
      "createdAt": "date"
    }
  ]
}
```

**Error Responses:**
- 500: Internal server error

## 3. Job Application Management Endpoints

### 3.1 Apply for Job
**Endpoint:** `POST /api/job-applications/apply`

**Description:** Apply for a job posting (student endpoint).

**Authentication:** Required (Student JWT token)

**Request Body:**
```json
{
  "jobId": "string"
}
```

**Response (201):**
```json
{
  "message": "Application submitted successfully",
  "application": {
    "id": "string",
    "jobId": "string",
    "studentId": "string",
    "status": "pending",
    "appliedAt": "date"
  }
}
```

**Error Responses:**
- 401: Access denied
- 400: Already applied
- 404: Job not found
- 500: Internal server error

### 3.2 Get Applications for Job
**Endpoint:** `GET /api/job-applications/job/:jobId`

**Description:** Get all applications for a specific job.

**Authentication:** Required (Company JWT token)

**Parameters:**
- jobId: Job ID (URL parameter)

**Response (200):**
```json
{
  "message": "Applications retrieved successfully",
  "applications": [
    {
      "id": "string",
      "jobId": "string",
      "studentId": {
        "displayName": "string",
        "email": "string"
      },
      "status": "pending|reviewed|accepted|rejected",
      "appliedAt": "date",
      "reviewedAt": "date"
    }
  ]
}
```

**Error Responses:**
- 401: Access denied
- 404: Job not found
- 500: Internal server error

### 3.3 Get Student Applications
**Endpoint:** `GET /api/job-applications/student`

**Description:** Get all applications submitted by the authenticated student.

**Authentication:** Required (Student JWT token)

**Response (200):**
```json
{
  "message": "Student applications retrieved successfully",
  "applications": [
    {
      "id": "string",
      "jobId": {
        "title": "string",
        "companyId": {
          "companyName": "string"
        }
      },
      "status": "pending|reviewed|accepted|rejected",
      "appliedAt": "date",
      "reviewedAt": "date"
    }
  ]
}
```

**Error Responses:**
- 401: Access denied
- 500: Internal server error

### 3.4 Update Application Status
**Endpoint:** `PUT /api/job-applications/:applicationId/status`

**Description:** Update the status of a job application.

**Authentication:** Required (Company JWT token)

**Parameters:**
- applicationId: Application ID (URL parameter)

**Request Body:**
```json
{
  "status": "pending|reviewed|accepted|rejected"
}
```

**Response (200):**
```json
{
  "message": "Application status updated successfully",
  "application": {
    "id": "string",
    "status": "string",
    "reviewedAt": "date"
  }
}
```

**Error Responses:**
- 401: Access denied
- 404: Application not found
- 400: Invalid status
- 500: Internal server error

### 3.5 Get Company Applications
**Endpoint:** `GET /api/job-applications/company`

**Description:** Get all applications for the authenticated company's jobs.

**Authentication:** Required (Company JWT token)

**Response (200):**
```json
{
  "message": "Company applications retrieved successfully",
  "applications": [
    {
      "id": "string",
      "jobId": {
        "title": "string"
      },
      "studentId": {
        "displayName": "string",
        "email": "string"
      },
      "status": "pending|reviewed|accepted|rejected",
      "appliedAt": "date",
      "reviewedAt": "date"
    }
  ]
}
```

**Error Responses:**
- 401: Access denied
- 500: Internal server error

### 3.6 Get Company Hirings
**Endpoint:** `GET /api/job-applications/company/hirings`

**Description:** Get hiring statistics for the authenticated company.

**Authentication:** Required (Company JWT token)

**Response (200):**
```json
{
  "message": "Company hirings retrieved successfully",
  "hirings": [
    {
      "id": "string",
      "jobId": {
        "title": "string"
      },
      "studentId": {
        "displayName": "string",
        "email": "string"
      },
      "status": "accepted",
      "appliedAt": "date",
      "reviewedAt": "date"
    }
  ]
}
```

**Error Responses:**
- 401: Access denied
- 500: Internal server error

## 4. Subscription Plan Endpoints

### 4.1 Get All Subscription Plans
**Endpoint:** `GET /api/company/subscriptions/plans`

**Description:** Retrieve all active company subscription plans.

**Authentication:** None required

**Response (200):**
```json
{
  "plans": [
    {
      "id": "string",
      "name": "string",
      "price": "number",
      "duration": "monthly|yearly",
      "features": {
        "hiringPosts": "number",
        "support": "string",
        "visibility": "string",
        "analytics": "boolean",
        "customBranding": "boolean"
      },
      "isActive": true,
      "createdAt": "date",
      "updatedAt": "date"
    }
  ]
}
```

**Error Responses:**
- 500: Internal server error

### 4.2 Get Plan by ID
**Endpoint:** `GET /api/company/subscriptions/plans/:planId`

**Description:** Retrieve a specific subscription plan by ID.

**Authentication:** None required

**Parameters:**
- planId: Plan ID (URL parameter)

**Response (200):**
```json
{
  "plan": {
    "id": "string",
    "name": "string",
    "price": "number",
    "duration": "monthly|yearly",
    "features": {
      "hiringPosts": "number",
      "support": "string",
      "visibility": "string",
      "analytics": "boolean",
      "customBranding": "boolean"
    },
    "isActive": true,
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

**Error Responses:**
- 404: Plan not found
- 500: Internal server error

### 4.3 Create Subscription Plan
**Endpoint:** `POST /api/company/subscriptions/plans`

**Description:** Create a new subscription plan (Super Admin only).

**Authentication:** Required (Super Admin JWT token)

**Request Body:**
```json
{
  "name": "string",
  "price": "number",
  "duration": "monthly|yearly",
  "features": {
    "hiringPosts": "number",
    "support": "string",
    "visibility": "string",
    "analytics": "boolean",
    "customBranding": "boolean"
  }
}
```

**Response (201):**
```json
{
  "message": "Company subscription plan created successfully",
  "plan": {
    // Plan object
  }
}
```

**Error Responses:**
- 401: Access denied
- 400: Required fields missing / Plan name already exists
- 500: Internal server error

### 4.4 Update Subscription Plan
**Endpoint:** `PUT /api/company/subscriptions/plans/:planId`

**Description:** Update an existing subscription plan (Super Admin only).

**Authentication:** Required (Super Admin JWT token)

**Parameters:**
- planId: Plan ID (URL parameter)

**Request Body:** (same as create, all fields optional)

**Response (200):**
```json
{
  "message": "Company subscription plan updated successfully",
  "plan": {
    // Updated plan object
  }
}
```

**Error Responses:**
- 401: Access denied
- 404: Plan not found
- 500: Internal server error

### 4.5 Delete Subscription Plan
**Endpoint:** `DELETE /api/company/subscriptions/plans/:planId`

**Description:** Deactivate a subscription plan (Super Admin only).

**Authentication:** Required (Super Admin JWT token)

**Parameters:**
- planId: Plan ID (URL parameter)

**Response (200):**
```json
{
  "message": "Company subscription plan deactivated successfully"
}
```

**Error Responses:**
- 401: Access denied
- 404: Plan not found
- 500: Internal server error

## 5. Payment Endpoints

### 5.1 Create Payment Order
**Endpoint:** `POST /api/company/payments/create-order`

**Description:** Create a Razorpay payment order for subscription.

**Authentication:** Required (Company JWT token)

**Request Body:**
```json
{
  "planId": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "order": {
    "id": "string",
    "amount": "number",
    "currency": "INR"
  },
  "paymentId": "string",
  "key": "string"
}
```

**Error Responses:**
- 401: Access denied
- 404: Plan not found
- 500: Internal server error

### 5.2 Verify Payment
**Endpoint:** `POST /api/company/payments/verify`

**Description:** Verify and complete a payment transaction.

**Authentication:** Required (Company JWT token)

**Request Body:**
```json
{
  "razorpay_order_id": "string",
  "razorpay_payment_id": "string",
  "razorpay_signature": "string",
  "paymentId": "string",
  "planId": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment verified and subscription activated",
  "subscription": {
    "id": "string",
    "planId": "string",
    "status": "active",
    "startDate": "date",
    "endDate": "date"
  },
  "payment": {
    "id": "string",
    "status": "completed"
  }
}
```

**Error Responses:**
- 401: Access denied
- 400: Payment verification failed
- 404: Payment record not found
- 500: Internal server error

### 5.3 Razorpay Webhook
**Endpoint:** `POST /api/company/payments/webhook`

**Description:** Handle Razorpay webhook events.

**Authentication:** None (Webhook signature verification)

**Headers:**
- X-Razorpay-Signature: Webhook signature

**Response (200):**
```json
{
  "status": "ok"
}
```

**Error Responses:**
- 400: Invalid signature
- 500: Internal server error

### 5.4 Get Company Subscription
**Endpoint:** `GET /api/company/payments/subscription`

**Description:** Get the current active subscription for the company.

**Authentication:** Required (Company JWT token)

**Response (200):**
```json
{
  "success": true,
  "subscription": {
    "id": "string",
    "planId": {
      "name": "string",
      "price": "number",
      "features": {
        // Plan features
      }
    },
    "status": "active",
    "startDate": "date",
    "endDate": "date",
    "lastPaymentDate": "date",
    "nextBillingDate": "date"
  }
}
```

**Error Responses:**
- 401: Access denied
- 404: No active subscription found
- 500: Internal server error

## Error Codes Summary

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Data Types

- **string**: Text data
- **number**: Numeric data
- **boolean**: True/false values
- **date**: ISO 8601 date string
- **object**: JSON object
- **array**: JSON array

## Notes

1. All company endpoints require JWT authentication with company token
2. File uploads use multipart/form-data encoding
3. Payment integration uses Razorpay
4. Subscription limits apply to job postings
5. Company must be approved by super admin before login
6. Onboarding is required before accessing most features
