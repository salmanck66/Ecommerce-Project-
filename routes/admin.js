const express=require('express')
const router=express.Router()
const adminControllers=require('../controllers/admin')
const cloudinary = require('../utils/cloudinery')
const multer = require('multer');
const upload = multer({ dest: 'uploads/'});
const axios = require('axios');


router.get('/admin',adminControllers.loginotp)
router.post('/send-otp-phone-admin',adminControllers.loginRequestOTP)
router.post('/login-with-otp-admin',adminControllers.sign)

router.get('/admin',adminControllers.logIn)
router.get('/forget',adminControllers.Forget)
router.get('/dashboard',adminControllers.homePage)
router.get('/orders',adminControllers.order)
router.get('/productm',adminControllers.productm)
router.get('/addproduct',adminControllers.addproduct)
router.get('/coupon',adminControllers.coupon)
router.get('/category',adminControllers.categories)
router.get('/banner',adminControllers.banner)
router.get('/payments',adminControllers.payments)
router.get('/settings',adminControllers.settings)
router.get('/profile',adminControllers.profile)
router.get('/order',adminControllers.orderview)

router.get('/edit-product/:id',adminControllers.producteditpage)
router.post('/add-product',upload.array('productImage',3),adminControllers.postaddproduct)
router.post('/edit-product',upload.single('productImage'),adminControllers.editproduct)
router.delete('/delete-product/:id',adminControllers.deleteprod)

router.get('/update-category/:id',adminControllers.categoryeditpage)
router.delete('/category/:id',adminControllers.deletecat)
router.post('/add-category',upload.single('categoryImage'),adminControllers.postcategory)
router.post('/update-category', upload.single('categoryImage'), adminControllers.updatecategory);


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