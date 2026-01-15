const express = require("express");
const connectDB = require("./config/database");
const app = express();
const http = require("http");
const cors = require("cors");

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests"); 
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const chatRouter = require("./routes/chat");
const initializeSocket = require("./utils/socket");

//check withing every route one by one
app.use(
  cors({
    origin: "https://dev-connect-frontend-theta.vercel.app/",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());



app.use("/", authRouter)
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);


//socket.io
const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Databse connection established");
    server.listen(3000, () => {   //app => server
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
