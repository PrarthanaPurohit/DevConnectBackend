const express = require("express");
const authRouter = express.Router();
const cookieParser = require("cookie-parser");
authRouter.use(cookieParser());
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");

//api to create a new user
authRouter.post("/signup", async (req, res) => {
  try {
    //validation of data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    //Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    // creating a new instance of user model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const savedUser = await user.save();
    //create a JWT token
    const token = await savedUser.getJWT();

    //Add the cookie to token & send the response back to user
    //1 day
    res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
});


    res.json({ message: "User created successfully", data: savedUser });
  } catch (err) {
    res.status(500).send("Error creating user: " + err.message);
  }
});

//login user
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    //check if emailId exists
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    //check password
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      //create a JWT token
      const token = await user.getJWT();

      //Add the cookie to token & send the response back to user
  
      
      res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }); //1 day


      res.send(user);
    } else {
      throw new Error("Invalid password or emailId");
    }
  } catch (err) {
    res.status(401).send("Error logging in: " + err.message);
  }
});

//logout user
authRouter.post("/logout", (req, res) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .send("Logged out successfully");
});

module.exports = authRouter;
