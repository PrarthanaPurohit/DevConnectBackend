const mongoose = require('mongoose');
validator = require('validator');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

//create schema
const userSchema = new mongoose.Schema({
    firstName:{
        type:String, 
        required: true,
        minLength: 2,
        maxLength: 50
    },
    lastName:{
        type:String
    },
    emailId:{
        type:String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error("Invalid email address:" + value);
            }
        }
    },
    password:{
        type:String, 
        required: true,
        minLength: 6,
        maxLength: 100,
        validate(value) {
            if(!validator.isStrongPassword(value)){
                throw new Error("Please use Strong Password");
            }
        }
    },
    age:{
        type:Number,
        min: 18
    },
    gender:{
        type:String,
        validate(value){
            if(!["Male", "Female", "Other"].includes(value)){
                throw new Error("Gender must be Male, Female or Other");  //case sensitive
        }}
    },
    photoUrl: {
        type: String,
        default: "https://imgs.search.brave.com/GFBepGjR0-Sr66I7EQsFQAYvw2A8bMmSkGUVm6OmVMM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvdGh1/bWJuYWlscy8wMTQv/ODUyLzMwMy9zbWFs/bC9hdmF0YXItdXNl/ci1iYXNpYy1idXNp/bmVzcy1mbGF0LWxp/bmUtZmlsbGVkLWlj/b24tYmFubmVyLXRl/bXBsYXRlLWZyZWUt/dmVjdG9yLmpwZw",
    },
    about:{
        type:String,
        default: "Hey there!",
        maxLength: 80,
    },
    skills:{
        type: [String] //BY default an array will be shown
    }
},
{
    timestamps: true,
});

//method for jwt token generation
userSchema.methods.getJWT = async function() {
    const user = this; //don't work with arrow func
    const token = await jwt.sign({_id: user._id }, "mySecretkey7777", {expiresIn: "1d"});
    return token;
}

//method to verify password
userSchema.methods.validatePassword = async function(inputPasswordByUser){
    const user = this;
    const passwordHash = user.password;
    return await bcrypt.compare(inputPasswordByUser, passwordHash);
}


//create model
const userModel = mongoose.model("User", userSchema);

module.exports = userModel;