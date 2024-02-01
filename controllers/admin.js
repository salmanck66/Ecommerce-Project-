let homePage = (req, res) => {
    console.log("admin dashbord page");
    res.render('admin/index')
  }

let logIn = (req, res) => {
    console.log("admin login page");
    res.render('admin/login')
  }
let Forget = (req, res) => {
    console.log("admin forget page");
    res.render('admin/forget')
  }

  module.exports = {homePage,logIn,Forget}