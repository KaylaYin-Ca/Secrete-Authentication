//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParer = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");



const app = express();

// console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParer.urlencoded({
  extended: true
}));
// Notice: the code order
// initialized session
app.use(session({
  secret: 'MY SECRET',
  resave: false,
  saveUninitialized: true
}))
// use passport to deal with the sessions
app.use(passport.initialize());
app.use(passport.session());

//=============Mongoose===============
const dbUrl = "mongodb://localhost:27017/userDB"
mongoose.connect(dbUrl, {
  useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
// use this plugin to hash and salt password.
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//============Req & Res===============
app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login", {
    loginResult: ""
  });
});

app.post("/login", function(req, res) {
  const userName = req.body.username;
  const userPassword = req.body.password;

  const user = new User({
    username:userName,
    password:userPassword
  });

  req.login(user, function(err) {
    if (err) {
      console.log(err);
    }else{
      passport.authenticate('local')(req, res, function() {
        res.redirect('/secrets');
      });
    }

  });


});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {

  User.register(new User({
    username: req.body.username
  }), req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate('local')(req, res, function() {
        res.redirect('/secrets');
      });
    }

  });

});

app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect("/login");
  }

});

app.get("/logout",function(req,res){
   req.logout(function(err){
     if(err){
       console.log(err);
     }
   });
   res.redirect("/");
 });


//==================Listen port ===========
app.listen(3000, function(err) {
  if (!err) {
    console.log("Server is running!");
  } else {
    console.log(err);
  }
});
