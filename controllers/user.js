let homePage = (req, res) => {
    console.log("User login page");
    res.render('user/index')
  }

let contact = (req, res) => {
    console.log("contact");
    res.render('user/contact')
  }
let about = (req, res) => {
    console.log("contact");
    res.render('user/contact')
  }
let product = (req, res) => {
    console.log("contact");
    res.render('user/product')
  }


  module.exports = {homePage,contact,about,product}