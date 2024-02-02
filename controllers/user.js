let homePage = (req, res) => {
    console.log("User home");
    res.render('user/index')
  }
let contact = (req, res) => {
    console.log("contact");
    res.render('user/contact', { layout: 'layout' });
  }
let about = (req, res) => {
    console.log("contact");
    res.render('user/about')
  }
let product = (req, res) => {
    console.log("produuct");
    res.render('user/product')
  }
let productdetail = (req, res) => {
    console.log("produuct");
    res.render('user/product-detail')
  }
  module.exports = {homePage,contact,about,product,productdetail}