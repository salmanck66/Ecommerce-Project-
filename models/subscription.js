const mongoose = require('mongoose');

// Define a schema for email subscriptions
const subscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Email address is required and must be unique
  createdAt: { type: Date, default: Date.now }, // Timestamp for when the subscription was created
});

// Create a model based on the schema
const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
