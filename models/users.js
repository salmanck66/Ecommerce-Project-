const mongoose = require('mongoose');

const userLoginSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    mail: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    addresses: [
        {
            firstName: { type: String, required: true },
            lastName: { type: String },
            email: { type: String, required: true },
            phonenumber: { type: String, required: true },
            address: { type: String, required: true }, // Include address field
            address2: { type: String},
            state: { type: String, required: true },
            zip: { type: String, required: true },
        }
    ]
}, { timestamps: true, versionKey: false });

const User = mongoose.model('users', userLoginSchema);

module.exports = User;