const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: false },
  mrp: { type: Number, required: false },
  price: { type: Number, required: false },
  description: { type: String, required: false },
  richdescription: { type: String, required: false },
  image: { type: String},
  category: { type: mongoose.Schema.Types.ObjectId,ref : 'Category'},
  countinstock: [{size : {type: String} , stock : {type: Number}}],
  variants: [{ name: String, productLink: String }]
});

module.exports = mongoose.model('Product', productSchema);