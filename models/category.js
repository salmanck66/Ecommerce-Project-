const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    image: String,
    subcategories: [subcategorySchema]
});

const subcategorySchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;