const express = require('express');
const app = express()
const path = require('path');
const userRouter=require('./routes/user')
const adminRouter=require('./routes/admin')
var hbs=require('express-handlebars')

app.set('view engine', 'hbs');
app.set('views', './views');

const PORT =  3000


app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));

app.use('/',userRouter)
app.use('/',adminRouter)

app.listen(PORT,()=>
{
    console.log("Sever is listening");
})