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

  module.exports = {homePage,logIn,Forget,order,productm}