const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {

    try{//Read the token from req cookies
    const {token} = req.cookies;

    if(!token){
        return res.status(401).send("Please login");
    }
    
    //validate token
    const decodeMessage = await jwt.verify(token, "mySecretkey7777");
    const {_id }= decodeMessage;
    
    //Find the user
    const user = await User.findById(_id);
    if(!user){
        throw new Error("User not found");
    }  
    req.user = user;
    next();
  }catch(err){      
    res.status(401).send("Unauthorized: " + err.message);
  }
    
};

module.exports = {userAuth};