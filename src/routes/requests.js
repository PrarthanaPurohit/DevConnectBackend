const express = require("express");
const requestRouter = express.Router();
const {userAuth} = require("../middleware/auth.js");
const ConnectionRequestModel = require("../models/connectionRequest.js")
const User = require("../models/user.js");

requestRouter.post("/request/send/:status/:toUserId", userAuth, async(req, res) => {
    try{
        const fromUserId = req.user._id;  //user is coming from userAuth
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        //validate status
        const allowedStatus = ['ignored', 'interested'];
        if(!allowedStatus.includes(status)){
            return res.status(400)
            .json({message: "Invalid status type:" + status })
        }

        //validate toUserId
        const toUser = await User.findById(toUserId);
        if(!toUser){
            return res.status(404)
            .json({message: "User not found with id: " + toUserId});
        }

        //lock one way request
        const existingConnectionRequest = await ConnectionRequestModel.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });
        if(existingConnectionRequest){
            return res.status(400)
            .json({message: "Connection request already exists between these users."});
        }

        const connectionRequest = new ConnectionRequestModel({
            fromUserId,
            toUserId,
            status
        });

        const data = await connectionRequest.save();

        res.json({
            message: req.user.firstName + " " + status + " " + toUser.firstName,
            data
        })

    }
    catch(err){
        res.status(500).send("Error: " +  err.message);
    }
})


requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try{
        const loggedInUser = req.user; //from userAuth
        const { status, requestId } = req.params;

        //validate status
        const allowedStatus = ['accepted', 'rejected'];
        if(!allowedStatus.includes(status)){
            return res.status(400)
            .json({message: "Invalid status type:" + status })
        }

        //validate request
        const connectionRequest = await ConnectionRequestModel.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        })
        if(!connectionRequest){
            return res.status(404)
            .json({message: "No pending connection request found with id: " + requestId});
        }

        connectionRequest.status = status;
        const data = await connectionRequest.save();
        res.json({
            message: "Connection request " + status + " by " + loggedInUser.firstName,
            data
        });

    }catch(err){
        res.status(500).send("Error: " +  err.message);
    }
});

module.exports = requestRouter;