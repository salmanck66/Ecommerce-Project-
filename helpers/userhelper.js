const User = require('../models/users')
const Cart = require('../models/cart')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
dotenv.config();
var objectId =require('mongodb').ObjectId
const util = require('util');
const { product } = require('../controllers/user');
const { response } = require('express');
const Wishlist = require("../models/wishlist")
const Handlebars = ("handlebars");

function signupHelper(recievedUserData) {
    const { firstName, lastName, mail, phoneNumber, password } = recievedUserData
    return new Promise(async (resolve, reject) => {
      try {
        const existingUser = await User.findOne({ mail: mail })
        if (!existingUser) {
          const hashedPassword = await bcrypt.hash(password, 10)
          const user = new User({
            userName: `${firstName} ${lastName}`,
            mail: mail,
            password: hashedPassword,
            phoneNumber: phoneNumber,
            status: "Active",
          });
          user.save();
          resolve({ success: true, user })
        } else {
          resolve({ mailExist: true })
        }
  
      } catch (error) {
        reject(error)
      }
    })
  }
  
  
  let loginHelper = async (recievedUserData) => {
    try {
      const { mail, password } = recievedUserData
      let existingUser = await User.findOne({ mail: mail })
      if (existingUser) {
        const passwordMatch = await bcrypt.compare(password, existingUser.password)
        if (!passwordMatch) {
          return { passwordMismatch: true }
        } else {
          if (existingUser.status === 'Block') {
            return { blockedUser: true, existingUser }
          }
          return { verified: true, existingUser }
        }
      } else {
        return { invalidUsername: true }
      }
  
    } catch (error) {
      throw error;
    }
  }
  let  addToCart =  (proId,userId)=>
  {
    return new Promise(async(res,rej)=>
    {
      let usercart = await db.get().collection(collection.Cart.findOne({user:objectId(userId)}))
      if(usercart)
      {

      }else
      {
        let cartobj =
        {
          user:objectId(userId),
          products:[objectId(proId)]
        }
        db.get.collection(collection.Cart).insertOne(cartObj).then(()=>
        {
          res.redirect('/')
        })
      }
    })
  }

  const isInWishlist = async (userId, productId) => {

    try {
  
      const wishlist = await Wishlist.findOne({ user: userId });
  
      if (!wishlist) {
  
        return false;
  
      }
  
      return wishlist.products.includes(productId);
  
    } catch (error) {
  
      console.error('Error checking wishlist:', error);
  
      throw error;
  
    }
  
  };
  
  



  
module.exports = {
     signupHelper, loginHelper,addToCart,isInWishlist
  }