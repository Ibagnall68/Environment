require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

// Setting up new Mongoose database
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Verifies if connection was successful to DB
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected!");
});

// Creating new Schema with required field
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

//Using above in our userSchema. MUST BE ADDED BEFORE YOU CREATE THE MODEL BELOW
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"]});

// Creating new model(collection) using required Schema
const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function(req, res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err){
    if (err) {
      console.log("There was an error with the login. Please try again.");
    } else {
      res.render("secrets");
    }
  });
});

app.post("/login", function(req, res) {
  const userName = req.body.username;
  const password = req.body.password;

  User.findOne({email: userName}, function(err, foundUser){
    if (err) {
      console.log("User not found. Please use the register option.");
    } else {
      if (foundUser) {
        if (foundUser.password === password){
          res.render("secrets");
        } else {
          console.log("You have entered either the wrong email or password. Try again!");
        }
      }
    }
  });
});

app.listen(3000, function(){
  console.log("Server started on port 3000.");
})
