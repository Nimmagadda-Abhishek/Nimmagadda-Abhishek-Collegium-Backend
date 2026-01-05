const Razorpay = require('razorpay');
const crypto = require('crypto');
const CompanyPayment = require('../models/CompanyPayment');
const CompanySubscription = require('../models/CompanySubscription');
const CompanySubscriptionPlan = require('../models/CompanySubscriptionPlan');

// ====================
// 🔧 Razorpay Configuration
// ====================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ====================
// 💰 Create Payment Order for Company
// ====================
// ====================
// 💰 Create Payment Order for Company
// ====================
const createCompanyOrder = async (req, res) => {
  try {
    const companyId = req.company.companyId;
    const { planId } = req.body;

    console.log(`[CreateOrder] Company: ${companyId}, Plan: ${planId}`);

    const plan = await CompanySubscriptionPlan.findById(planId);
    if (!plan) {
      console.log(`[CreateOrder] Plan not found: ${planId}`);
      return res.status(404).json({ error: 'Plan not found' });
    }

    const amount = plan.price;
    const amountInPaise = amount * 100; // Razorpay expects amount in paise

    console.log(`[CreateOrder] Creating Razorpay order for amount: ${amountInPaise}`);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${companyId.toString().slice(-8)}_${Date.now().toString().slice(-8)}`,
      payment_capture: 1, // Auto capture
    };

    const order = await razorpay.orders.create(options);
    console.log(`[CreateOrder] Razorpay order created: ${order.id}`);

    // Create payment record
    const payment = new CompanyPayment({
      companyId,
      subscriptionId: null, // Will be updated after subscription creation
      amount,
      paymentMethod: 'razorpay',
      gatewayOrderId: order.id,
      status: 'pending',
    });

    await payment.save();
    console.log(`[CreateOrder] Payment record saved: ${payment._id}`);

    res.status(200).json({
      success: true,
      order,
      paymentId: payment._id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('❌ Create company order error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// ✅ Verify Company Payment
// ====================
const verifyCompanyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId, planId } = req.body;
    const companyId = req.company.companyId;

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Update payment status
    const payment = await CompanyPayment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    payment.status = 'completed';
    payment.gatewayPaymentId = razorpay_payment_id;
    payment.completedAt = new Date();
    await payment.save();

    // Create subscription
    const plan = await CompanySubscriptionPlan.findById(planId);
    const startDate = new Date();
    let endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // Monthly subscription

    const subscription = new CompanySubscription({
      companyId,
      planId,
      status: 'active',
      startDate,
      endDate,
      paymentMethod: 'razorpay',
      lastPaymentDate: new Date(),
      nextBillingDate: endDate,
    });

    await subscription.save();

    // Update payment with subscription ID
    payment.subscriptionId = subscription._id;
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified and subscription activated',
      subscription,
      payment,
    });
  } catch (error) {
    console.error('❌ Verify company payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// 🪝 Handle Company Razorpay Webhook
// ====================
const handleCompanyWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;

    if (event === 'payment.captured') {
      // Payment was successfully captured
      const payment = await CompanyPayment.findOne({ gatewayPaymentId: paymentEntity.id });
      if (payment && payment.status !== 'completed') {
        payment.status = 'completed';
        payment.completedAt = new Date();
        await payment.save();

        // Update subscription status if needed
        if (payment.subscriptionId) {
          await CompanySubscription.findByIdAndUpdate(payment.subscriptionId, {
            status: 'active',
            lastPaymentDate: new Date(),
          });
        }
      }
    } else if (event === 'payment.failed') {
      // Payment failed
      const payment = await CompanyPayment.findOne({ gatewayOrderId: paymentEntity.order_id });
      if (payment) {
        payment.status = 'failed';
        await payment.save();
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('❌ Company webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// 📊 Get Company Subscription Status
// ====================
const getCompanySubscription = async (req, res) => {
  try {
    const companyId = req.company.companyId;

    const subscription = await CompanySubscription.findOne({ companyId, status: 'active' })
      .populate('planId')
      .sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error('❌ Get company subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// 🚀 Export
// ====================
module.exports = {
  createCompanyOrder,
  verifyCompanyPayment,
  handleCompanyWebhook,
  getCompanySubscription,
};
