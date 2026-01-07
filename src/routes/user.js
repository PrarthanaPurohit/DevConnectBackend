const express = require('express');
const userRouter = express.Router();
const { userAuth } = require('../middleware/auth');
const User = require("../models/user.js");

const ConnectionRequestModel = require("../models/connectionRequest.js")

//pending requests (status: interested) for logged in user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequestModel.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate('fromUserId', ["firstName", "lastName", "age", "gender","photoUrl", "about", "skills"]);  //using ref
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
        .populate('fromUserId', ["firstName", "lastName", "age", "gender","photoUrl", "about", "skills"])
        .populate('toUserId', ["firstName", "lastName", "age", "gender","photoUrl", "about", "skills"]);  //using ref;

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


//Feed api
userRouter.get("/user/feed", userAuth, async (req,res) => {
    try{
        const loggedInUser = req.user;

        //Pagination data
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        if(limit > 100) limit = 50; //max limit 500 so as to not overload server
        const skip = (page - 1) * limit;

        // avoid self, connections- ignored, pending req, rejected, accepted
        
        //find all connection req user sent or received
        const connectionRequests = await ConnectionRequestModel.find({
            $or: [
                {fromUserId: loggedInUser._id},
                {toUserId: loggedInUser._id}
            ]
        }).select("fromUserId toUserId status -_id");

        const hideUsersFromFeed = new Set(); //repetition not allowed in set
        connectionRequests.forEach((req) => {
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        });

        //find other users not in hideUsersFromFeed & yourself
        const feedUsers = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUsersFromFeed)}},
                { _id: { $ne: loggedInUser._id }}
        ]
            
        }).select("firstName lastName age gender photoUrl about skills")  //protect sensitive info
        .skip(skip).limit(limit);  //pagination

        res.json({data: feedUsers});
            
    }
    catch(err){
        res.status(500).send("Error: " + err.message);
    }
})





module.exports = userRouter;
