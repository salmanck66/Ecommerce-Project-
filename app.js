const express = require('express');
const  Toastify = require('toastify-js')
const app = express()
handlebars = require("./helpers/hbs")
// const morgan = require("morgan") 
const {parsed:config} = require('dotenv').config()
global.config = config
const path = require('path');
const session = require('express-session')
const userRouter=require('./routes/user')
const adminRouter=require('./routes/admin')
var hbs =require('express-handlebars')
var jwt =require('jsonwebtoken')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const multer = require('./middleware/multer');
const {isInWishlist} = require("./helpers/userhelper");



app.engine('hbs',
  hbs.engine({
  handlebars: allowInsecurePrototypeAccess(require('handlebars')),
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, '/views/layout/'),
  partialsDir: path.join(__dirname, '/views/partials/'),
  helpers: {
    isInWishlist: (userId, productId) => isInWishlist(userId, productId)
    // You can also directly pass the function reference if it doesn't require additional parameters:
    // isInWishlist
}
}));

app.use(session({   //FOR GOOGLE VERIFICATION
  secret: 'hihello',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.set('view engine', 'hbs');
app.set('views', './views');
app.use(cookieParser()); 
// app.use(morgan('tiny'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));  


app.use('/',userRouter)
app.use('/',adminRouter)


mongoose.connect(config.CONNECTION_STRING,{
  dbName:'eshop'
})
.then((data)=>
{ 
  console.log("DB Connected");
}).catch((err)=>
{
  console.log(err);
})



app.listen(config.PORT,()=>
{
    console.log("Sever is listening");
})