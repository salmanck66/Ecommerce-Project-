const User = require('../models/users')
const Cart = require('../models/cart')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
dotenv.config();
const mongoose = require('mongoose');
var objectId =require('mongodb').ObjectId
const util = require('util');
const { product } = require('../controllers/user');
const { response } = require('express');
const Wishlist = require("../models/wishlist")
const Counter = require("../models/counter")
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
  let addToCart = (proId, userId) => {
    return new Promise(async (res, rej) => {
      let userCart = await db.get().collection(collection.Cart).findOne({ user: objectId(userId) });
      if (userCart) {
        // Handle existing user cart
      } else {
        let cartObj = {
          user: objectId(userId),
          products: [objectId(proId)]
        };
        db.get().collection(collection.Cart).insertOne(cartObj).then(() => {
          res.redirect('/');
        });
      }
    });
  };
  let getNextOrderNumber = async ()=> {
    // Find and increment the counter
    const counter = await Counter.findOneAndUpdate(
        { name: 'orderNumber' },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
    );

    // Return the incremented counter value as the order number
    return counter.value;
}
  
module.exports = {
     signupHelper, loginHelper,addToCart,getNextOrderNumber
  }