const express=require('express')
const router=express.Router()
const userControllers=require('../controllers/user')
const {userLogined} = require('../middleware/jwt')
const {authMiddleware} = require('../middleware/auth')

router.get('/',userControllers.homePage)
router.get('/contact',userControllers.contact)
router.get('/about',userControllers.about)
router.get('/product',userControllers.product)
router.get('/productdetail',userControllers.productdetail)
router.get('/cart',userControllers.cart)
router.get('/help',userControllers.help)
router.get('/wishlist',authMiddleware,userControllers.wishlist)
router.get('/userprofile',authMiddleware,userControllers.userprofile)
router.get('/checkout',authMiddleware,userControllers.checkout)
router.get('/paymetn',authMiddleware,userControllers.payment)
router.get('/ordercomplete',authMiddleware,userControllers.ordercomplete)
router.get('/login',userControllers.signin)
router.get('/signup',userControllers.signup)
router.get('/forget',userControllers.forgetpass)
router.get('/invoice',userControllers.invoice)

router.post('/signup',userControllers.signUpPostPage);
router.post('/login', userControllers.loginPostPage);

router.get('/logout',userControllers.logoutPage)
router.get('/resetpass',userControllers.ResetPassword)

module.exports=router;