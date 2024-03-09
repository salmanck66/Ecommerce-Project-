const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        size: String
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        firstName: String,
        lastName: String,
        email: String,
        address: String,
        address2: String,
        state: String,
        zip: String
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Online'], // Add other payment methods as needed
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
});

// Create the Order model
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;