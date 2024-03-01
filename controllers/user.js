const { signUser, verifyUser } = require("../middleware/jwt");
const  Userhelpers = require("../helpers/userhelper");
const { default: mongoose } = require("mongoose");
const Product = require("../models/product");
const Category = require("../models/category");
const Banner = require("../models/banner");
const Cart = require("../models/cart");
const { session } = require("passport");
const url = require('url');

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
  console.log("contact");
  res.render("user/contact", { userName,layout: "layout" });
};
let about =async (req, res) => {
  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
    var userName = tokenExracted.userName;
    console.log(userName);
  }
  console.log("about");
  res.render("user/about",{userName});
};
let product =async (req, res) => {
  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
    var userName = tokenExracted.userName;
    console.log(userName);
  }
  console.log("product");
  res.render("user/product",{userName});
};
let productdetail = async (req, res) => {
  try {
    const id = req.query.id
    if (req.cookies.jwt) {
      let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
      var userName = tokenExracted.userName;
      console.log(userName);
    }
  
    const productsss = await Product.findById(id); // Adding await here to wait for the query to complete
    console.log(productsss)
    res.render("user/product-detail", { layout: "layout.hbs" ,productsss,userName}); // Adding await here as well

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
      
      // Check if user is authenticated
      if (!tokenExracted.userId) {
        return res.status(401).redirect("/login", { error: 'User not authenticated' });
      }
      
      const userId = tokenExracted.userId;
      console.log(userId);

      // Find the user's cart
      const cart = await Cart.findOne({ user: userId }).populate('items.product');

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
      console.log(cartItems);

      const totalPrice = cartItems.reduce((total, item) => total + item.totalPrice, 0);

      cart.items.forEach(item => {
        if (item.product.stock[item.size] < item.quantity) {

            item.quantity = item.product.stock[item.size];
            // Add a message property to inform the user
            item.message = `Quantity reduced to match available stock (${item.quantity} available)`;
        }
    });
    

      await cart.save();
      res.render("user/cart",{ items: cartItems, totalPrice: totalPrice,userName });

    } catch (error) {
      console.error('Error viewing cart:', error);
      res.render("user/cart");
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
  console.log("help");
  res.render("user/help",{userName});
};
let wishlist =async (req, res) => {
  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
    var userName = tokenExracted.userName;
    console.log(userName);
  }
  
  console.log("produuct");
  res.render("user/wishlist",{userName});
};
let userprofile =async (req, res) => {
  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
    var userName = tokenExracted.userName;
    console.log(userName);
  }
  console.log("userprofile");
  res.render("user/userprofile",{userName});
};
let checkout = async(req, res) => {
  console.log("checkout");
  res.render("user/checkout",{userName});
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
let invoice =async (req, res) => {
  if (req.cookies.jwt) {
    let tokenExracted = await verifyUser(req.cookies.jwt); //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
    var userName = tokenExracted.userName;
    console.log(userName);
  }
  console.log("invoice");
  res.render("user/invoice",{userName});
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
  viewCart,updatecart,removeCartItem
};
