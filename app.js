require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const hbs = require('express-handlebars');
const jwt = require('jsonwebtoken');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { isInWishlist } = require("./helpers/userhelper");


app.set('view engine', 'hbs');
app.set('views', './views');
app.use(cookieParser()); 
// app.use(morgan('tiny'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public'))); 


app.engine('hbs',
  hbs.engine({
  handlebars: allowInsecurePrototypeAccess(require('handlebars')),
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, '/views/layout/'),
  partialsDir: path.join(__dirname, '/views/partials/'),
  helpers: {
    isInWishlist: (userId, productId) => isInWishlist(userId, productId)
}
}));


app.use('/',userRouter)
app.use('/',adminRouter)
app.use((req,res,next)=>
{
  res.status(404).render("error",{message:"Not Found",layout:false});
})


mongoose.connect(process.env.CONNECTION_STRING,{
  dbName:'eshop'
})
.then((data)=>
{ 
  console.log("DB Connected");
}).catch((err)=>
{
  console.log(err);
})



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
