const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({

    fromUserId: {
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' //reference to User model
    },

    toUserId: {
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' //reference to User model
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["ignored", "interested", "accepted", "rejected"],
            message: '{VALUE} is not supported'
        }
    },
},
    {
        timestamps: true
    }

);

//create a compound index for faster lookups
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });
//pre middleware called before save
connectionRequestSchema.pre("save", async function () {

  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error("You cannot send connection request to yourself");
  }

});




const ConnectionRequestModel = new mongoose.model("ConnectionRequest", connectionRequestSchema);
module.exports = ConnectionRequestModel;