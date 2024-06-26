const jwt = require('jsonwebtoken');
const env = require('dotenv').config()


module.exports = {
  signUser: (user) => {
      return new Promise((resolve, reject) => {
          const jwtKey = process.env.JWT_KEY
          const payLoad = {
              userId: user._id,
              userName: user.userName,
          }
          jwt.sign(payLoad, jwtKey, { expiresIn: '2h' }, (error, token) => {
              if (error) {
                  reject(error)
              } else {
                  resolve(token)
              }
          })
      })
  },

  signAdmin: (user) => {
      return new Promise((resolve, reject) => {
          const jwtKey = process.env.JWT_KEY_ADMIN
          const payLoad = {
              userId: user._id,
              userName: user.userName,
              isAdmin: user.isAdmin,
          }
          jwt.sign(payLoad, jwtKey, { expiresIn: '2h' }, (error, token) => {
              if (error) {
                  reject(error)
              } else {
                  resolve(token)
              }
          })
      })
  },



  verifyUser: (recievedToken) => {
      return new Promise((resolve, reject) => {
          const jwtKey = process.env.JWT_KEY
          jwt.verify(recievedToken, jwtKey, (error, decodedToken) => {
              if (error) {
                  console.error("some problems occured during jwt verification", error);
                  reject(error)
              } else {
                  // console.log("DECODED TOKEN DETAILS FROM REQUEST " ,decodedToken);
                  console.log("SUCCESSFULLY DECODED TOKEN DETAILS FROM USER REQUEST  *FROM MIDDLEWARE JWT* ");
                  resolve(decodedToken)
              }
          })
      })
  }

  ,verifyAdmin :(recievedToken) => {
      return new Promise((resolve, reject) => {
          const jwtKey = process.env.JWT_KEY_ADMIN
          jwt.verify(recievedToken, jwtKey, (error, decodedToken) => {
              if (error) {
                  console.error("some problems occured during jwt verification", error);
                  reject(error)
                  return res.redirect('/admin');
              } else {
                  // console.log("DECODED TOKEN DETAILS FROM REQUEST " ,decodedToken);
                  console.log("SUCCESSFULLY DECODED TOKEN DETAILS FROM USER REQUEST  *FROM MIDDLEWARE JWT* ");
                  resolve(decodedToken)
              }
          })
      })
  }
}