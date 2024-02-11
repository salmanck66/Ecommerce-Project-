const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    imageUrl: String,
});

const Category = mongoose.model('Category', categorySchema,'Category');
module.exports = Category;