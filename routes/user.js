const express=require('express')
const router=express.Router()
const userControllers=require('../controllers/user')

router.get('/',userControllers.homePage)
router.get('/contact',userControllers.contact)
router.get('/about',userControllers.about)
router.get('/product',userControllers.product)
router.get('/productdetail',userControllers.productdetail)

module.exports=router;