const validator = require("validator");

const validateSignUpData = (req) => {
    const { firstName, lastName, emailId, password } = req.body;

    if(!firstName || !lastName || !emailId || !password){
        throw new Error("All fields are required");
    }
    else if(!validator.isEmail(emailId)) {
        throw new Error("Invalid email address");
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Please use Strong Password");
    }   
}

module.exports = validateSignUpData;