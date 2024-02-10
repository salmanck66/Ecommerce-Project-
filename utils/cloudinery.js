const cloudinary=require('cloudinary').v2;    
cloudinary.config({ 
  cloud_name: process.env.cloud_name || 'dzpolmsmy', 
  api_key: process.env.api_key || 147881859985753, 
  api_secret: process.env.api_secret || "0jVc1d0Hh_VB5zs2bp7NyjItRFE"
});
module.exports= cloudinary;