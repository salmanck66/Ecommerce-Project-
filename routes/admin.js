const express=require('express')
const router=express.Router()
const adminControllers=require('../controllers/admin')
const cloudinary = require('../utils/cloudinery')
const multer = require('multer');
const upload = multer({ dest: 'uploads/'});
const axios = require('axios');
const {isAdmin,authMiddlewareAdmin} = require('../middleware/auth')



router.get('/admin',adminControllers.loginotp)
router.post('/send-otp-phone-admin',adminControllers.loginRequestOTP)
router.post('/login-with-otp-admin',adminControllers.sign)
router.get('/adminlogout',adminControllers.outadmin)


router.get('/dashboard',authMiddlewareAdmin,adminControllers.homePage)
router.get('/orders',authMiddlewareAdmin,adminControllers.order)
router.get('/productm',authMiddlewareAdmin,adminControllers.productm)
router.get('/addproduct',authMiddlewareAdmin,adminControllers.addproduct)
router.get('/coupon',authMiddlewareAdmin,adminControllers.coupon)
router.get('/category',authMiddlewareAdmin,adminControllers.categories)
router.get('/banner',authMiddlewareAdmin,adminControllers.banner)
router.get('/payments',authMiddlewareAdmin,adminControllers.payments)
router.get('/settings',authMiddlewareAdmin,adminControllers.settings)
router.get('/profile',authMiddlewareAdmin,adminControllers.profile)
router.get('/order',authMiddlewareAdmin,adminControllers.orderview)

router.get('/downloadcsv',authMiddlewareAdmin,adminControllers.downloadcsv)

router.get('/edit-product/:id',authMiddlewareAdmin,adminControllers.producteditpage)
router.post('/add-product',authMiddlewareAdmin,upload.array('productImage',3),adminControllers.postaddproduct)
router.post('/edit-product',authMiddlewareAdmin,upload.array('productImage',3),adminControllers.editproduct)
router.delete('/delete-product/:id',authMiddlewareAdmin,adminControllers.deleteprod)

router.get('/update-category/:id',authMiddlewareAdmin,adminControllers.categoryeditpage)
router.delete('/category/:id',authMiddlewareAdmin,adminControllers.deletecat)
router.post('/add-category',authMiddlewareAdmin,upload.single('categoryImage'),adminControllers.postcategory)
router.post('/update-category',authMiddlewareAdmin, upload.single('categoryImage'), adminControllers.updatecategory);


router.get('/update-subcategory/:id',adminControllers.subcategoryeditpage)
router.post('/add-subcategory',adminControllers.addSubcategory)
router.delete('/subcatcategory/:id',adminControllers.deletesubcat)
router.post('/update-subcategory',adminControllers.updatesubcategory);

router.get('/update-coupon/:id',adminControllers.updatecoupon)
router.post('/add-coupon',adminControllers.addCoupon)
router.delete('/deletecoupon/:id',adminControllers.deletecoupon)
router.post('/update-coupon',adminControllers.editCoupon)

router.get('/update-banner/:id',adminControllers.updatebanner)
router.post('/add-banner',upload.single('bannerimage'),adminControllers.addbanner)
router.delete('/delete-banner/:id',adminControllers.deletebanner)
router.post('/update-banner', upload.single('bannerimage'), adminControllers.updatebannerpost);

router.post('/place-order',adminControllers.placeorder);




module.exports=router;