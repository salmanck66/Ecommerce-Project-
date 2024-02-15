const express=require('express')
const router=express.Router()
const adminControllers=require('../controllers/admin')
const cloudinary = require('../utils/cloudinery')
const multer = require('multer');
const upload = multer({ dest: 'uploads/'});
const axios = require('axios');


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

router.get('/edit-product/:id',adminControllers.producteditpage)
router.post('/add-product',upload.single('productImage'),adminControllers.postaddproduct)
router.put('/edit-product/:id',upload.single('productImage'),adminControllers.updateProduct)
router.delete('/delete-product/:id',adminControllers.deleteprod)

router.delete('/category/:id',adminControllers.deletecat)
router.post('/add-category',upload.single('categoryImage'),adminControllers.postcategory)
router.put('/category/:categoryId', upload.single('categoryImage'),adminControllers.updatecategory)


router.post('/add-subcategory',adminControllers.addSubcategory)
router.delete('/subcatcategory/:id',adminControllers.deletesubcat)

module.exports=router;