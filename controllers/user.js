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

    let resolved = await Userhelpers.loginHelper(req.body);
    if (resolved.invalidUsername) {
      console.log("invalid user name");
      return res.render("user/login", {
        layout: false,
        mailError: "Mail id not registered",
        mail: req.body.mail,
        password: req.body.password,
      });
    } else if (resolved.passwordMismatch) {
      console.log("password not match");
      return res.render("user/login", {
        layout: false,
        passwordError: "Wrong Password",
        password: req.body.password,
        mail: req.body.mail,
      });
    } else if (resolved.blockedUser) {
      return res.render("user/login", {
        layout: false,
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
  await Visit.findOneAndUpdate({}, { $inc: { count: 1 } }, { upsert: true });
  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
    var userName = tokenExracted.userName;
    var userId = tokenExracted.userId;
    console.log("uid",userId);
    console.log(userName);
  }
  if (userName) {
    console.log("Having User");
    const products = await Product.find();
    const category = await Category.find();
    const banner = await Banner.find();
    const userln = await User.find();
    return res.render("user/index", {
      userId,userln,
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
    const users = await User.find();
    res.render("user/index", { data: products, category, banner,userId });
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

let contact = async (req, res) => {
  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
    var userName = tokenExracted.userName;
    console.log(userName);
  }
  const category = await Category.find({})
  console.log("contact");
  res.render("user/contact", { userName,layout: "layout" ,category});
};
let about =async (req, res) => {
  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
    var userName = tokenExracted.userName;
    console.log(userName);
  }
  console.log("about");
  const category = await Category.find({})
  res.render("user/about",{userName,category});
};
let product =async (req, res) => {
  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
    var userName = tokenExracted.userName;
    var userId = tokenExracted.userId
    console.log(userId);
  }
  console.log("product page");
  const category = await Category.find({})
  const product = await Product.find({})
  res.render("user/product",{userName,category,product,userId});
};
let productdetail = async (req, res) => {
  try {
    const id = req.query.id
    if (req.cookies.jwt) {
      let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
      var userName = tokenExracted.userName;
      var userId = tokenExracted.userId;
      console.log(userName);
    }
    const productsss = await Product.findById(id);
    const related = await Product.find({ category: productsss.category, _id: { $ne: id } }); // Excluding the currently viewed product from related
    console.log(productsss);
    res.render("user/product-detail", { layout: "layout.hbs", productsss, userName, userId, related });

  } catch (error) {
    console.log(error);
  }
};
let cart = (req, res) => {
  console.log("cart");
  res.render("user/cart");
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
    console.log("userid:", userId, "pid:", productId);

    // Check if user and product exist
    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
  }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!userId || !productId) {
      return res.status(400).json({ error: 'User ID or Product ID is missing in the request body' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if user's wishlist exists
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      // If user's wishlist doesn't exist, create a new wishlist
      const newWishlist = new Wishlist({ user: userId, products: [productId] });
      await newWishlist.save();
      res.status(200).json({ message: 'Product added to wishlist successfully', icon: 'success' });
    }

    // Check if the product is already in the wishlist
    const pindex = wishlist.products.indexOf(productId);
    if (pindex !== -1) {
      // If product exists, remove it from the wishlist
      wishlist.products.splice(pindex, 1);
      await wishlist.save();
      res.status(200).json({ message: 'Product removed from wishlist successfully', icon: 'error' });
    } else {
      // If product doesn't exist, add it to the wishlist
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
    let tokenExracted = await verifyUser(req.cookies.jwt)
    const userId = tokenExracted.userId; // Assuming you have a function to extract the user ID from the JWT token
    console.log("post checkout");
    const {carttotal} = req.body
    const cart = await Cart.findOne({user: userId});
    await Cart.findOneAndUpdate({ "user": userId },  { "carttotal": carttotal } );
    await cart.save()
    res.redirect("ordercomplete")
  } catch (error) {
    console.log(error);
  }
}
let fcheckout = async (req, res) => {
  try {
    // Verify user and get user ID
    let tokenExtracted = await verifyUser(req.cookies.jwt);
    const userId = tokenExtracted.userId;
    const orderNumber = await Userhelpers.getNextOrderNumber();
    console.log(req.body)

    // Get user's cart
    const cart = await Cart.findOne({ user: userId });


    // Check and reduce stock of products
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product with ID ${item.product} not found.`);
      }
      const size = item.size;
      if (!product.stock[size] || product.stock[size] < item.quantity) {
        res.status(200).json("Out of Stock");
      }
      // Deduct quantity from stock for the specific size
      product.stock[size] -= item.quantity;
      await product.save();
    }

    // Create a new order instance
    const newOrder = new Order({
      orderId: orderNumber,
      user: userId,
      items: cart.items,
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
    // Clear the cart items or mark them as purchased
    // This step depends on your application's logic

    // Send a success response
    res.render('user/ordercomplete', { message: 'Order completed successfully.', orderId: savedOrder.orderId });
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

  let viewCart = async (req, res) => {
    try {
      let tokenExracted = await verifyUser(req.cookies.jwt);
      console.log(tokenExracted.userId);
        var userName = tokenExracted.userName;
        console.log(userName);
        const category = await Category.find()
      // Check if user is authenticated
      if (!tokenExracted.userId) {
        return res.status(401).redirect("/login", { error: 'User not authenticated' });
      }
      
      const userId = tokenExracted.userId;
      // Find the user's cart
      const cart = await Cart.findOne({ user: userId }).populate('items.product');
      const coupon = await Coupon.find()
      console.log(cart)

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
      res.render("user/cart",{ items: cartItems, totalPrice: totalPrice,userName,coupon,category});

    } catch (error) {
      console.error('Error viewing cart:', error);
      res.render("user/cart");
    }
  }
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




let help =async (req, res) => {
  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
    var userName = tokenExracted.userName;
    console.log(userName);
  }
  const category = await Category.find({})
  console.log("help");
  res.render("user/help",{userName,category});
};
let wishlist = async (req, res) => {
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

      res.render("user/wishlist", { wishlists, userName ,category});
    } catch (error) {
      res.render("error", { print: error });
    }
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
let userprofile =async (req, res) => {
  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
    var userId = tokenExracted.userId;
  }
  const user =await User.find({_id:userId})
  const shippingAddress= await Order.find({user:userId})
  const userName =user.userName
  const category =await Category.find()
  
  console.log("userprofile");
  res.render("user/userprofile",{userName,user,category,shippingAddress});

};
let checkout = async(req, res) => {
  console.log("checkout");
  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
    var userName = tokenExracted.userName;
    var userId = tokenExracted.userId;
    console.log(userName);
  }
  console.log(userId);
  let category = await Category.find()
  const cart = await Cart.findOne({user: userId}).populate('items.product');
  const adress = await User.findOne({_id:userId})
  console.log(adress);

  res.render("user/checkout",{userName,cart,adress:adress.addresses,category});
};
let ordercomplete =async (req, res) => {
  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
    var userName = tokenExracted.userName;
    console.log(userName);
  }
  console.log("ordercomplete");
  res.render("user/ordercomplete",{userName});
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

// let signin = (req, res) => {
//     console.log("login");
//     res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
//     res.render('user/login',{layout:false})
//   }

let signup = (req, res) => {
  console.log("signup");
  res.render("user/signup", { layout: false });
};
let tracking = (req, res) => {
  console.log("tracking");
  res.render("user/tracking", {});
};
let forgetpass = (req, res) => {
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
  try {
    if(categoryName === "all")
    {
      const product = await Product.find();
      res.render("user/productbycat", { product,layout:false})
    }
    const product = await Product.find({ category : categoryName});
    res.render("user/productbycat", { product,layout:false})
  } catch (error) {
    console.log(error)
  }
}
let showcatprod =async (req, res) => {
  try {
    const name = req.query.id
    const product =await Product.find({category:name})
    const category =await Category.find()
    res.render("user/categorywise",{product,category})
  } catch (error) {
    console.log(error);
  }
}

let search =async (req, res) => {
  try {
    const category =await Category.find()
    res.render("user/search",{product,category})
  } catch (error) {
    console.log(error);
  }
}
let sort =async (req, res) => {
  const { sortType } = req.params;

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

let orderstatus = async (req, res) => {
  const { orderId, newStatus } = req.body;

  try {
      const order = await Order.findOneAndUpdate(
          { orderId: orderId },
          { $set: { Status: newStatus } },
          { new: true }
      );
      
      if (order) {
        res.json({ message: 'Delivery status updated successfully', order: order });
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
      console.error('Error updating delivery status:', error);
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


module.exports = {sign,teamfilter,searchproduct,delwish,paymetController,tracking,updateprofile,showCategoryProducts,showcatprod,search,
  payment,sort,orderstatus,delorder,
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
  loginPostPage,shippingadr,
  loginGetPage,
  logoutPage,verifyotp,
  addtocart,loginotp,delAddress,
  viewCart,updatecart,removeCartItem,addtowishlist,discount  ,pcheckout,fcheckout,orderview,ResetPasswordPost,ResetPasswordPostFinal,loginRequestOTP,wishlistprofile
};
