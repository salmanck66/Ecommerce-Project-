const express=require('express')
const router=express.Router()
const userControllers=require('../controllers/user')
const {userLogined} = require('../middleware/jwt')
const {authMiddleware} = require('../middleware/auth')
const { isInWishlist } = require('../helpers/userhelper');


const passport = require('passport');
require("../passport")
router.use(passport.initialize())
router.use(passport.session())

router.get('/auth/google' , passport.authenticate('google', { scope: 
	[ 'email', 'profile' ] 
})); 

// Auth Callback 
router.get( '/auth/google/callback', 
	passport.authenticate( 'google', { 
		successRedirect: '/', 
		failureRedirect: '/login'
}));

router.get('/',userControllers.homePage)

router.get('/contact',userControllers.contact)
router.get('/about',userControllers.about)
router.get('/product',userControllers.product)
router.get('/productdetail',userControllers.productdetail)
router.get('/help',userControllers.help)
router.get('/wishlist',authMiddleware,userControllers.wishlist)
router.get('/userprofile',authMiddleware,userControllers.userprofile)
router.get('/checkout',authMiddleware,userControllers.checkout)
router.get('/ordercomplete',authMiddleware,userControllers.ordercomplete)
router.get('/orderview',authMiddleware,userControllers.orderview)
router.get('/login',userControllers.loginGetPage)
router.get('/signup',userControllers.signup)
router.get('/forget',userControllers.forgetpass)
router.get('/cart',authMiddleware,userControllers.viewCart)
router.post('/add-to-cart',authMiddleware,userControllers.addtocart)
router.post('/updateQuantity',authMiddleware,userControllers.updatecart)
router.post('/removeItem',authMiddleware,userControllers.removeCartItem)

router.post('/add-to-wishlist',authMiddleware,userControllers.addtowishlist)

router.post('/apply-coupon',authMiddleware,userControllers.discount)
router.post('/proceed-checkout',authMiddleware,userControllers.pcheckout)
router.post('/final-checkout',authMiddleware,userControllers.fcheckout)

router.post('/signup',userControllers.signUpPostPage);
router.post('/login', userControllers.loginPostPage);

router.get('/logout',userControllers.logoutPage)
router.get('/resetpass',userControllers.ResetPassword)
router.delete('/wishlist/:productId',authMiddleware,userControllers.delwish)
module.exports=router;