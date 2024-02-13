const express=require('express')
const router=express.Router()
const adminControllers=require('../controllers/admin')
const cloudinary = require('../utils/cloudinery')
const multer = require('multer');
const upload = multer({ dest: 'uploads/'});


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

router.post('/add-product',upload.single('productImage'),adminControllers.postaddproduct)

router.post('/add-category',upload.single('categoryImage'),adminControllers.postcategory)
router.delete('/category/:id',adminControllers.deletecat)
router.put('/category/:id',adminControllers.updatecat)

router.post('/add-subcategory',adminControllers.addSubcategory)

module.exports=router;