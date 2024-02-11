const mongoose = require('mongoose');

const SubCategorySchema = new mongoose.Schema({
    subCategoryName: { type: String, required: true },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }
}, { versionKey: false });

const SubCategory=mongoose.model('SubCategory',SubCategorySchema,'SubCategory');
module.exports=SubCategory;