const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

//load routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// Passport Config
require('./config/passport')(passport);
// DB import

const db = require('./config/database');

// map global promise
mongoose.Promise = global.Promise;


// Mongoose Connection
mongoose.connect(db.mongoURI).then(()=>{
    console.log('mongoDb connected');
}).catch((err)=>{
    console.log(err); 
})


// Initialising express
var app = express();

//HandleBars Middelware
app.engine('handlebars',exphbs({defaultLayout:'main'}));
app.set('view engine','handlebars');

//Body Parser Middelware
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

//Method override Middelware
app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))
// express session Middelware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))

//Passport Initializers
app.use(passport.initialize());
app.use(passport.session());

//Connect Flash
app.use(flash());
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null ;

    next();
})

// Routes

app.get('/',(req,res)=>{
    title = "Welcome"
    res.render("index",{
        title : title
    });
})

app.get('/about',(req,res)=>{
    res.send("</h1>About Page</h1>")
});

//Use routes
app.use('/ideas',ideas);

app.use('/users',users)

const port = process.env.PORT || 5000

app.listen(port,()=>{
    console.log(`app running on port ${port}`); 
})