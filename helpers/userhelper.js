const User = require('../models/users')
const Cart = require('../models/cart')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const springedge = require("springedge");
dotenv.config();
const mongoose = require('mongoose');
var objectId =require('mongodb').ObjectId
const util = require('util');
const { product } = require('../controllers/user');
const { response } = require('express');
const Wishlist = require("../models/wishlist")
const Counter = require("../models/counter")
const Handlebars = ("handlebars");
const razorpay = require('razorpay');
const axios = require('axios');

function signupHelper(recievedUserData) {
    const { firstName, lastName, mail, phoneNumber, password } = recievedUserData
    return new Promise(async (resolve, reject) => {
      try {
        const existingUser = await User.findOne({
          $or: [
            { mail: mail },
            { phoneNumber: phoneNumber }
          ]
        });
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
  
  let razorpayInstanceHelp =  new razorpay(
    {
      key_id :process.env.RZPAY_KEY,
      key_secret:process.env.RZPAY_KEY_SECRET
    }
    )
  let loginHelper = async (recievedUserData) => {
    try {
      const { mail, password } = recievedUserData
      let existingUser = await User.findOne({ mail: mail })
      if(existingUser.isAdmin == true)
      {
        return {admin:true}
      }
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
  let getNextOrderNumber = async () => {
    // Find the counter
    let counter = await Counter.findOne({ name: 'orderNumber' });

    // If the counter doesn't exist, create it with an initial value of 5000
    if (!counter) {
        counter = await Counter.create({ name: 'orderNumber', value: 5000 });
    }

    // Increment the counter value and return the incremented value
    return Counter.findOneAndUpdate(
        { name: 'orderNumber' },
        { $inc: { value: 1 } },
        { new: true }
    ).then(updatedCounter => updatedCounter.value);
}

function changePasswordHelper(userData) {
  const { email, newPassword } = userData;
  return new Promise(async (resolve, reject) => {
      try {
          const existingUser = await User.findOne({ mail: email });
          if (existingUser) {
              const hashedPassword = await bcrypt.hash(newPassword, 10);
              existingUser.password = hashedPassword;
              await existingUser.save();
              resolve({ success: true });
          } else {
              resolve({ userNotFound: true });
          }
      } catch (error) {
          reject(error);
      }
  });
}


  const API_BASE_URL = 'https://shipping-api.com/app/api/v1';

  async function pushOrder(orderData) {
      try {
          const response = await axios.post(`${API_BASE_URL}/push-order`, orderData, {
              headers: {
                  'public-key':process.env.PUBLIC_KEY_SHIP,
                  'private-key': process.env.PRIVATE_KEY_SHIP,
                  'Content-Type': 'application/json'
              }
          });
          return response.data;
      } catch (error) {
          console.error('Error pushing order:', error.response ? error.response.data : error.message);
          throw error;
      }
  }
  
  // Example order data
  const orderData = {
      // Fill with your order data according to your schema
  };
  
  // pushOrder(orderData)
  //     .then(result => {
  //         console.log('Order pushed successfully:', result);
  //     })
  //     .catch(error => {
  //         console.error('Failed to push order:', error);
  //     });


      function sendOTP(phoneNumber, otp) {
        const message = `Hello ${otp}, This is a test message from spring edge`
      
        const params = {
          sender: "SEDEMO",
          apikey: process.env.SPRING_EDGE_KEY,
          to: [`${phoneNumber}`],
          message: message,
          format: "json",
        };
      
        springedge.messages.send(params, 5000, function (err, response) {
          if (err) {
            return console.log(err);
          }
          console.log(response);
        });
      }
      

module.exports = {
  sendOTP, signupHelper, loginHelper,addToCart,getNextOrderNumber,changePasswordHelper,pushOrder,razorpayInstanceHelp
  }