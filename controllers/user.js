let homePage = (req, res) => {
    console.log("home");
    res.render('user/index')
  }
let contact = (req, res) => {
    console.log("contact");
    res.render('user/contact', { layout: 'layout' });
  }
let about = (req, res) => {
    console.log("about");
    res.render('user/about')
  }
let product = (req, res) => {
    console.log("product");
    res.render('user/product')
  }
let productdetail = (req, res) => {
    console.log("product-detail");
    res.render('user/product-detail')
  }
let cart = (req, res) => {
    console.log("cart");
    res.render('user/cart')
  }
let help = (req, res) => {
    console.log("help");
    res.render('user/help')
  }
let wishlist = (req, res) => {
    console.log("produuct");
    res.render('user/wishlist')
  }
let userprofile = (req, res) => {
    console.log("userprofile");
    res.render('user/userprofile')
  }
let checkout = (req, res) => {
    console.log("checkout");
    res.render('user/checkout')
  }
let ordercomplete = (req, res) => {
    console.log("ordercomplete");
    res.render('user/ordercomplete')
  }
  module.exports = {homePage,contact,about,product,productdetail,cart,help,wishlist,userprofile,checkout,ordercomplete}