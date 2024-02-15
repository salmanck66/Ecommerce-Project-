const cloudinary = require('../utils/cloudinery');
const Category = require('../models/category')
const SubCategory = require('../models/subcategory')
const Product  = require('../models/product')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const mongoose = require('mongoose');
const { product } = require('./user');



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
let coupon = (req, res) => {
    console.log("admin coupn management");
    res.render('admin/coupons',{layout:"adminLayout.hbs"})
  }

let banner = (req, res) => {
    console.log("admin banner management");
    res.render('admin/banner',{layout:"adminLayout.hbs"})
  }
let payments = (req, res) => {
    console.log("admin banner management");
    res.render('admin/payments',{layout:"adminLayout.hbs"})
  }
let settings = (req, res) => {
    console.log("admin banner management");
    res.render('admin/settings',{layout:"adminLayout.hbs"})
  }
let profile = (req, res) => {
    console.log("admin banner management");
    res.render('admin/profile',{layout:"adminLayout.hbs"})
  }

  let  editproduct = async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    try {
      // Extract product ID from request parameters
      
  
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
      let imageUrl;
      if (req.file) {
        // Upload new image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path);
        imageUrl = result.secure_url;
      }
  
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
      if (imageUrl) {
        updatedProduct.image = imageUrl;
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
      const result = await cloudinary.uploader.upload(req.file.path);
  
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
        image: result.secure_url,
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



module.exports = {categoryeditpage,editproduct,deleteprod,deletesubcat,updatecategory,producteditpage,updateProduct,addSubcategory,deletecat,postcategory,postaddproduct,homePage,logIn,Forget,order,productm,addproduct,coupon,categories,banner,payments,settings,profile}