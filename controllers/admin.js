const cloudinary = require('../utils/cloudinery');
const { signAdmin } = require("../middleware/jwt");
const Category = require('../models/category')
const SubCategory = require('../models/subcategory')
const Product  = require('../models/product')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const mongoose = require('mongoose');
const { product } = require('./user');
const Coupon = require('../models/coupon');
const Banner = require('../models/banner');
const Order = require('../models/order');
const Visit = require('../models/visit');
const User = require('../models/users');
const Userhelpers = require('../helpers/userhelper');
const { signUser, verifyUser,verifyAdmin } = require("../middleware/jwt");
global.config = config
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');





function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

var otpDB = {};

const loginRequestOTP = async (req, res) => {
  console.log("Requesting OTP");
  const { phone } = req.body;
  console.log(req.body);

  try {
    const user = await User.findOne({ phoneNumber: phone });
    console.log("found");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP associated with the phone number
    otpDB[phone] = otp;

    // Send OTP asynchronously and wait for completion
    await Userhelpers.sendOTP(phone, otp);
    console.log("OTP SMS sent");
    
    // Render response after sending OTP
    res.status(200).json({ message: "Otp Sent", phone });
  } catch (error) {
    console.error("Error requesting OTP:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

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
    const storedOTP = otpDB[phone];

    // Compare the OTP provided by the user with the stored OTP
    const isOtpValid = (storedOTP === Number(otp));
    console.log(storedOTP, otp, isOtpValid);

    if (isOtpValid) {
      console.log(user._id + ' logged in');
      const token = await signAdmin(user); // Generate token using signAdmin middleware
      console.log(token);
      res.cookie("admin_jwt", token, { httpOnly: true, maxAge: 86400000 }); // 24 hour expiry

      const isAdmin = user.isAdmin || false;
      console.log(isAdmin); // Assuming you have a field named isAdmin in your user schema
      let result = { totalAmount: 0 }; // Default total amount to 0
      const order = await Order.find().sort({ orderDate: -1 });
      const visit = await Visit.findOne();
      
      if (order.length !== 0) {
          result = await Order.aggregate([
              {
                  $group: {
                      _id: null,
                      totalAmount: { $sum: "$totalAmount" }
                  }
              }
          ]);
      }

      if (isAdmin === true) {
      return res.status(200).json({ success: true, isAdmin: true, token });
      } else {
        return res.status(200).json({ success: true, isAdmin: false, token,error: "Incorrect OTP" });
      }
    } else {
      return res.status(401).json({ success: false, error: "Incorrect OTP" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};



let loginotp = async  (req, res) => {
  res.render("admin/loginotp",{layout:false})
}

let homePage = async (req, res) => {
  console.log("admin dashboard page");
  let result = { totalAmount: 0 }; // Default total amount to 0
  const order = await Order.find().sort({ orderDate: -1 });
  
  if (order.length !== 0) {
      result = await Order.aggregate([
          {
              $group: {
                  _id: null,
                  totalAmount: { $sum: "$totalAmount" }
              }
          }
      ]);
  }
  console.log("admin order management");
  const visit = await Visit.findOne();
  res.render('admin/index', { layout: "adminLayout.hbs", order, visit, totalAmount: result[0]?.totalAmount || 0 });
};

let logIn = (req, res) => {
    console.log("admin login page");
    res.render('admin/login',{layout:false})
  }
let Forget = (req, res) => {
    console.log("admin forget page");
    res.render('admin/forget',{layout:false})
  }
  let order = async (req, res) => {
    try {
        const order = await Order.find().sort({ orderDate: -1 });
        console.log("admin order management");
        res.render('admin/order', { layout: "adminLayout.hbs", order });
    } catch (error) {
        console.error("Error fetching orders:", error);
        // Handle error response
        res.status(500).send("Error fetching orders");
    }
}
let productm = async (req, res) => {
  const product  = await Product.find()
    console.log("admin product management");
    res.render('admin/productm',{data : product ,layout:"adminLayout.hbs"})
  }
let addproduct = async (req, res) => {
    console.log("admin product management");
    const categories  = await Category.find()
    const subc  = await SubCategory.find()
    res.render('admin/addproduct',{data:categories,file:subc,layout:"adminLayout.hbs"})
  }
let coupon = async (req, res) => {
    console.log("admin coupn management");
    coupon = await Coupon.find()
    console.log(coupon);
    res.render('admin/coupons',{coupon,layout:"adminLayout.hbs"})
  }

let banner = async(req, res) => {
    console.log("admin banner management");
    const banner = await Banner.find()
    console.log(banner);
    res.render('admin/banner',{banner,layout:"adminLayout.hbs"})
  }
let payments =async (req, res) => {

    console.log("admin banner management");
    const order = await Order.find()
    res.render('admin/payments',{layout:"adminLayout.hbs",order})
  }
let settings =async (req, res) => {
    console.log("admin banner management");
    let tokenExracted = await verifyAdmin(req.cookies.admin_jwt) //NOW IT HAVE USER NAME AND ID ALSO THE ROLE (ITS COME FROM MIDDLE AUTH JWET)
    var userId = tokenExracted.userId;
    
    const user = await User.findById(userId)

    
    res.render('admin/settings',{layout:"adminLayout.hbs",user})
  }
let profile =  (req, res) => {
    console.log("admin banner management");
  
    res.render('admin/profile',{layout:"adminLayout.hbs"})
  }

  let  editproduct = async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    try {
      // Extract product ID from request parameters
      const uploadPromises = req.files.map(file => cloudinary.uploader.upload(file.path));
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(result => result.secure_url);
      // Extract updated product data from request body
      const { name, variant, mrp, price, description, richdescription, category, subcategory, tags,id} = req.body;
      const productId = id;
      // Extract updated stock data from the nested structure
      const stock = {
        S: req.body['stock.S'],
        M: req.body['stock.M'],
        L: req.body['stock.L'],
        XL: req.body['stock.XL'],
        XXL: req.body['stock.XXL']
      };
  
      // Check if there's a file uploaded for the image
  
      // Build updated product object with Cloudinary image URL if available
      const updatedProduct = {
        name,
        variant,
        mrp,
        price,
        stock,
        tags,
        description,
        richdescription,
        category,
        subcategory
      };
  
      // If there's a new image, add it to the updated product object
      if (imageUrls) {
        updatedProduct.image = imageUrls;
      }
  
      // Update product in MongoDB
      const product = await Product.findByIdAndUpdate(productId, updatedProduct, { new: true });
  
      if (!product) {
        // If product with given ID is not found
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // Redirect to product management page after successful update
      res.redirect('/productm');
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  

  let postaddproduct = async (req, res) => {
    try {
      // Upload image to Cloudinary
      const uploadPromises = req.files.map(file => cloudinary.uploader.upload(file.path));
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(result => result.secure_url);
  
      // Log received request body
      console.log("Received body:", req.body);
  
      // Extract stock data from the nested structure
      const stock = {
        S: req.body['stock.S'],
        M: req.body['stock.M'],
        L: req.body['stock.L'],
        XL: req.body['stock.XL'],
        XXL: req.body['stock.XXL']
      };
  
      // Extract product data (ensure correct field names/structure)
      const { name, variant, mrp, price, description, richdescription, category, subcategory,tags } = req.body;
  
      // Create new product object with Cloudinary image URL
      const newProduct = {
        name,
        variant,
        image: imageUrls,
        mrp,
        price,
        stock,
        tags,
        description,
        richdescription,
        category,
        subcategory
      };
  
      // Save product to MongoDB
      const product = await Product.create(newProduct);
  
res.status(201).redirect('/productm');
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


// let prodcteditpage =async (req, res) => {
//   const productId = req.params.id;
//   const product = await Product.findById(productId);
//   console.log("admin dashbord page");
//   res.render('admin/index',{layout:"adminLayout.hbs",product})
// }
let categories = async (req, res) => {
  const categories  = await Category.find()
  const subc  = await SubCategory.find()
  console.log("admin categories management");
  res.status(200).render('admin/category',{data:categories,file:subc,layout:"adminLayout.hbs"})
}
const updatecategory =
async (req, res) => {
  try {
    console.log(req.body);
  
      // Extract updated category data from request body
      const { name,id} = req.body;

      // Check if there's a file uploaded for the image
      let imageUrl;
      if (req.file) {
        console.log("image uploading");
          // Upload new image to Cloudinary
          const result = await cloudinary.uploader.upload(req.file.path);
          imageUrl = result.secure_url;
      }

      // Build updated category object with Cloudinary image URL if available
      const updatedCategory = {
          name,
      };

      // If there's a new image, add it to the updated category object
      if (imageUrl) {
          updatedCategory.imageUrl = imageUrl;
      }

      // Update category in MongoDB
      const category = await Category.findByIdAndUpdate(id, updatedCategory, { new: true });

      if (!category) {
          // If category with given ID is not found
          return res.status(404).json({ message: 'Category not found' });
      }

      // Redirect or render as needed after successful update
      res.redirect('/category'); // Redirect to home page for example
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

const updatebannerpost =
async (req, res) => {
  try {
    console.log(req.body);
  
      // Extract updated category data from request body
      const { head,subhead,buttontext,buttonlink,id} = req.body;

      // Check if there's a file uploaded for the image
      let imageUrl;
      if (req.file) {
        console.log("image uploading");
          // Upload new image to Cloudinary
          const result = await cloudinary.uploader.upload(req.file.path);
          imageUrl = result.secure_url;
      }

      // Build updated category object with Cloudinary image URL if available
      const updatedCategory = {
        head:req.body.bannerHeading,
        subhead:req.body.bannerSubHeading,
        buttontext,buttonlink
      };

      // If there's a new image, add it to the updated category object
      if (imageUrl) {
          updatedCategory.imageUrl = imageUrl;
      }

      // Update category in MongoDB
      const category = await Banner.findByIdAndUpdate(id, updatedCategory, { new: true });

      if (!category) {
          // If category with given ID is not found
          return res.status(404).json({ message: 'Category not found' });
      }

      // Redirect or render as needed after successful update
      res.redirect('/banner'); // Redirect to home page for example
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};



const updatesubcategory =
async (req, res) => {
  try {
    console.log(req.body);
  
      // Extract updated category data from request body
      const { subCategoryName,id} = req.body;

      // Check if there's a file uploaded for the image

      // Build updated category object with Cloudinary image URL if available
      const updatedCategory = {
        subCategoryName,
      };

      // Update category in MongoDB
      const subcategory = await SubCategory.findByIdAndUpdate(id, updatedCategory, { new: true });

      if (!subcategory) {
          // If category with given ID is not found
          return res.status(404).json({ message: 'Sub Category not found' });
      }

      // Redirect or render as needed after successful update
      res.redirect('/category'); // Redirect to home page for example
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};


let producteditpage = async (req, res) => {
  try {
    // Assuming you have the product ID from the URL parameters
    const productId = req.params.id;
    const product = await Product.findById(productId);
    const category = await Category.find();
    const subcategory = await SubCategory.find();
    res.render('admin/editproduct',{data : product,category,subcategory, layout:false} )

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

let categoryeditpage = async (req, res) => {
  try {
    // Assuming you have the product ID from the URL parameters
    const cateid = req.params.id;
    console.log(cateid);
    const category = await Category.findById(cateid);
    console.log(category);

    res.render('admin/updatecate',{category,layout:false} )

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

let subcategoryeditpage = async (req, res) => {
  try {
    // Assuming you have the product ID from the URL parameters
    const cateid = req.params.id;
    console.log(cateid);
    const subcategory = await SubCategory.findById(cateid);
    console.log(subcategory);

    res.render('admin/updatesubcat',{subcategory,layout:false} )

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id; // Extract product ID from request parameters

        // Upload image to Cloudinary if a new image is provided
        let imageUrl;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;
        }

        // Extract stock data from the nested structure
        const stock = {
            S: req.body['stock.S'],
            M: req.body['stock.M'],
            L: req.body['stock.L'],
            XL: req.body['stock.XL'],
            XXL: req.body['stock.XXL']
        };

        // Extract product data (ensure correct field names/structure)
        const { name, variant, mrp, price, description, richdescription, category, subcategory, tags } = req.body;

        // Construct update object based on provided data
        const updateData = {
            name,
            variant,
            mrp,
            price,
            stock,
            tags,
            description,
            richdescription,
            category,
            subcategory
        };

        // If a new image URL is provided, add it to the update object
        if (imageUrl) {
            updateData.image = imageUrl;
        }

        // Find the product by ID and update it with the new data
        const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).redirect('/productm'); // Redirect to product management page
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



let postcategory = async (req, res) => {
  try {
    console.log("entered post category");
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    console.log("got image");

    // Create new category with image URL
    const newCategory = new Category({
      _id: new mongoose.Types.ObjectId(), // Set a new ObjectId for _id
      name: req.body.categoryName,
      imageUrl: result.secure_url // URL of the uploaded image on Cloudinary
    });

    // Save new category to the database
    await newCategory.save();

    res.status(201).redirect('/category');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
let addbanner = async (req, res) => {
  try {
    console.log("entered post category");
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    console.log("got image");

    // Create new category with image URL
    const newCategory = new Banner({
      _id: new mongoose.Types.ObjectId(), // Set a new ObjectId for _id
      head: req.body.bannerHeading,
      subhead: req.body.bannerSubHeading,
      buttontext: req.body.buttontext,
      buttonlink: req.body.buttonlink,
      imageUrl: result.secure_url // URL of the uploaded image on Cloudinary
    });

    // Save new category to the database
    await newCategory.save();

    res.status(201).redirect('/banner');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

let deletecat = async (req, res) => {
  try {
      const categoryId = req.params.id;

      // Find category by ID and delete it
      const deletedCategory = await Category.findByIdAndDelete(categoryId);

      if (!deletedCategory) {
          return res.status(404).json({ message: 'Category not found' });
      }

      res.json({ message: 'Category deleted successfully', deletedCategory });
  } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
}
let deletebanner = async (req, res) => {
  try {
      const categoryId = req.params.id;

      // Find category by ID and delete it
      const deletedCategory = await Banner.findByIdAndDelete(categoryId);

      if (!deletedCategory) {
          return res.status(404).json({ message: 'Category not found' });
      }

      res.json({ message: 'Category deleted successfully', deletedCategory });
  } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
}

let deleteprod = async (req, res) => {
  try {
      const prodId = req.params.id;

      // Find category by ID and delete it
      const product = await Product.findByIdAndDelete(prodId);

      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
      }

      res.json({ message: 'Category deleted successfully', product});
  } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
}
let deletesubcat = async (req, res) => {
  try {
      const subcategoryId = req.params.id;

      // Find category by ID and delete it
      const deletedCategory = await SubCategory.findByIdAndDelete(subcategoryId);

      if (!deletedCategory) {
          return res.status(404).json({ message: 'Category not found' });
      }

      res.json({ message: 'Category deleted successfully', deletedCategory });
  } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
}
let deletecoupon = async (req, res) => {
  try {
      const subcategoryId = req.params.id;

      // Find category by ID and delete it
      const deletedCategory = await Coupon.findByIdAndDelete(subcategoryId);

      if (!deletedCategory) {
          return res.status(404).json({ message: 'Category not found' });
      }

      res.json({ message: 'Category deleted successfully', deletedCategory });
  } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
}



let addSubcategory = async (req, res) => {
  try {
    const newSubCategory = new SubCategory({
      subCategoryName: req.body.subCategoryName,
      parentCategory:req.body.parentCategory
    });
    await newSubCategory.save();
    res.status(201).redirect('/category'); // Redirect to the appropriate route
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

const addCoupon = async (req, res) => {
  try {
      // Extract data from request body
      const { couponCode, couponDescription, discountType, discountValue, expiryDate,startingDate } = req.body;

      // Create a new coupon instance
      const newCoupon = new Coupon({
          couponCode,
          couponDescription,
          discountType,
          discountValue,
          expiryDate,
          startingDate
      });

      // Save the new coupon to the database
      await newCoupon.save();

      res.redirect('/coupon')
  } catch (error) {
      res.status(500).json({ message: 'Failed to add coupon', error: error.message });
  }
};
let updatecoupon = async (req, res) => {
  try {
      const couponId = req.params.id; // Accessing route parameter 'id'
      console.log(couponId);
      const coupon = await Coupon.findById(couponId);
      if (!coupon) {
          return res.status(404).json({ message: 'Coupon not found' });
      }
      res.render('admin/editcoupon', {layout:false, coupon });
  } catch (error) {
      res.status(500).json({ message: 'Failed to fetch coupon', error: error.message });
  }
}

let updatebanner = async (req, res) => {
  try {
      const couponId = req.params.id; // Accessing route parameter 'id'
      console.log(couponId);
      const banner = await Banner.findById(couponId);
      console.log(banner);
      if (!banner) {
          return res.status(404).json({ message: 'Coupon not found' });
      }
      res.render('admin/editbanner', {layout:false, banner});
  } catch (error) {
      res.status(500).json({ message: 'Failed to fetch coupon', error: error.message });
  }
}


let editCoupon = async (req,res)=>
{
  console.log(req.body);
  const {couponCode,couponDescription,discountType,discountValue,expiryDate,id,startingDate}= req.body;
  const updateddata = {
    couponCode,couponDescription,discountType,discountValue,expiryDate,startingDate
  }
  const updatedProduct = await Coupon.findByIdAndUpdate(id, updateddata, { new: true });
  if (!updatedProduct) {
    return res.status(404).json({ message: 'couponCodeuct not found' });
}

res.status(200).redirect('/coupon'); // Redirect to product management page
}

let orderview = async (req, res) => {
  const orderId = req.query.orderId;
  try {
    
    const order = await Order.findOne({ orderId }); // Find the order by its ID
    if (!order) {
      return res.status(404).send('Order not found');
  }
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
        // Assign product details to the item
        item.product = product;
    }
}

    res.render('admin/orderDetails', {layout :"adminLayout.hbs", order });
} catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving order details');
}
}
 let placeorder = async (req, res) => {
  try {
    
      // Assuming req.body contains the order data
      const orderData = req.body;
      const result = await Userhelpers.pushOrder(orderData);
      res.json({ success: true, result });
  } catch (error) {
      console.error('Failed to push order:', error);
      res.status(500).json({ success: false, error: 'Failed to push order' });
  }
}
 let outadmin = async (req, res) => {
  if (req.session) {
    req.session.destroy();
    console.log("session and cookies are cleared");
  }
  res.clearCookie("admin_jwt");
  res.redirect("/admin");
}



const downloadcsv = async (req, res) => {
  try {
    console.log("reqingg");
      // Get the start and end dates from the query parameters
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      console.log(startDate,endDate)

      // Fetch sales data from the database between the specified dates
      const salesData = await Order.find({
          orderDate: { $gte: startDate, $lte: endDate }
      }, { orderId: 1, totalAmount: 1, orderDate: 1, paymentMethod: 1 });
      console.log(salesData);
      // Convert the data to CSV format
      const csvWriter = createObjectCsvWriter({
          path: 'public/salesdata.csv', // Adjusted path
          header: [
              { id: 'orderId', title: 'Order ID' },
              { id: 'totalAmount', title: 'Total Amount' },
              { id: 'orderDate', title: 'Order Date' },
              { id: 'paymentMethod', title: 'Payment Method' }
          ]
      });
      await csvWriter.writeRecords(salesData);

      // Stream the file to the client for download
      const file = `public/salesdata.csv`;
      res.download(file, 'public/salesdata.csv', (err) => {
          if (err) {
              console.error(err);
              res.status(500).send('Internal Server Error');
          }
          // No need to unlink the file as it's served statically from the public directory
      });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
}

module.exports = {downloadcsv,outadmin,sign,loginRequestOTP,loginotp,orderview,updatebannerpost,updatebanner,deletebanner,addbanner,editCoupon,updatecoupon,deletecoupon,addCoupon,updatesubcategory,subcategoryeditpage,categoryeditpage,editproduct,deleteprod,deletesubcat,updatecategory,producteditpage,updateProduct,addSubcategory,deletecat,postcategory,postaddproduct,homePage,logIn,Forget,order,productm,addproduct,coupon,categories,banner,payments,settings,profile,placeorder}