const { signUser, verifyUser } = require("../middleware/jwt");
const  Userhelpers = require("../helpers/userhelper");
const { default: mongoose } = require("mongoose");
const Product = require("../models/product");
const Category = require("../models/category");
const Banner = require("../models/banner");
const Cart = require("../models/cart");
const Coupon = require("../models/coupon");
const User = require("../models/users");
const Order = require("../models/order");
const Wishlist = require("../models/wishlist");
const Subscription = require("../models/subscription");
const { session } = require("passport");
const url = require('url');
const uuid = require('uuid');
const Visit = require('../models/visit');
const nodemailer = require('nodemailer');
const {parsed:config} = require('dotenv').config()
global.config = config
const razorpay = require('razorpay');




function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}
var otpDB = {};
var otpDBPhone = {};

let loginGetPage = async (req, res) => {
  console.log("User login page");
  try {
    if (req.cookies.jwt) {
      let tokenExracted = await verifyUser(req.cookies.jwt);
      if (tokenExracted) {
        return res.redirect("/");
      }
    }
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
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

let ResetPasswordPostFinal = async(req,res)=>{
  try {
    console.log("entered password change section");
    let resolved = await Userhelpers.changePasswordHelper(req.body);
    if (resolved.userNotFound) {
        console.log("Wrong  email or username entered!");
        res.status(200).json({ userNotFound: true }); // Send JSON response
    } else {
        console.log("Password changed successfully");
        res.status(200).json({ success: true }); // Send JSON response
    }
  } catch (error) {
    res.render("error", { print: error });
  }
};
let subscribe = async (req,res)=>
{
  const { email } = req.body;
  console.log(email);

  try {
    // Save the email to MongoDB
    const subscription = new Subscription({ email });
    await subscription.save();

    console.log('Email saved:', email);
    res.status(200).json({ message: 'Subscription successful' });
  } catch (err) {
    console.error('Error saving email:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

let verifyotp =async(req,res,email)=>{

  
  try {
  const otp = parseInt(req.body.otp)
  const storedOTP = otpDB[email]
  if (!storedOTP || storedOTP !== otp) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  // If OTP is valid, allow the user to reset their password
  res.status(200).json({ message: 'OTP verified successfully', email });
  } catch (error) {
    console.error('Error in VerifyOTP:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
let loginotp = async  (req, res) => {
  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt);
    if (tokenExracted) {
      return res.redirect("/");
    }
  }
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.render("user/loginotp",{layout:false})
}

let ResetPasswordPost = async(req,res,email)=>{
  
  const mail = req.body.email
  const otp = generateOTP();
  console.log(otp);

  // Store OTP in memory or database
  otpDB[email] = otp;

  // Send OTP to user's email
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.APP_SPECIFIC_PASSWORD // Use the generated app-specific password here
      }
  });

  const mailOptions = {
      from: process.env.EMAIL_USER,
      to: mail,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Error sending email:', error);
          res.status(500).json({ error: 'Failed to send OTP' });
      } else {
          console.log('Email sent:', info.response);
          res.status(200).json({ message: 'OTP sent successfully' });
      }
  });
}

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
          mailError: "Email or phone number already exists",
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

    let resolved = await Userhelpers.loginHelper(req.body);
    if (resolved.invalidUsername) {
      console.log("invalid user name");
      return res.render("user/loginotp", {
        layout: false,
        mailError: "Mail id not registered",
        mail: req.body.mail,
        password: req.body.password,
      });
    } else if (resolved.passwordMismatch) {
      console.log("password not match");
      return res.render("user/loginotp", {
        layout: false,
        passwordError: "Wrong Password",
        password: req.body.password,
        mail: req.body.mail,
      });
    } else if (resolved.blockedUser) {
      return res.render("user/loginotp", {
        layout: false,
        mailError: "This user has been temporarily BLOCKED",
        password: req.body.password,
        mail: req.body.mail,
      });
    } else if(resolved.admin){
      return res.render("user/loginotp", {
        layout: false,
        mailError: "Restricted entry",
        password: req.body.password,
        mail: req.body.mail,
      });
    }
    else {
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
  try {
    console.log("Home page");
    await Visit.findOneAndUpdate({}, { $inc: { count: 1 } }, { upsert: true });

    let userName, userId;
    if (req.cookies.jwt) {
      let tokenExtracted = await verifyUser(req.cookies.jwt);
      userName = tokenExtracted.userName;
      userId = tokenExtracted.userId;
    }

    // Fetch top 20 products sorted by salecount
    const products = await Product.aggregate([
      { $sort: { salecount: -1 } },
      { $limit: 20 }
    ]);

    // Fetch categories and banners
    const category = await Category.find();
    const banner = await Banner.find();
    
    let itemsLength = 0;
    let wishItemsLength = 0;
    let wishlistedProductIds = [];

    if (userId) {
      // Fetch user's cart and wishlist
      const cartd = await Cart.findOne({ user: userId });
      const wishlistd = await Wishlist.findOne({ user: userId });

      if (cartd && cartd.items) {
        itemsLength = cartd.items.length;
      }

      if (wishlistd && wishlistd.products) {
        wishItemsLength = wishlistd.products.length;
        wishlistedProductIds = wishlistd.products.map(p => p.toString()); // Convert ObjectId to string
      }
    }

    // Add `isWishlisted` flag to each product
    products.forEach(product => {
      product.isWishlisted = wishlistedProductIds.includes(product._id.toString());
    });

    // Render the homepage with the necessary data
    res.render("user/index", {
      cartln: itemsLength,
      wishln: wishItemsLength,
      userId,
      userName,
      category,
      banner,
      user: !!userName,
      home: true,
      data: products,
    });

  } catch (error) {
    console.error('Error loading home page:', error);
    res.status(500).send('Internal Server Error');
  }
};




let payment =async (req, res) => {
  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
    var userName = tokenExracted.userName;
    console.log(userName);
  }
  console.log("home");
  res.render("user/payments",{userName});
};

// let contact = async (req, res) => {
//   if (req.cookies.jwt) {
//     let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
//     var userName = tokenExracted.userName;
//     var userId = tokenExracted.userId;
//     const cartd= await Cart.find({user:userId})
//     const wishlistd= await Wishlist.find({user:userId})
//     var itemsLength = cartd[0].items.length;
//     var WishitemsLength = wishlistd[0].products.length;
//   }

