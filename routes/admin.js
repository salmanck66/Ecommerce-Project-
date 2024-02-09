const express=require('express')
const router=express.Router()
const adminControllers=require('../controllers/admin')

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

router.post('/add-product',adminControllers.postaddproduct)
router.post('/add-product',adminControllers.postcategory)

module.exports=router;