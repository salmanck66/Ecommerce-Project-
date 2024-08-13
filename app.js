const express = require('express');
const Toastify = require('toastify-js');
const app = express();
const handlebars = require("./helpers/hbs");
const dotenv = require('dotenv')
const path = require('path');
const session = require('express-session');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const hbs = require('express-handlebars');
const jwt = require('jsonwebtoken');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const multer = require('./middleware/multer');
const { isInWishlist } = require("./helpers/userhelper");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Middleware setup
app.use(session({   // FOR GOOGLE VERIFICATION
  secret: 'hihello',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  (username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.verifyPassword(password)) { return done(null, false); }
      return done(null, user);
    });
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  // Lookup user by id in database
  User.findById(id, (err, user) => done(err, user));
});

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
    // You can also directly pass the function reference if it doesn't require additional parameters:
    // isInWishlist
}
}));

// Register the helper function with Handlebars

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

console.log('Connection String:', process.env.CONNECTION_STRING);


app.listen(process.env.PORT,()=>
{
    console.log("Sever is listening");
})