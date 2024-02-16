const mongoose = require('mongoose');
const bannerSchema = new mongoose.Schema({
    head: {
        type: String,
        required: true
      },
    subhead: {
        type: String,
        required: true
      },
    buttontext: {
        type: String,
        required: true
      },
    buttonlink: {
        type: String,
        required: true
      },
    imageUrl: {
        type: String,
        required: true
      },
})
const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;