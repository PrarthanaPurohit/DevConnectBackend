const express = require('express');
const userRouter = express.Router();
const { userAuth } = require('../middleware/auth');

const ConnectionRequestModel = require("../models/connectionRequest.js")

//pending requests (status: interested) for logged in user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequestModel.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate('fromUserId', ["firstName", "lastName", "age", "gender","photoUrl", "about"]);  //using ref
        res.json({
            message: "Connection requests found",
            data: connectionRequests
        });
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

//connections for logged in user
userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequestModel.find({
            $or: [
                { fromUserId: loggedInUser._id, status: "accepted" },
                { toUserId: loggedInUser._id, status: "accepted" }
            ]
        })
        .populate('fromUserId', ["firstName", "lastName", "age", "gender","photoUrl", "about"])
        .populate('toUserId', ["firstName", "lastName", "age", "gender","photoUrl", "about"]);  //using ref;

        //get only the connected user's info
        const data = connectionRequests.map((row) => {
        if(row.fromUserId._id.equals(loggedInUser._id)){
            return row.toUserId;
        }   
        else{
            return row.fromUserId;
        }
    });
        res.json({
            message: "Connections found",
            data: data
        });

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }       
});





module.exports = userRouter;
