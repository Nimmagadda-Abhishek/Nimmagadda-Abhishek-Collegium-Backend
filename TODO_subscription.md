# TODO: Implement Subscription System with Razorpay Integration

## ✅ Completed Steps

### Step 1: Install Razorpay Package
- ✅ Run `npm install razorpay` to add Razorpay SDK for payment processing.

### Step 2: Create Models
- ✅ Create `models/SubscriptionPlan.js` with schema for subscription plans (name, price, period, features, limits, trial details).
- ✅ Create `models/UserSubscription.js` with schema for user subscriptions (userId, planId, status, dates, autoRenew, etc.).
- ✅ Create `models/Payment.js` with schema for payments (userId, subscriptionId, amount, status, gateway IDs, etc.).

### Step 3: Create Controllers
- ✅ Create `controllers/subscriptionController.js` with functions for:
  - CRUD operations for plans (getPlans, createPlan, updatePlan, deletePlan).
  - User subscription management (getUserSubscription, subscribe, cancelSubscription, getSubscriptionHistory).
  - Trial management (startTrial, getTrialStatus, convertTrial).
- ✅ Create `controllers/paymentController.js` with functions for:
  - createOrder (Razorpay order creation).
  - verifyPayment (payment verification).
  - handleWebhook (webhook for payment confirmations).

### Step 4: Create Routes
- ✅ Create `routes/subscriptions.js` with endpoints:
  - GET /plans - List all plans.
  - POST /plans - Create plan (admin).
  - PUT /plans/:id - Update plan (admin).
  - DELETE /plans/:id - Delete plan (admin).
  - GET /user - Get user's subscription.
  - POST /subscribe - Subscribe to plan.
  - PUT /cancel - Cancel subscription.
  - GET /history - Get subscription history.
  - POST /trials/start - Start trial.
  - GET /trials/status - Get trial status.
  - POST /trials/convert - Convert trial to paid.
- ✅ Create `routes/payments.js` with endpoints:
  - POST /create-order - Create payment order.
  - POST /verify - Verify payment.
  - POST /webhook - Handle webhooks.

### Step 5: Update Main Application
- ✅ Update `index.js` to import and use new routes (/api/subscriptions, /api/payments).
- ✅ Update health check endpoint with new routes.

## 🔄 Remaining Steps

### Step 6: Implement Business Logic
- Add logic for trial expiration, subscription renewal, payment failures.
- Ensure authentication middleware (verifyToken) is used for protected routes.
- Add input validation and error handling.

### Step 7: Testing and Validation
- Test endpoints for creating plans, subscribing, payment processing.
- Verify Razorpay integration (order creation, verification).
- Check webhook handling for payment confirmations.

### Step 8: Additional Features
- Add background jobs for trial expiration and renewals (if needed).
- Implement notifications (emails for reminders, confirmations).
- Add audit logging for subscription changes.

### Step 9: Environment Variables
- Add Razorpay credentials to .env file:
  - RAZORPAY_KEY_ID
  - RAZORPAY_KEY_SECRET
  - RAZORPAY_WEBHOOK_SECRET

### Step 10: Seed Initial Data
- Create initial subscription plans (Free, Basic ₹199/month, Pro ₹499/month) via API or script.
