const express = require("express");
const connectDB = require("./config/database");
const app = express();
app.use(express.json()); //parsing json request body
const  validateSignUpData  = require("./utils/validation");
const bcrypt = require("bcrypt");
//import user model
const User = require("./models/user");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const jwt = require("jsonwebtoken");
const {userAuth} = require ("./middleware/auth");
require("dotenv").config();

//api to create a new user
app.post("/signup", async (req, res) => {
  try {

    //validation of data
    validateSignUpData(req);

    const{firstName, lastName, emailId, password} = req.body;

    //Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    // creating a new instance of user model
    const user = new User({
        firstName, 
        lastName,
        emailId,
        password: passwordHash
    });

    await user.save();
    console.log("USER SAVED:", user);
    res.send("User created successfully");
  } catch (err) {
    res.status(500).send("Error creating user: " + err.message);
  }
});

//login user
app.post("/login", async(req,res) => {
    try{
        const {emailId, password } = req.body;

        //check if emailId exists
        const user = await User.findOne({emailId: emailId});
        if(!user){
            throw new Error("Invalid email or password");
        }

        //check password
        const isPasswordValid = await user.validatePassword(password);
        if(isPasswordValid){

            //create a JWT token
            const token = await user.getJWT();

            //Add the cookie to token & send the response back to user
            res.cookie("token", token, {expires: new Date(Date.now() + 24*60*60*1000)}); //1 day
            res.send("Login successful");
        }       
        else{
            throw new Error("Invalid password or emailId");
        }
    }
    catch(err){
        res.status(401).send("Error logging in: " + err.message);
    }
});

//get profile
app.get("/profile",userAuth, async(req, res) => {
    try{
    const user = req.user;
    res.send(user);
}catch(err){
    res.status(500).send("Error fetching profile: " + err.message);
}
});



connectDB()
  .then(() => {
    console.log("Databse connection established");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
