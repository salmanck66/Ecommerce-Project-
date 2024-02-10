const cloudinary = require('../utils/cloudinery');
const Category = require('../models/category')
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
let categories = (req, res) => {
    console.log("admin categories management");
    res.render('admin/category',{layout:"adminLayout.hbs"})
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

    res.status(201).send('Category added successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {postcategory,postaddproduct,homePage,logIn,Forget,order,productm,addproduct,coupon,categories,banner,payments,settings,profile}