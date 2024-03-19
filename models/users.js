const mongoose = require('mongoose');

const userLoginSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    mail: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    addresses: [
        {
            addressLine1: { type: String, required: true },
            addressLine2: { type: String },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zip: { type: String, required: true }
        }
    ]
}, { timestamps: true, versionKey: false });

const User = mongoose.model('users', userLoginSchema);

module.exports = User;