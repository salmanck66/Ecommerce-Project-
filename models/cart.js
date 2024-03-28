const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  quantity: {
    type: Number,
    default: 1
  },
  size: {
    type: String
  },
});

const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  items: [cartItemSchema],
  carttotal:
  {
    type: Number,
    default: 0
  },
  discount:{
        type: Number,
    default: 0
  }
});

cartSchema.methods.clearCart = function() {
  this.items = [];
  this.carttotal = 0;
  this.discount = 0;
  return this.save();
};


module.exports = mongoose.model('Cart', cartSchema);