//   const category = await Category.find({})
//   console.log("contact");
//   res.render("user/contact", { userName,layout: "layout" ,category,cartln:itemsLength || 0,wishln:WishitemsLength || 0});
// };
let contact = async (req, res) => {
  try {
    let userName;
    let userId;
    let itemsLength = 0;
    let WishitemsLength = 0;

    if (req.cookies.jwt) {
      let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
      userName = tokenExracted.userName;
      userId = tokenExracted.userId;

      const cartd = await Cart.findOne({ user: userId });
      const wishlistd = await Wishlist.findOne({ user: userId });

      if (cartd) {
        itemsLength = cartd.items.length;
      }
      if (wishlistd) {
        WishitemsLength = wishlistd.products.length;
      }
    }

    const category = await Category.find({});
    console.log("contact");
    res.render("user/contact", { userName, layout: "layout", category, cartln: itemsLength || 0, wishln: WishitemsLength || 0 });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

// let about =async (req, res) => {
//   if (req.cookies.jwt) {
//     let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
//     var userName = tokenExracted.userName;
//     console.log(userName);
//     var userId = tokenExracted.userId;
// const cartd= await Cart.find({user:userId})
// const wishlistd= await Wishlist.find({user:userId})
// var itemsLength = cartd[0].items.length;
// var WishitemsLength = wishlistd[0].products.length;
//   }
//   console.log("about");
//   const category = await Category.find({})
//   res.render("user/about",{userName,category,cartln:itemsLength || 0,wishln:WishitemsLength || 0});
// };

let about = async (req, res) => {
  try {
    let userName;
    let userId;
    let itemsLength = 0;
    let WishitemsLength = 0;

    if (req.cookies.jwt) {
      let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
      userName = tokenExracted.userName;
      userId = tokenExracted.userId;

      const cartd = await Cart.findOne({ user: userId });
      const wishlistd = await Wishlist.findOne({ user: userId });

      if (cartd) {
        itemsLength = cartd.items.length;
      }
      if (wishlistd) {
        WishitemsLength = wishlistd.products.length;
      }
    }

    console.log("about");
    const category = await Category.find({});
    res.render("user/about", { userName, category, cartln: itemsLength || 0, wishln: WishitemsLength || 0 });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};



// let product =async (req, res) => {
//   if (req.cookies.jwt) {
//     let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
//     var userName = tokenExracted.userName;
//     var userId = tokenExracted.userId;
// const cartd= await Cart.find({user:userId})
// const wishlistd= await Wishlist.find({user:userId})
// var itemsLength = cartd[0].items.length;
// var WishitemsLength = wishlistd[0].products.length;
//     console.log(userId);
//   }
//   console.log("product page");
//   const category = await Category.find({})
//   const product = await Product.find({})
//   res.render("user/product",{userName,category,product,userId,cartln:itemsLength || 0,wishln:WishitemsLength || 0
//   });
// };

const product = async (req, res) => {
  try {
    let userName = '';
    let userId = '';
    let itemsLength = 0;
    let wishItemsLength = 0;

    if (req.cookies.jwt) {
      const tokenExtracted = await verifyUser(req.cookies.jwt); // Verifying the JWT token to extract user details
      userName = tokenExtracted.userName;
      userId = tokenExtracted.userId;

      const cartData = await Cart.findOne({ user: userId });
      const wishlistData = await Wishlist.findOne({ user: userId });

      if (cartData) {
        itemsLength = cartData.items.length;
      }
      if (wishlistData) {
        wishItemsLength = wishlistData.products.length;
      }
    }

    console.log("Rendering product page");
    const categories = await Category.find({});
    const products = await Product.find({});

    res.render("user/product", {
      userName,
      userId,
      category:categories,
      products,
      cartLength: itemsLength,
      wishLength: wishItemsLength,
    });
  } catch (error) {
    console.error("Error rendering product page:", error);
    res.status(500).send("Internal Server Error");
  }
};




// let productdetail = async (req, res) => {
//   try {
//     const id = req.query.id
//     if (req.cookies.jwt) {
//       let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
//       var userName = tokenExracted.userName;
//       var userId = tokenExracted.userId;
// const cartd= await Cart.find({user:userId})
// const wishlistd= await Wishlist.find({user:userId})
// var itemsLength = cartd[0].items.length;
// var WishitemsLength = wishlistd[0].products.length;
//       console.log(userName);

//     }
//     let cart = await  Cart.findOne({ user:userId });
//     const productsss = await Product.findById(id);

//     if(userName)
//     {
//       cart.items.forEach(element => {
//         if(productsss._id.equals(element.product._id))
//         {
//           productsss.stock[element.size] -=element.quantity
//         }
//       })
//     }

//     let category = await Category.find({})

//     const related = await Product.find({ category: productsss.category, _id: { $ne: id } }); // Excluding the currently viewed product from related

//     res.render("user/product-detail", {category, layout: "layout.hbs", productsss, userName, userId, related,cartln:itemsLength || 0,wishln:WishitemsLength || 0 });

//   } catch (error) {
//     console.log(error); 
//   }
// };
let productdetail = async (req, res) => {
  try {
    const id = req.query.id;
    let userName;
    let userId;
    let itemsLength = 0;
    let WishitemsLength = 0;

    if (req.cookies.jwt) {
      let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
      userName = tokenExracted.userName;
      userId = tokenExracted.userId;
      console.log(userName);

      const cartd = await Cart.findOne({ user: userId });
      const wishlistd = await Wishlist.findOne({ user: userId });

      if (cartd) {
        itemsLength = cartd.items.length;
      }
      if (wishlistd) {
        WishitemsLength = wishlistd.products.length;
      }
    }

    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
      const productsss = await Product.findById(id);

      if (cart && userName) {
        cart.items.forEach(element => {
          if (productsss._id.equals(element.product._id)) {
            productsss.stock[element.size] -= element.quantity;
          }
        });
      }

      const category = await Category.find({});
      const related = await Product.find({ category: productsss.category, _id: { $ne: id } }); // Excluding the currently viewed product from related

      res.render("user/product-detail", { category, layout: "layout.hbs", productsss, userName, userId, related, cartln: itemsLength, wishln: WishitemsLength });
    } else {
      const category = await Category.find({});
      const productsss = await Product.findById(id);
      const related = await Product.find({ category: productsss.category, _id: { $ne: id } }); // Excluding the currently viewed product from related

      res.render("user/product-detail", { category, layout: "layout.hbs", productsss, userName, userId, related, cartln: itemsLength, wishln: WishitemsLength });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};


function calculateTotalPrice(cartItems) {
  let totalPrice = 0;
  for (const item of cartItems) {
      totalPrice += item.product.price * item.quantity;
  }
  return totalPrice;
}

let updatecart = async (req, res) => {
  try {
    let tokenExracted = await verifyUser(req.cookies.jwt)
    const userId = tokenExracted.userId; // Assuming you have a function to extract the user ID from the JWT token
    console.log(userId);

    const productId = req.body.productId;
    const newQuantity = req.body.quantity;
    const size = req.body.size;
    console.log(newQuantity);
    console.log(size);
    // Find the user's cart
    const cart = await Cart.findOne({ user: userId })

    // Find the index of the product in the cart items array
    const index = cart.items.findIndex(item => item.product.toString() === productId && item.size === size);

    // If the product is not found in the cart, handle accordingly
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found in the cart' });
    }

    if (newQuantity == 0) {
      // Remove the item from the cart
      cart.items.splice(index, 1);
    } else {
      // Update the quantity of the product in the cart
      cart.items[index].quantity = newQuantity;
    }

    // Calculate the new total price for the cart
    cart.totalPrice = calculateTotalPrice(cart.items);

   
    // Save the updated cart back to the database
    await cart.save();

    // Send back the updated total price
    res.json({ totalPrice: cart.totalPrice });

  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
let addtowishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Validate input
    if (!userId || !productId) {
      return res.status(400).json({ error: 'User ID or Product ID is missing in the request body' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if user and product exist
    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user's wishlist exists
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      // Create a new wishlist if none exists
      wishlist = new Wishlist({ user: userId, products: [] });
    }

    // Check if the product is already in the wishlist
    const isProductInWishlist = wishlist.products.includes(productId);

    if (isProductInWishlist) {
      // Remove product from wishlist
      wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
      await wishlist.save();
      res.status(200).json({ message: 'Product removed from wishlist successfully', icon: 'error' });
    } else {
      // Add product to wishlist
      wishlist.products.push(productId);
      await wishlist.save();
      res.status(200).json({ message: 'Product added to wishlist successfully', icon: 'success' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


let pcheckout = async (req, res) => {
  try {
    let tokenExracted = await verifyUser(req.cookies.jwt);
    const userId = tokenExracted.userId; // Assuming you have a function to extract the user ID from the JWT token
    console.log("post checkout");

    const { carttotal, discount } = req.body;
    console.log(carttotal,discount)
    await Cart.findOneAndUpdate(
      { user: userId },
      { carttotal: carttotal, discount: discount }
    );
    res.redirect("ordercomplete");
  } catch (error) {
    console.log(error);
  }
};


let fcheckout = async (req, res) => {
  try {
    // Verify user and get user ID
    let tokenExtracted = await verifyUser(req.cookies.jwt);
    const userId = tokenExtracted.userId;
    const orderNumber = await Userhelpers.getNextOrderNumber();
    console.log(req.body)


    // Get user's cart
    const cart = await Cart.findOne({ user: userId });
    console.log(cart.items.length);
    if(cart.items.length === 0){
        return res.redirect('/cart')
    }
      const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.APP_SPECIFIC_PASSWORD // Use the generated app-specific password here
      }
  });


    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender email address
      to: req.body.email, // Receiver email address (customer's email)
      subject: 'Order Confirmation', // Email subject
      text: `Your order has been successfully placed, Your Order ID Is ${orderNumber}. Thank you for shopping with us !` // Email body
    };

    transporter.sendMail(mailOptions); // Send the email

    // Send email to jcclubotp@gmail.com
    const adminMailOptions = {
      from: process.env.EMAIL_USER, // Sender email address
      to: 'jcclubotp@gmail.com', // Receiver email address (your email)
      subject: 'New Order Notification', // Email subject
      text: `A new order has been placed. ${orderNumber}` // Email body
    };

    transporter.sendMail(adminMailOptions); // Send the email to admin
    
    

    // Check and reduce stock of products
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product with ID ${item.product} not found.`);
      }
      const size = item.size;
      if (!product.stock[size] || product.stock[size] < item.quantity) {
        res.status(200).json("Product Has Gone Out of Stock");
        return res.redirect('cart')
      }
      // Deduct quantity from stock for the specific size
      product.stock[size] -= item.quantity;
      product.salecount +=item.quantity
      await product.save();
    }

    // Create a new order instance
    const newOrder = new Order({
      orderId: orderNumber,
      user: userId,
      items: cart.items,
      Discount:cart.discount,
      totalAmount: cart.carttotal,
      shippingAddress: {
        firstName: req.body.fname,
        lastName: req.body.lname,
        email: req.body.email,
        phonenumber: req.body.number, // Corrected field name here
        address: req.body.adress,
        address2: req.body.adress2,
        state: req.body.state,
        zip: req.body.zip
      },
      paymentMethod: req.body.paymentMethod
    });

    // await Cart.findOneAndDelete({ user: userId });

    // Save the new order to the database
    const savedOrder = await newOrder.save();

    // Save shipping address to user's profile if checkbox is checked
    if (req.body.saveadress) {
      const user = await User.findById(userId);
      user.addresses.push({
        firstName: req.body.fname,
        lastName: req.body.lname,
        email: req.body.email,
        address: req.body.adress,
        phonenumber: req.body.number, // Ensure req.body.number is correct
        address2: req.body.adress2,
        state: req.body.state,
        zip: req.body.zip
      });
      await user.save();
    }
    await cart.clearCart();
    // Clear the cart items or mark them as purchased
    // This step depends on your application's logic
    let tokenExracted = await verifyUser(req.cookies.jwt);
    const category = await Category.find()

    const wishlistd = await Wishlist.findOne({ user: userId });


    // Send a success response
    res.render('user/ordercomplete', {wishln:wishlistd.products.length  ,cartln:0,category,userId:tokenExracted.userId, message: 'Order completed successfully.', orderId: savedOrder.orderId });
  } catch (error) {
    console.log(error);
    // Send an error response
    res.status(500).json({ error: 'An error occurred while completing the order.' });
  }
};


let discount = async (req, res) => {
  try {
      const { couponCode, cartTotal } = req.body;
      

      // Check if the coupon code exists in the database
      const coupon = await Coupon.findOne({couponCode});
      console.log(coupon);

      if (!coupon) {
          return res.status(400).json({ success: false, message: 'Invalid coupon code' });
          
      }

      // Check if the coupon is expired
      if (coupon.expiryDate < Date.now()) {
          return res.status(400).json({ success: false, message: 'Coupon code has expired' });
      }

      // Apply discount to the cart total
      if(coupon.discountType==="percentage")
      {
      const discountedTotal = cartTotal - (cartTotal*(coupon.discountValue/100))
      console.log(discountedTotal)
      return res.status(200).json({ success: true, message: 'Coupon applied successfully', discountedTotal });
      }else
      {
        const discountedTotal = cartTotal -coupon.discountValue
        return res.status(200).json({ success: true, message: 'Coupon applied successfully', discountedTotal });
      }
      
  } catch (error) {
      console.error('Error applying coupon:', error);
      return res.status(500).json({ success: false, message: 'An error occurred while applying the coupon' });
  }
}


let addtocart = async (req, res) => {
  try {
    let tokenExracted = await verifyUser(req.cookies.jwt);
    console.log(tokenExracted.userId);
    // Check if user is authenticated
    if (!tokenExracted.userId) {
      return res.status(401).redirect("/login", { error: 'User not authenticated' });
    }
    console.log(req.body);
    const { size, prdid, qty } = req.body;
    const productId = prdid;
    console.log(productId);

    const userId = tokenExracted.userId; // Assuming user ID is available in the JWT payload
    console.log(userId);
    // Check if the product exists
    const product = await Product.findById(productId);
    console.log("Product Exist");
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // if (product.stock[size] < qty) {
    //   return res.status(400).json({ error: 'Not enough stock available' });
    // }

    // // Reduce the stock of the product
    // product.stock[size] -= qty;
    // await product.save();


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
      existingItem.quantity += parseInt(qty);
    } else {
      cart.items.push({ product: productId, quantity: qty, size: size });
    }
    await cart.save();

    // Redirect back to the referring page
    const referringUrl = req.headers.referer || '/';
    const parsedUrl = url.parse(referringUrl);
    res.redirect(302, parsedUrl.path);

  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

//   let viewCart = async (req, res) => {
//     try {
//       let tokenExracted = await verifyUser(req.cookies.jwt);
//       console.log(tokenExracted.userId);
//         var userName = tokenExracted.userName;
//         console.log(userName);
//         const category = await Category.find()
//       // Check if user is authenticated
//       if (!tokenExracted.userId) {
//         return res.status(401).redirect("/login", { error: 'User not authenticated' });
//       }
      
//       var userId = tokenExracted.userId;
// const cartd= await Cart.find({user:userId})
// const wishlistd= await Wishlist.find({user:userId})
// var itemsLength = cartd[0].items.length;
// var WishitemsLength = wishlistd[0].products.length;
//       // Find the user's cart
//       const cart = await Cart.findOne({ user: userId }).populate('items.product');
//       const coupon = await Coupon.find()
//       console.log(cart)

//       // Prepare the response data
//       const cartItems = cart.items.map(item => {
//         return {
//           productId: item.product._id,
//           productName: item.product.name,
//           productImage: item.product.image,
//           productstock: item.product.stock,
//           size: item.size,
//           price: item.product.price,
//           quantity: item.quantity,
//           totalPrice: item.quantity * item.product.price // Assuming each product has a 'price' field
//         };
//       });
  

//       const totalPrice = cartItems.reduce((total, item) => total + item.totalPrice, 0);

//       cart.items.forEach(item => {
//         if (item.product.stock[item.size] < item.quantity) {

//             item.quantity = item.product.stock[item.size];
//             // Add a message property to inform the user
//             item.message = `Quantity reduced to match available stock (${item.quantity} available)`;
//         }
//     });
    

//       await cart.save();


      
//       res.render("user/cart",{ items: cartItems, totalPrice: totalPrice,userName,coupon,category,cartln:itemsLength || 0,wishln:WishitemsLength || 0});

//     } catch (error) {
//       console.error('Error viewing cart:', error);
//       res.render("user/cart");
//     }
//   }

let viewCart = async (req, res) => {
  try {
    let tokenExracted = await verifyUser(req.cookies.jwt);
    console.log(tokenExracted.userId);
    var userName = tokenExracted.userName;
    console.log(userName);
    const category = await Category.find();

    // Check if user is authenticated
    if (!tokenExracted.userId) {
      return res.status(401).redirect("/login", { error: 'User not authenticated' });
    }

    var userId = tokenExracted.userId;
    const cartd = await Cart.find({ user: userId });
    const wishlistd = await Wishlist.find({ user: userId });

    var itemsLength = cartd.length > 0 ? cartd[0].items.length : 0;
    var WishitemsLength = wishlistd.length > 0 ? wishlistd[0].products.length : 0;

    // Find the user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    const coupon = await Coupon.find();
    console.log(cart);

    // Prepare the response data
    const cartItems = cart.items.map(item => {
      return {
        productId: item.product._id,
        productName: item.product.name,
        productImage: item.product.image,
        productstock: item.product.stock,
        size: item.size,
        price: item.product.price,
        quantity: item.quantity,
        totalPrice: item.quantity * item.product.price // Assuming each product has a 'price' field
      };
    });

    const totalPrice = cartItems.reduce((total, item) => total + item.totalPrice, 0);

    cart.items.forEach(item => {
      if (item.product.stock[item.size] < item.quantity) {
        item.quantity = item.product.stock[item.size];
        // Add a message property to inform the user
        item.message = `Quantity reduced to match available stock (${item.quantity} available)`;
      }
    });

    await cart.save();

    res.render("user/cart", { items: cartItems, totalPrice: totalPrice, userName, coupon, category, cartln: itemsLength || 0, wishln: WishitemsLength || 0 });

  } catch (error) {
    console.error('Error viewing cart:', error);
    res.render("user/cart");
  }
};


let updateprofile = async(req,res)=>
{
  try {
    let tokenExracted = await verifyUser(req.cookies.jwt);
    let userid = tokenExracted.userId;
    let profile=await User.findById(userid)
    console.log(userid,profile)
    profile.userName = req.body.username;
    profile.mail = req.body.mail;
    profile.phoneNumber = req.body.phonenumber;
    await profile.save();
    console.log("updated");
    res.status(200).json({ message: 'Profile updated successfully' }); 
  } catch (error) {
    console.log(error)
  }

}

let removeCartItem = async (req,res)=>
{
  try {
    console.log("remove");
  let tokenExracted = await verifyUser(req.cookies.jwt);
  const userId = tokenExracted.userId;
  const { size, id } = req.body;
  console.log(size,id);
  const cart = await Cart.findOne({user: userId})
  const index = cart.items.findIndex(item=>item.product.toString()===id && size)
  if(index!==-1){
     cart.items.splice(index,1) 
     await cart.save()
  }
  res.redirect("/cart");
  }catch(err)
  {console.log(err)}
}

// let help =async (req, res) => {
//   if (req.cookies.jwt) {
//     let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
//     var userName = tokenExracted.userName;
//     console.log(userName);
//     var userId = tokenExracted.userId;
// const cartd= await Cart.find({user:userId})
// const wishlistd= await Wishlist.find({user:userId})
// var itemsLength = cartd[0].items.length;
// var WishitemsLength = wishlistd[0].products.length;
//   }
//   const category = await Category.find({})
//   console.log("help");
//   res.render("user/help",{userName,category,cartln:itemsLength || 0,wishln:WishitemsLength || 0
//   });
// };

let help = async (req, res) => {
  try {
    let userName;
    let userId;
    let itemsLength = 0;
    let WishitemsLength = 0;

    if (req.cookies.jwt) {
      let tokenExracted = await verifyUser(req.cookies.jwt); // NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
      userName = tokenExracted.userName;
      console.log(userName);
      userId = tokenExracted.userId;

      const cartd = await Cart.find({ user: userId });
      const wishlistd = await Wishlist.find({ user: userId });

      if (cartd.length > 0) {
        itemsLength = cartd[0].items.length;
      }
      if (wishlistd.length > 0) {
        WishitemsLength = wishlistd[0].products.length;
      }
    }

    const category = await Category.find({});
    console.log("help");
    res.render("user/help", { userName, category, cartln: itemsLength || 0, wishln: WishitemsLength || 0 });
  } catch (error) {
    console.error('Error rendering help page:', error);
    res.status(500).send("Internal Server Error");
  }
};



// let wishlist = async (req, res) => {
//   if (req.cookies.jwt) {
//     try {
//       let tokenExracted = await verifyUser(req.cookies.jwt);
//       let userName = tokenExracted.userName;
//       var userId = tokenExracted.userId;
// const cartd= await Cart.find({user:userId})
// const wishlistd= await Wishlist.find({user:userId})
// var itemsLength = cartd[0].items.length;
// var WishitemsLength = wishlistd[0].products.length;
//       console.log("wishid", userId);
      
//       const wishlists = await Wishlist.find({ user: userId }).populate('products');
//       // Use populate to retrieve the product details associated with each wishlist item
//       const category = await Category.find()

//       console.log(wishlists);

//       res.render("user/wishlist", { wishlists, userName ,category,cartln:itemsLength || 0,wishln:WishitemsLength || 0
//       });
//     } catch (error) {
//       res.render("error", { print: error });
//     }
//   }
// };

let wishlist = async (req, res) => {
  try {
    if (req.cookies.jwt) {
      let tokenExracted = await verifyUser(req.cookies.jwt);
      let userName = tokenExracted.userName;
      let userId = tokenExracted.userId;

      const cartd = await Cart.find({ user: userId });
      const wishlistd = await Wishlist.find({ user: userId });

      let itemsLength = 0;
      let WishitemsLength = 0;

      if (cartd.length > 0) {
        itemsLength = cartd[0].items.length;
      }
      if (wishlistd.length > 0) {
        WishitemsLength = wishlistd[0].products.length;
      }

      console.log("wishid", userId);

      const wishlists = await Wishlist.find({ user: userId }).populate('products');
      // Use populate to retrieve the product details associated with each wishlist item
      const category = await Category.find();

      console.log(wishlists);

      res.render("user/wishlist", { wishlists, userName, category, cartln: itemsLength || 0, wishln: WishitemsLength || 0 });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error('Error rendering wishlist:', error);
    res.render("error", { print: error });
  }
};


let wishlistprofile = async (req, res) => {
  if (req.cookies.jwt) {
    try {
      let tokenExracted = await verifyUser(req.cookies.jwt);
      let userName = tokenExracted.userName;
      let userid = tokenExracted.userId;
      console.log("wishid", userid);
      
      const wishlists = await Wishlist.find({ user: userid }).populate('products');
      // Use populate to retrieve the product details associated with each wishlist item
      const category = await Category.find()

      console.log(wishlists);

      res.render("user/wishlistprofile", { wishlists, userName ,category,layout:false});
    } catch (error) {
      res.render("error", { print: error });
    }
  }
};
let shippingadr = async (req, res) => {
  console.log("reqingg")
  if (req.cookies.jwt) {
    try {
      let tokenExracted = await verifyUser(req.cookies.jwt);
      let userid = tokenExracted.userId;
      const adress = await User.findOne({_id:userid})
      res.render("user/shippingadr", { layout:false,adress:adress.addresses});
    } catch (error) {
      res.render("error", { print: error });
    }
  }
};
let delAddress =async (req, res) => {
  try {
    let tokenExracted = await verifyUser(req.cookies.jwt);
    let userid = tokenExracted.userId;
       // Assuming you have a way to identify the user whose address is being deleted
      const { index } = req.body; // Index of the address to delete
      
      // Fetch the user document
      const user = await User.findById(userid);
      
      // Check if the user exists
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      // Check if the index is within bounds of the addresses array
      if (index < 0 || index >= user.addresses.length) {
          return res.status(400).json({ error: "Invalid address index" });
      }

      // Remove the address at the specified index
      user.addresses.splice(index, 1);

      // Save the updated user document
      await user.save();

      // Respond with success message
      res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
      // Handle any errors
      console.error("Error deleting address:", error);
      res.status(500).json({ error: "An error occurred while deleting the address" });
  }
}
// let userprofile =async (req, res) => {
//   if (req.cookies.jwt) {
//     let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
//     var userId = tokenExracted.userId;
// const cartd= await Cart.find({user:userId})
// const wishlistd= await Wishlist.find({user:userId})
// var itemsLength = cartd[0].items.length;
// var WishitemsLength = wishlistd[0].products.length;
//     var userName = tokenExracted.userName;
//   }
//   const user =await User.find({_id:userId})
//   const shippingAddress= await Order.find({user:userId})
//   const category =await Category.find()
  
//   console.log("userprofile");
//   res.render("user/userprofile",{userName,user,category,shippingAddress,cartln:itemsLength || 0,wishln:WishitemsLength || 0
//   });

// };
let userprofile = async (req, res) => {
  try {
    let userName;
    let userId;
    let itemsLength = 0;
    let WishitemsLength = 0;

    if (req.cookies.jwt) {
      let tokenExracted = await verifyUser(req.cookies.jwt);
      userId = tokenExracted.userId;
      const cartd = await Cart.find({ user: userId });
      const wishlistd = await Wishlist.find({ user: userId });

      if (cartd.length > 0) {
        itemsLength = cartd[0].items.length;
      }
      if (wishlistd.length > 0) {
        WishitemsLength = wishlistd[0].products.length;
      }
      userName = tokenExracted.userName;
    }

    const user = await User.find({ _id: userId });
    const shippingAddress = await Order.find({ user: userId });
    const category = await Category.find();

    console.log("userprofile");
    res.render("user/userprofile", {
      userName,
      user,
      category,
      shippingAddress,
      cartln: itemsLength || 0,
      wishln: WishitemsLength || 0
    });
  } catch (error) {
    console.error('Error rendering user profile:', error);
    res.render("error", { print: error });
  }
};


// let checkout = async(req, res) => {
//   console.log("checkout");
//   if (req.cookies.jwt) {
//     let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
//     var userName = tokenExracted.userName;
//     var userId = tokenExracted.userId;
//     const cartd= await Cart.find({user:userId})
//     const wishlistd= await Wishlist.find({user:userId})
//     var itemsLength = cartd[0].items.length;
//     var WishitemsLength = wishlistd[0].products.length;
//     console.log(userName);
//   }
//   console.log(userId);
//   let category = await Category.find()
//   const cart = await Cart.findOne({user: userId}).populate('items.product');
//   const adress = await User.findOne({_id:userId})
//   console.log(adress);

//   res.render("user/checkout",{userName,cart,adress:adress.addresses,category,cartln:itemsLength || 0,wishln:WishitemsLength || 0
//   });
// };
let checkout = async (req, res) => {
  try {
    console.log("checkout");
    let userName;
    let userId;
    let itemsLength = 0;
    let WishitemsLength = 0;

    if (req.cookies.jwt) {
      let tokenExracted = await verifyUser(req.cookies.jwt);
      userName = tokenExracted.userName;
      userId = tokenExracted.userId;
      
      const cartd = await Cart.find({ user: userId });
      const wishlistd = await Wishlist.find({ user: userId });

      if (cartd.length > 0) {
        itemsLength = cartd[0].items.length;
      }
      if (wishlistd.length > 0) {
        WishitemsLength = wishlistd[0].products.length;
      }

      console.log(userName);
    }

    console.log(userId);
    const category = await Category.find();
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    const adress = await User.findOne({ _id: userId });


    res.render("user/checkout", { userName, cart, adress:adress.addresses, category, cartln: itemsLength || 0, wishln: WishitemsLength || 0 });
  } catch (error) {
    console.error('Error rendering checkout page:', error);
    res.render("error", { print: error });
  }
};

// let ordercomplete =async (req, res) => {
//   if (req.cookies.jwt) {
//     let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
//     var userName = tokenExracted.userName;
//     var userId = tokenExracted.userId;
// const cartd= await Cart.find({user:userId})
// const wishlistd= await Wishlist.find({user:userId})
// var itemsLength = cartd[0].items.length;
// var WishitemsLength = wishlistd[0].products.length;
//     console.log(userName);
//   }
//   console.log("ordercomplete");
//   res.render("user/ordercomplete",{userName,cartln:itemsLength || 0,wishln:WishitemsLength || 0
//   });
// };
let ordercomplete = async (req, res) => {
  try {
    const category = await Category.find({})
    let userName;
    let userId;
    let itemsLength = 0;
    let WishitemsLength = 0;
    
    if (req.cookies.jwt) {
      let tokenExracted = await verifyUser(req.cookies.jwt);
      userName = tokenExracted.userName;
      userId = tokenExracted.userId;
      
      const cartd = await Cart.find({ user: userId });
      const wishlistd = await Wishlist.find({ user: userId });

      if (cartd.length > 0) {
        itemsLength = cartd[0].items.length;
      }
      if (wishlistd.length > 0) {
        WishitemsLength = wishlistd[0].products.length;
      }

      console.log(userName);
    }

    console.log("ordercomplete");
    res.render("user/ordercomplete", {category, userName, cartln: itemsLength || 0, wishln: WishitemsLength || 0 });
  } catch (error) {
    console.error('Error rendering order complete page:', error);
    res.render("error", { print: error });
  }
};

let orderview = async (req, res) => {
  try {
    if (req.cookies.jwt) {
      let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
      var userName = tokenExracted.userName;
      var userId = tokenExracted.userId;
      console.log(userName);
      let order = await Order.find({"user": userId})
    .populate('items.product')
    .sort({ orderDate: -1 }) // Sort in descending order of createdAt
    .exec();
      console.log(order)
      console.log("ordercomplete");
      res.render("user/orders",{order,layout:false});
    }
    
  } catch (error) {
    console.log(error);
  }
 
};

let signup =async (req, res) => {
  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt);
    if (tokenExracted) {
      return res.redirect("/");
    }
  }
  
  console.log("signup");
  res.render("user/signup", { layout: false });
};
// let tracking = async(req, res) => {
//   if (req.cookies.jwt) {
//     let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
//     var userName = tokenExracted.userName;
//     console.log(userName);
//     var userId = tokenExracted.userId;
// const cartd= await Cart.find({user:userId})
// const wishlistd= await Wishlist.find({user:userId})
// var itemsLength = cartd[0].items.length;
// var WishitemsLength = wishlistd[0].products.length;
//   }
//   const category = await Category.find({})

//   console.log("tracking");
//   res.render("user/tracking", {category,userName,cartln:itemsLength || 0,wishln:WishitemsLength || 0
//   });
// };
let tracking = async (req, res) => {
  try {
    let userName;
    let userId;
    let itemsLength = 0;
    let WishitemsLength = 0;

    if (req.cookies.jwt) {
      let tokenExracted = await verifyUser(req.cookies.jwt);
      userName = tokenExracted.userName;
      userId = tokenExracted.userId;
      
      const cartd = await Cart.find({ user: userId });
      const wishlistd = await Wishlist.find({ user: userId });

      if (cartd.length > 0) {
        itemsLength = cartd[0].items.length;
      }
      if (wishlistd.length > 0) {
        WishitemsLength = wishlistd[0].products.length;
      }

      console.log(userName);
    }

    const category = await Category.find({});

    console.log("tracking");
    res.render("user/tracking", { category, userName, cartln: itemsLength || 0, wishln: WishitemsLength || 0 });
  } catch (error) {
    console.error('Error rendering tracking page:', error);
    res.render("error", { print: error });
  }
};


let forgetpass = async(req, res) => {
  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt);
    if (tokenExracted) {
      return res.redirect("/");
    }
  }
  console.log("forgetpass");
  res.render("user/forget", { layout: false });
};
let invoice =async (req, res) => {
  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
    var userName = tokenExracted.userName;
    console.log(userName);
  }
  console.log("invoice");
  res.render("user/invoice",{userName});
};

const delwish = async (req, res) => {
  try {
    const { productId } = req.params;
    // Assuming you have a function to remove a product from the wishlist based on its ID
    await Wishlist.findOneAndUpdate({ "products": productId }, { "$pull": { "products": productId } });
    res.status(200).json({ message: 'Product removed from wishlist successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

let paymetController = async(req,res)=>{
  try {
    console.log("payment logging");
      const amount = req.body.amount*100
      const options = {
          amount: amount,
          currency: 'INR',
          receipt: 'razorUser@gmail.com'
      }
      console.log(req.body);


     await Userhelpers.razorpayInstanceHelp.orders.create(options, 
          (err, order)=>{
              if(!err){
                  res.status(200).send({
                      success:true,
                      msg:'Order Created',
                      order_id:order.id,
                      amount:amount,
                      key_id:process.env.RZPAY_KEY,
                      product_name:"product",
                      description:"description",
                      contact:"8567345632",
                      name: "Sandeep Sharma",
                      email: "sandeep@gmail.com"
                  });
                  console.log("created");
              }
              
              else{
                  res.status(400).send({success:false,msg:'Something went wrong!'});
                  console.log("not created");
              }
          }
      );

  } catch (error) {
      console.log(error.message);
  }
}

const loginRequestOTP = async (req, res) => {
  console.log("Requesting OTP");
  const { phone } = req.body;
  console.log(req.body);

  try {
    const user = await User.findOne({ phoneNumber: phone });
    console.log("found");
 
    if (user.isAdmin) {
      return res.status(404).json({ error: "User not found" });
  }

    if (!user) {
      return res.status(404).json({ error: "User not found" }); // Correct syntax for sending JSON response
    }

    const otp = generateOTP();
    console.log(otp);
    otpDBPhone[phone] = otp;
    // Send OTP asynchronously and wait for completion
    await Userhelpers.sendOTP(phone, otp);
    console.log("OTP SMS sent");
    
    // Render response after sending OTP
    return res.status(200).json({ message: "Otp Sent Succesfully" }); // Correct syntax for sending JSON response
    
  } catch (error) {
    console.error("Error requesting OTP:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

let showCategoryProducts =async (req, res) => {
  const categoryName = req.params.categoryName;
  console.log(categoryName)
  try {
    if(categoryName === "all")
    {
      const product = await Product.find();
      res.render("user/productbycat", { product,layout:false})
    }
    const product = await Product.find({ category : categoryName});
    console.log(product)
    res.render("user/productbycat", { product,layout:false})
  } catch (error) {
    console.log(error)
  }
}

// let showcatprod =async (req, res) => {
//   try {
//     const name = req.query.id
//     const product =await Product.find({category:name})
//     const category =await Category.find()
//     let tokenExracted = await verifyUser(req.cookies.jwt);
//     var userId = tokenExracted.userId;
//     var userName = tokenExracted.userName;
// const cartd= await Cart.find({user:userId})
// const wishlistd= await Wishlist.find({user:userId})
// var itemsLength = cartd[0].items.length;
// var WishitemsLength = wishlistd[0].products.length;
//     res.render("user/categorywise",{product,category,cartln:itemsLength || 0,wishln:WishitemsLength || 0
//     ,userName})
//   } catch (error) {
//     console.log(error);
//   }
// }
let showcatprod = async (req, res) => {
  try {
    const name = req.query.id;
    const product = await Product.find({ category: name });
    const category = await Category.find();
    
    // Extract user information if user is signed in
    let userId, userName;
    let itemsLength = 0;
    let WishitemsLength = 0;
    if (req.cookies.jwt) {
      let tokenExracted = await verifyUser(req.cookies.jwt);
      userId = tokenExracted.userId;
      userName = tokenExracted.userName;
      
      // Fetch user's cart and wishlist if user is signed in
      const cartd = await Cart.find({ user: userId });
      const wishlistd = await Wishlist.find({ user: userId });

      // Calculate cart and wishlist lengths
      if (cartd[0]) {
        itemsLength = cartd[0].items.length;
      }
      if (wishlistd[0]) {
        WishitemsLength = wishlistd[0].products.length;
      }
    }

    res.render("user/categorywise", {
      product,
      category,
      cartln: itemsLength || 0,
      wishln: WishitemsLength || 0,
      userName
    });
  } catch (error) {
    console.log(error);
    // Handle errors gracefully
    res.status(500).send("Internal Server Error");
  }
};


// let showcatprod = async (req, res) => {
//   try {
//     const name = req.query.id;
//     const product = await Product.find({ category: name });
//     const category = await Category.find();
//     let tokenExracted = await verifyUser(req.cookies.jwt);
//     var userId = tokenExracted.userId;
    
//     // Fetch user's cart and wishlist
//     const cartd = await Cart.findOne({ user: userId });
//     const wishlistd = await Wishlist.findOne({ user: userId });
    
//     // Initialize itemsLength and WishitemsLength to 0
//     let itemsLength = 0;
//     let WishitemsLength = 0;

//     // If cartd and wishlistd exist, update itemsLength and WishitemsLength
//     if (cartd) {
//       itemsLength = cartd.items.length;
//     }

//     if (wishlistd) {
//       WishitemsLength = wishlistd.products.length;
//     }

//     res.render("user/categorywise", {
//       product,
//       category,
//       cartln: itemsLength,
//       wishln: WishitemsLength
//     });
//   } catch (error) {
//     console.log(error);
//     // Handle errors gracefully
//     res.status(500).send("Internal Server Error");
//   }
// };
// let showcatprod = async (req, res) => {
//   try {
//     const name = req.query.id;
    
//     // Find products based on category
//     const product = await Product.find({ category: name });
    
//     // Fetch all categories
//     const category = await Category.find();
    
//     // Extract user ID from JWT token
//     let tokenExracted = await verifyUser(req.cookies.jwt);
//     var userId = tokenExracted.userId;
    
//     // Fetch user's cart and wishlist
//     const cartd = await Cart.findOne({ user: userId });
//     const wishlistd = await Wishlist.findOne({ user: userId });
    
//     // Initialize itemsLength and WishitemsLength to 0
//     let itemsLength = 0;
//     let WishitemsLength = 0;

//     // If cartd and wishlistd exist, update itemsLength and WishitemsLength
//     if (cartd) {
//       itemsLength = cartd.items.length;
//     }

//     if (wishlistd) {
//       WishitemsLength = wishlistd.products.length;
//     }

//     // Render the category-wise product page with necessary data
//     res.render("user/categorywise", {
//       product,
//       category,
//       cartln: itemsLength,
//       wishln: WishitemsLength
//     });
//   } catch (error) {
//     console.log(error);
//     // Handle errors gracefully
//     res.status(500).send("Internal Server Error");
//   }
// };



// let search =async (req, res) => {
//   try {
//     let tokenExracted = await verifyUser(req.cookies.jwt)
//     const category =await Category.find()
//     var userId = tokenExracted.userId;
//     var userName = tokenExracted.userName;
// const cartd= await Cart.find({user:userId})
// const wishlistd= await Wishlist.find({user:userId})
// var itemsLength = cartd[0].items.length;
// var WishitemsLength = wishlistd[0].products.length;
//     res.render("user/search",{product,category,userName,cartln:itemsLength || 0,wishln:WishitemsLength || 0
//     })
//   } catch (error) {
//     console.log(error);
//   }
// }
let search = async (req, res) => {
  try {
    // Fetch all categories for navigation
    const categories = await Category.find();

    // Initialize variables for user information and item counts
    let userId, userName;
    let cartItemCount = 0;
    let wishlistItemCount = 0;

    // Check if JWT token is present in the request cookies
    if (req.cookies.jwt) {
      // Extract user information from the JWT token
      let tokenExracted = await verifyUser(req.cookies.jwt);
      userId = tokenExracted.userId;
      userName = tokenExracted.userName;

      // Fetch user's cart and wishlist information
      const cart = await Cart.findOne({ user: userId });
      const wishlist = await Wishlist.findOne({ user: userId });

      // Calculate the number of items in the cart and wishlist
      cartItemCount = cart ? cart.items.length : 0;
      wishlistItemCount = wishlist ? wishlist.products.length : 0;
    }

    // Check if a search query is provided in the request
    const searchQuery = req.query.q;
    let searchResults = [];

    if (searchQuery) {
      // Perform the search based on the search query
      searchResults = await Product.find({ $text: { $search: searchQuery } });
    }

    // Render the search page with search results and other necessary data
    res.render("user/search", {
      searchResults,
      categories,
      userName,
      cartln: cartItemCount,
      wishln: wishlistItemCount
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};


let sort =async (req, res) => {
  const { sortType } = req.params;
  console.log(sortType);

  // Sort products based on sortType
  let products = await Product.find({})
  let sortedProducts = ""
  switch (sortType) {
      case 'price_asc':
          sortedProducts = products.slice().sort((a, b) => a.price - b.price);
          break;
      case 'price_desc':
          sortedProducts = products.slice().sort((a, b) => b.price - a.price);
          break;
      case 'newness':
          sortedProducts = products.slice().sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
          break;
      default:
          sortedProducts = products; // Default to original order if sortType is invalid
  }

  // Return sorted products as JSON response
  const category =await Category.find()
  res.render("user/categorywise",{product:sortedProducts,category,layout:false})
}

let teamfilter = async (req, res) => {
  const clubName = req.params.clubname;

  if (clubName) {
    console.log(String(clubName).toLowerCase());
    try {
      const products = await Product.find({ name: { $regex: String(clubName), $options: 'i' } });
      res.render("user/productss", { product: products, layout: false });
    } catch (error) {
      console.error('Error searching for products:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(400).json({ error: 'Club name is required' });
  }
}



let searchproduct= async (req, res) => {
  try {
    const query = req.body.query.toLowerCase().trim();
    const searchResults = await Product.aggregate([
      // Match products that match the search query
      {
        $match: {
          $or: [
            { name: { $regex: query, $options: 'i' } }, // Case-insensitive search by name
            { description: { $regex: query, $options: 'i' } } // Case-insensitive search by description
          ]
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    // Send the search results as a response
    res.json(searchResults);
  } catch (error) {
    console.error('Error searching for products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}





let delorder = async (req, res) => {
  const orderId = req.params.orderId;

  try {
      // Find the order by ID and remove it from the database
      const deletedOrder = await Order.findOneAndDelete({ orderId: orderId });

      if (deletedOrder) {
          res.json({ message: 'Order canceled successfully' });
      } else {
          res.status(404).json({ error: 'Order not found' });
      }
  } catch (error) {
      console.error('Error canceling order:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
}

const sign = async (req, res) => {
  const { otp, phone } = req.body;
  console.log(req.body);

  try {
    // Find the user by phone number
    const user = await User.findOne({ phoneNumber: phone });
    console.log(user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get the OTP associated with the phone number
    const storedOTP = otpDBPhone[phone];

    // Compare the OTP provided by the user with the stored OTP
    const isOtpValid = storedOTP === Number(otp);
    console.log(typeof storedOTP,typeof otp);

    if (isOtpValid) {
      console.log("valid otp");
      console.log(user._id + ' logged in');
      try {
        const token = await signUser(user); // Generate token using signAdmin middleware
        console.log(token);
        res.cookie("jwt", token, { httpOnly: true, maxAge: 7200000 }); //1= COOKIE NAME AND  2 =DATA 3=OPTIONAL
        return res.status(200).json({ success: true, token }); // Sending the token back as JSON response
      } catch (error) {
        console.error("Error generating token:", error);
        return res.status(500).json({ success: false, error: "Error generating token" });
      }
    } else {
      return res.status(200).json({ success: false, error: "Incorrect OTP" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

let  sendmail = async(req, res) => {
  const { email, msg } = req.body;

  // Create a Nodemailer transporter
  let transporter = nodemailer.createTransport({
      service: 'Gmail', // Change this to your email service provider
      auth: {
          user: process.env.EMAIL_USER, // Change this to your email address
          pass: process.env.APP_SPECIFIC_PASSWORD // Change this to your email password
      }
  });

  // Setup email data
  let mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: email, // Change this to recipient's email address
      subject: 'Contact Form Submission',
      text: `Message:\n${msg}`
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.log(error);
          res.json({ status: 'error' });
      } else {
          console.log('Email sent: ' + info.response);
          res.json({ status: 'success' });
      }
  });
}


module.exports = {sendmail,sign,teamfilter,searchproduct,delwish,paymetController,tracking,updateprofile,showCategoryProducts,showcatprod,search,
  payment,sort,delorder,
  ResetPassword,
  homePage,
  contact,
  about,
  product,
  productdetail,
  help,
  wishlist,
  userprofile,
  checkout,
  ordercomplete,
  signup,
  forgetpass,
  invoice,
  signUpPostPage,
  loginPostPage,shippingadr,
  loginGetPage,
  logoutPage,verifyotp,
  addtocart,loginotp,delAddress,subscribe,
  viewCart,updatecart,removeCartItem,addtowishlist,discount  ,pcheckout,fcheckout,orderview,ResetPasswordPost,ResetPasswordPostFinal,loginRequestOTP,wishlistprofile
};
