const userLoginSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    mail:{type:String,unique:true,required:true},
    password: { type: String, required: true },
    phoneNumber:{type:String,},
    profilePicture:{type:String},
    status:{type:String},
    otp:{type:String},
    address:[addressSchema],
},{timestamps: true,versionKey:false});