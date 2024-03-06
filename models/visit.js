const mongoose = require('mongoose');
const visitSchema = new mongoose.Schema({
    count: {
        type: Number,
        default: 0
    }
  });
  
  // Create a model based on the schema
  const Visit = mongoose.model('Visit', visitSchema);

  module.exports =  Visit;