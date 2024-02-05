const express=require('express')
const router=express.Router()
const userControllers=require('../controllers/user')

router.get('/',userControllers.homePage)
router.get('/contact',userControllers.contact)
router.get('/about',userControllers.about)
router.get('/product',userControllers.product)
router.get('/productdetail',userControllers.productdetail)
router.get('/cart',userControllers.cart)
router.get('/help',userControllers.help)
router.get('/wishlist',userControllers.wishlist)
router.get('/userprofile',userControllers.userprofile)
router.get('/checkout',userControllers.checkout)
router.get('/ordercomplete',userControllers.ordercomplete)
router.get('/login',userControllers.signin)
router.get('/signup',userControllers.signup)
router.get('/forget',userControllers.forgetpass)
router.get('/invoice',userControllers.invoice)

router.post('/signup',userControllers.signup);
router.post('/signin', userControllers.signin);

module.exports=router;