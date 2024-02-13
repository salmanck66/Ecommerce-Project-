const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    required: true,
    enum: ['home', 'away', 'third', 'fourth', 'specialEdition', 'gk']
  },
  mrp: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    S: {
      type: Number,
      default: 0
    },
    M: {
      type: Number,
      default: 0
    },
    L: {
      type: Number,
      default: 0
    },
    XL: {
      type: Number,
      default: 0
    },
    XXL: {
      type: Number,
      default: 0
    }
  },
  description: {
    type: String,
    required: true
  },
  richdescription: {
    type: String
  },
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String,
    required: true
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
