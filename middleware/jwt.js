const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    { 
      _id: user._id,
      email: user.email 
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d' // Token expires in 1 day
    }
  );
}