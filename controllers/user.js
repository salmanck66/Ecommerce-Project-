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
let signin = (req, res) => {
    console.log("login");
    res.render('user/login',{layout:false})
  }
let signup = (req, res) => {
    console.log("signup");
    res.render('user/signup',{layout:false})
  }
let forgetpass = (req, res) => {
    console.log("forgetpass");
    res.render('user/forget',{layout:false})
  }
let invoice = (req, res) => {
    console.log("invoice");
    res.render('user/invoice')
  }
  module.exports = {homePage,contact,about,product,productdetail,cart,help,wishlist,userprofile,checkout,ordercomplete,signin,signup,forgetpass,invoice}