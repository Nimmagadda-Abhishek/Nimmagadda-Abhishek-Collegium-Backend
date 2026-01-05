const mongoose = require('mongoose');

const companyPaymentSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompanySubscription',
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'INR',
    },
    paymentMethod: {
        type: String,
        enum: ['razorpay', 'manual'],
        default: 'razorpay',
    },
    gatewayOrderId: {
        type: String,
    },
    gatewayPaymentId: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: {
        type: Date,
    },
    metaData: {
        type: Map,
        of: String
    }
});

module.exports = mongoose.model('CompanyPayment', companyPaymentSchema);
