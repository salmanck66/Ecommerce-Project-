const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true,
    unique: true
  },
  couponDescription: {
    type: String,
    required: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixedAmount'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  startingDate: {
    type: Date,
    required: true
  },
}
);

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;