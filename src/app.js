const express = require("express");

const app = express();

//request handler
app.use("/test", (req, res) => {
    res.send("Hello from Express!");
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");  
});