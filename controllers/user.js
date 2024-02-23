const { signUser, verifyUser } = require("../middleware/jwt");
const  Userhelpers = require("../helpers/userhelper");
const { default: mongoose } = require("mongoose");
const Product = require("../models/product");
const Category = require("../models/category");
const Banner = require("../models/banner");
const Cart = require("../models/cart");
const { session } = require("passport");

let loginGetPage = async (req, res) => {
  console.log("User login page");
  try {
    if (req.cookies.jwt) {
      let tokenExracted = await verifyUser(req.cookies.jwt);
      if (tokenExracted.role === "user") {
        return res.redirect("/");
      }
    }
    res.render("user/login", { layout: false }); // Assuming layout is set to false for login page
  } catch (error) {
    console.error("Error retrieving user from JWT:", error);
    res.render("error", { print: error });
  }
};

let logoutPage = (req, res) => {
  if (req.session) {
    req.session.destroy();
    console.log("session and cookies are cleared");
  }
  res.clearCookie("jwt");
  res.redirect("/");
};

let ResetPassword = (req, res) => {
  res.render("user/forget", { layout: false });
};

let signUpPostPage = async (req, res) => {
  try {
    console.log("entered user registration section");
    // console.log(req.body);

    let resolved = await Userhelpers.signupHelper(req.body);
    if (resolved.mailExist) {
      console.log("mail already exist");
      res
        .status(200)
        .render("user/signup", {
          layout: false,
          mailError: "Email Already Exists",
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          mail: req.body.mail,
          phoneNumber: req.body.phoneNumber,
          password: req.body.password,
          confirmPassword: req.body.confirmPassword,
        });
    } else {
      console.log(
        resolved.user,
        "user registration completed and stored in database"
      );
      return res.redirect("/login?registered=true");
    }
  } catch (error) {
    res.render("error", { print: error });
  }
};

let loginPostPage = async (req, res) => {
  try {
    console.log("entered in login post section");

    let resolved = await  Userhelpers.loginHelper(req.body);
    if (resolved.invalidUsername) {
      console.log("invalid user name");
      return res.render("user/login", {
        mailError: "invalid user Mail",
        mail: req.body.mail,
        password: req.body.password,
      });
    } else if (resolved.passwordMismatch) {
      console.log("password not match");
      return res.render("user/login", {
        passwordError: "Wrong Password",
        password: req.body.password,
        mail: req.body.mail,
      });
    } else if (resolved.blockedUser) {
      return res.render("user/login", {
        mailError: "This user has been temporarily BLOCKED",
        password: req.body.password,
        mail: req.body.mail,
      });
    } else {
      if (resolved.verified) {
        console.log("user verified and login success");
        const token = await signUser(resolved.existingUser);
        //  console.log("got the created token from auth and added this token on user rqst");
        res.cookie("jwt", token, { httpOnly: true, maxAge: 7200000 }); //1= COOKIE NAME AND  2 =DATA 3=OPTIONAL
        return res.redirect("/");
        // return res.redirect(`/?token= ${token}`)
        // return res.redirect('/?userName=' +resolved.existingUser.userName )
      }
    }
  } catch (error) {
    res.render("error", { print: error });
  }
};

let homePage = async (req, res) => {
  console.log("Home page");

  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
    var userName = tokenExracted.userName;
    console.log(userName);
  }
  if (userName) {
    console.log("Having User");
    const products = await Product.find();
    const category = await Category.find();
    const banner = await Banner.find();
    return res.render("user/index", {
      userName,
      category,
      banner,
      user: true,
      home: true,
      data: products,
    });
  } else {
    const products = await Product.find();
    const category = await Category.find();
    const banner = await Banner.find();
    res.render("user/index", { data: products, category, banner });
  }
};

let payment = (req, res) => {
  console.log("home");
  res.render("user/payments");
};

let contact = (req, res) => {
  console.log("contact");
  res.render("user/contact", { layout: "layout" });
};
let about = (req, res) => {
  console.log("about");
  res.render("user/about");
};
let product = (req, res) => {
  console.log("product");
  res.render("user/product");
};
let productdetail = async (req, res) => {
  try {
    const id = req.query.id
  
    const productsss = await Product.findById(id); // Adding await here to wait for the query to complete
    console.log(productsss)
    res.render("user/product-detail", { layout: "layout.hbs" ,productsss}); // Adding await here as well

  } catch (error) {
    console.log(error);
  }
};
let cart = (req, res) => {
  console.log("cart");
  res.render("user/cart");
};

let addtocart = async (req, res) => {
  try {
    let tokenExracted = await verifyUser(req.cookies.jwt)
    console.log(tokenExracted.userId);
    // Check if user is authenticated
    if (!tokenExracted.userId) {
      return res.status(401).redirect("/login",{ error: 'User not authenticated' });
    }
    console.log(req.body);
    const {size,prdid,qty} = req.body
    

    const productId =prdid
    console.log(productId);
    
    const userId = tokenExracted.userId // Assuming user ID is available in the JWT payload
    console.log(userId);
    // Check if the product exists
    const product = await Product.findById(productId);
    console.log("Product Exist");
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Add the product to the user's cart
    let cart = await Cart.findOne({ user: userId });
    console.log(cart);
    console.log("found cart");
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if the product is already in the cart
    const existingItem = cart.items.find(item => item.product.equals(productId) && item.size === size);
    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.items.push({ product: productId, quantity: qty ,size :size});
    }

    await cart.save();
  //   res.status(201).json({ message: 'Product added to cart successfully' });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

let viewcart = async (req, res) => {
  try {
    // Extract the user ID from the JWT token
    const tokenExtracted = await verifyUser(req.cookies.jwt);
    const userId = tokenExtracted.userId;

    // Find the user's cart based on the user ID
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Send the cart as a response
    res.status(200).json({ cart });
  } catch (error) {
    console.error('Error viewing cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



let help = (req, res) => {
  console.log("help");
  res.render("user/help");
};
let wishlist = (req, res) => {
  console.log("produuct");
  res.render("user/wishlist");
};
let userprofile = (req, res) => {
  console.log("userprofile");
  res.render("user/userprofile");
};
let checkout = (req, res) => {
  console.log("checkout");
  res.render("user/checkout");
};
let ordercomplete = (req, res) => {
  console.log("ordercomplete");
  res.render("user/ordercomplete");
};

// let signin = (req, res) => {
//     console.log("login");
//     res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
//     res.render('user/login',{layout:false})
//   }

let signup = (req, res) => {
  console.log("signup");
  res.render("user/signup", { layout: false });
};
let forgetpass = (req, res) => {
  console.log("forgetpass");
  res.render("user/forget", { layout: false });
};
let invoice = (req, res) => {
  console.log("invoice");
  res.render("user/invoice");
};
module.exports = {
  payment,
  ResetPassword,
  homePage,
  contact,
  about,
  product,
  productdetail,
  cart,
  help,
  wishlist,
  userprofile,
  checkout,
  ordercomplete,
  signup,
  forgetpass,
  invoice,
  signUpPostPage,
  loginPostPage,
  loginGetPage,
  logoutPage,
  addtocart,
  viewcart
};
