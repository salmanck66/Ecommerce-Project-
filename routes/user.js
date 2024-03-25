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
router.get('/wishlistprofile',authMiddleware,userControllers.wishlistprofile)
router.get('/userprofile',authMiddleware,userControllers.userprofile)
router.get('/checkout',authMiddleware,userControllers.checkout)
router.get('/ordercomplete',authMiddleware,userControllers.ordercomplete)
router.get('/orderview',authMiddleware,userControllers.orderview)
router.get('/login',userControllers.loginGetPage)
router.get('/signup',userControllers.signup)
router.get('/forget',userControllers.forgetpass)
router.get('/signotp',userControllers.loginotp)
router.get('/trackorder',userControllers.tracking)
router.get('/search',userControllers.search)
router.post('/searchproduct',userControllers.searchproduct)
router.post('/update-status',userControllers.orderstatus)

router.get('/category/:categoryName' , userControllers.showCategoryProducts )
router.get('/categoryget' , userControllers.showcatprod )
router.get('/sort/:sortType' , userControllers.sort )
router.get('/clubs/:clubname' , userControllers.teamfilter )

router.get('/cart',authMiddleware,userControllers.viewCart)
router.post('/add-to-cart',authMiddleware,userControllers.addtocart)
router.post('/updateQuantity',authMiddleware,userControllers.updatecart)
router.post('/removeItem',authMiddleware,userControllers.removeCartItem)
router.post('/updateprofile',authMiddleware,userControllers.updateprofile)
router.get('/shippingadr',authMiddleware,userControllers.shippingadr)
router.post('/delete-address',authMiddleware,userControllers.delAddress)

router.post('/add-to-wishlist',authMiddleware,userControllers.addtowishlist)

router.post('/apply-coupon',authMiddleware,userControllers.discount)
router.post('/proceed-checkout',authMiddleware,userControllers.pcheckout)
router.post('/final-checkout',authMiddleware,userControllers.fcheckout)

router.post('/signup',userControllers.signUpPostPage);
router.post('/login', userControllers.loginPostPage);

router.get('/logout',userControllers.logoutPage)
router.get('/resetpass',userControllers.ResetPassword)
router.post('/resetpassload',userControllers.ResetPasswordPostFinal)
router.post('/forgot-password',userControllers.ResetPasswordPost)
router.post('/verify-otp-reset-pass',userControllers.verifyotp)

router.post('/send-otp-phone',userControllers.loginRequestOTP)
router.post('/login-with-otp',userControllers.sign)

router.delete('/wishlist/:productId',authMiddleware,userControllers.delwish)
router.delete('/cancel-order/:orderId',authMiddleware,userControllers.delorder)

router.post('/payment',userControllers.paymetController)

module.exports=router;