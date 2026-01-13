const express = require("express");
const connectDB = require("./config/database");
const app = express();

const cors = require("cors");

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests"); 
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");

//check withing every route one by one
app.use(cors(
  {origin: "https://dev-connect-frontend-theta.vercel.app", credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"]
  }
));
app.use(express.json()); //parsing json request body




app.use("/", authRouter)
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter)

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
