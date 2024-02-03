const express=require('express')
const router=express.Router()
const adminControllers=require('../controllers/admin')

router.get('/admin',adminControllers.logIn)
router.get('/forget',adminControllers.Forget)
router.get('/dashboard',adminControllers.homePage)

module.exports=router;