const express=require('express')
const router=express.Router()
const adminControllers=require('../controllers/admin')

router.get('/admin',adminControllers.logIn)
router.get('/forget',adminControllers.Forget)
router.get('/dashboard',adminControllers.homePage)
router.get('/orders',adminControllers.order)
router.get('/productm',adminControllers.productm)

module.exports=router;