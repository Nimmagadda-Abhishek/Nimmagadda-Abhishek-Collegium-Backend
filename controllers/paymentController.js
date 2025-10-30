const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const UserSubscription = require('../models/UserSubscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');

// ====================
// 🔧 Razorpay Configuration
// ====================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ====================
// 💰 Create Payment Order
// ====================
const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { planId, isTrial = false } = req.body;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const amount = isTrial ? plan.trialPrice : plan.price;
    const amountInPaise = amount * 100; // Razorpay expects amount in paise

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${userId}_${Date.now()}`,
      payment_capture: 1, // Auto capture
    };

    const order = await razorpay.orders.create(options);

    // Create payment record
    const payment = new Payment({
      userId,
      subscriptionId: null, // Will be updated after subscription creation
      amount,
      paymentMethod: 'razorpay',
      gatewayOrderId: order.id,
      status: 'pending',
    });

    await payment.save();

    res.status(200).json({
      success: true,
      order,
      paymentId: payment._id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// ✅ Verify Payment
// ====================
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId, planId, isTrial = false } = req.body;
    const userId = req.user.userId;

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
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    payment.status = 'completed';
    payment.gatewayPaymentId = razorpay_payment_id;
    payment.completedAt = new Date();
    await payment.save();

    // Create or update subscription
    let subscription;
    if (isTrial) {
      // For trial conversion
      subscription = await UserSubscription.findOne({ userId, status: 'trial' });
      if (subscription) {
        subscription.status = 'active';
        let endDate = new Date();
        const plan = await SubscriptionPlan.findById(planId);
        if (plan.period === 'month') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }
        subscription.endDate = endDate;
        subscription.updatedAt = new Date();
        await subscription.save();
      }
    } else {
      // New subscription
      const plan = await SubscriptionPlan.findById(planId);
      const startDate = new Date();
      let endDate = new Date(startDate);
      if (plan.period === 'month') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      subscription = new UserSubscription({
        userId,
        planId,
        status: 'active',
        startDate,
        endDate,
        paymentMethod: 'razorpay',
        lastPaymentDate: new Date(),
        nextBillingDate: endDate,
      });

      await subscription.save();
    }

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
    console.error('❌ Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};

// ====================
// 🪝 Handle Razorpay Webhook
// ====================
const handleWebhook = async (req, res) => {
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
      const payment = await Payment.findOne({ gatewayPaymentId: paymentEntity.id });
      if (payment && payment.status !== 'completed') {
        payment.status = 'completed';
        payment.completedAt = new Date();
        await payment.save();

        // Update subscription status if needed
        if (payment.subscriptionId) {
          await UserSubscription.findByIdAndUpdate(payment.subscriptionId, {
            status: 'active',
            lastPaymentDate: new Date(),
          });
        }
      }
    } else if (event === 'payment.failed') {
      // Payment failed
      const payment = await Payment.findOne({ gatewayOrderId: paymentEntity.order_id });
      if (payment) {
        payment.status = 'failed';
        await payment.save();
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('❌ Webhook error:', error);
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
  createOrder,
  verifyPayment,
  handleWebhook,
};
