//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParer = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');
const md5 = require("md5");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();

// console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParer.urlencoded({
  extended: true
}));

//=============Mongoose===============
const dbUrl = "mongodb://localhost:27017/userDB"
mongoose.connect(dbUrl,{useNewUrlParser:true});

const userSchema = new mongoose.Schema({
  email: String,
  password : String
});

const User = mongoose.model("User",userSchema);

//============Req & Res===============
app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login",{loginResult:""});
});

app.post("/login",function(req,res){
  const userName = req.body.username;
  const userPassword = req.body.password;
    User.findOne({
      email:userName
    },function(err,foundUser){
      if (!err) {
        if (!foundUser) {
          res.render("login",{loginResult:"Don't have such account.Please try again! Or registe an account."});
        }else{
          // Load hash from your password DB.
          bcrypt.compare(userPassword, foundUser.password, function(err, result) {
              // result == true
              if (result) {
                  res.render("secrets",{loginResult:"successful"});
              }else{
                res.render("login",{loginResult:"Password error! Please try again!"});
              }
          });

        }
      }
    });
});

app.get("/register",function(req,res){
  res.render("register",{registedResult:""});
});

app.post("/register",function(req,res){

  const userName = req.body.username;
  // create hash code for user password
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      // Store hash in your password DB.
      User.findOne({
        email:userName,
      },function(err,foundUser){
        if (!err) {
          if (!foundUser) {
            const user = new User({
              email:userName,
              password:hash
            });
            user.save(function(err){
              if(err){
                console.log(err);
              }else{
                console.log("Registed Account!");
                res.render("secrets");
              }
            });
          }else{
            console.log("Already have account!");
            res.render("register",{registedResult:"Note: Already have the account! Please directly login."});
        }
      }else{
        console.log(err);
      }
      });
  });

});




//==================Listen port ===========
app.listen(3000,function(err){
  if(!err){
    console.log("Server is running!");
  }else{
    console.log(err);
  }
});
