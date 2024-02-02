const express = require('express');
const app = express()
const PORT =  3000
const path = require('path');
const userRouter=require('./routes/user')
const adminRouter=require('./routes/admin')
var hbs =require('express-handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')

app.engine('hbs',
  hbs.engine({
  handlebars: allowInsecurePrototypeAccess(require('handlebars')),
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, '/views/layout/'),
  partialsDir: path.join(__dirname, '/views/partials/')
}));

app.set('view engine', 'hbs');
app.set('views', './views');






app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));  

app.use('/',userRouter)
app.use('/',adminRouter)

app.listen(PORT,()=>
{
    console.log("Sever is listening");
})