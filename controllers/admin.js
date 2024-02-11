const cloudinary = require('../utils/cloudinery');
const Category = require('../models/category')
const SubCategory = require('../models/subcategory')

const mongoose = require('mongoose');

let homePage = (req, res) => {
    console.log("admin dashbord page");
    res.render('admin/index',{layout:"adminLayout.hbs"})
  }

let logIn = (req, res) => {
    console.log("admin login page");
    res.render('admin/login',{layout:false})
  }
let Forget = (req, res) => {
    console.log("admin forget page");
    res.render('admin/forget',{layout:false})
  }
let order = (req, res) => {
    console.log("admin order management");
    res.render('admin/order',{layout:"adminLayout.hbs"})
  }
let productm = (req, res) => {
    console.log("admin product management");
    res.render('admin/productm',{layout:"adminLayout.hbs"})
  }
let addproduct = (req, res) => {
    console.log("admin product management");
    res.render('admin/addproduct',{layout:"adminLayout.hbs"})
  }
let coupon = (req, res) => {
    console.log("admin coupn management");
    res.render('admin/coupons',{layout:"adminLayout.hbs"})
  }
let categories = async (req, res) => {
    const categories  = await Category.find()
    console.log("admin categories management");
    res.status(200).render('admin/category',{data:categories,layout:"adminLayout.hbs"})
  }
let banner = (req, res) => {
    console.log("admin banner management");
    res.render('admin/banner',{layout:"adminLayout.hbs"})
  }
let payments = (req, res) => {
    console.log("admin banner management");
    res.render('admin/payments',{layout:"adminLayout.hbs"})
  }
let settings = (req, res) => {
    console.log("admin banner management");
    res.render('admin/settings',{layout:"adminLayout.hbs"})
  }
let profile = (req, res) => {
    console.log("admin banner management");
    res.render('admin/profile',{layout:"adminLayout.hbs"})
  }

let postaddproduct = (req,res)=>
{
  res.json(req.body)
}
let postcategory = async (req, res) => {
  try {
    console.log("entered post category");
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    console.log("got image");

    // Create new category with image URL
    const newCategory = new Category({
      _id: new mongoose.Types.ObjectId(), // Set a new ObjectId for _id
      name: req.body.categoryName,
      imageUrl: result.secure_url // URL of the uploaded image on Cloudinary
    });

    // Save new category to the database
    await newCategory.save();

    res.status(201).redirect('/category');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
let deletecat = async (req, res) => {
  try {
      const categoryId = req.params.id;

      // Find category by ID and delete it
      const deletedCategory = await Category.findByIdAndDelete(categoryId);

      if (!deletedCategory) {
          return res.status(404).json({ message: 'Category not found' });
      }

      res.json({ message: 'Category deleted successfully', deletedCategory });
  } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
}

let updatecat = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { updateCategoryName, updateCategoryImage } = req.body; // Destructure the updated category name and image from the request body

    // If there's no category name provided, return an error
    if (!updateCategoryName) {
      return res.status(400).json({ message: 'Category name is required for update' });
    }

    let imageUrl; // Variable to store the updated image URL

    // Check if there's an updated image sent from the client
    if (updateCategoryImage) {
      // Upload the updated image to Cloudinary
      const result = await cloudinary.uploader.upload(updateCategoryImage.path);
      imageUrl = result.secure_url; // Store the secure URL of the uploaded image
    }

    // Prepare the update data based on whether there's an updated image or not
    const updateData = { name: updateCategoryName };
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    // Find the category by ID and update it with the new data
    const updatedCategory = await Category.findByIdAndUpdate(categoryId, updateData, { new: true });

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category updated successfully', updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

let addSubcategory = async (req, res) => {
  try {
    const newSubCategory = new SubCategory({
      subCategoryName: req.body.subCategoryName,
      parentCategory:req.body.parentCategory
    });
    await newSubCategory.save();
    res.status(201).redirect('/category'); // Redirect to the appropriate route
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}



module.exports = {addSubcategory,deletecat,postcategory,postaddproduct,homePage,logIn,Forget,order,productm,addproduct,coupon,categories,banner,payments,settings,profile,updatecat}