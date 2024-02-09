const mongoose = require('mongoose');
const userLoginSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    mail:{type:String,unique:true,required:true},
    password: { type: String, required: true },
    phoneNumber:{type:String,},
},{timestamps: true,versionKey:false});

const user=mongoose.model('users',userLoginSchema);

module.exports=user;