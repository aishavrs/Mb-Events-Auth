require("dotenv").config()
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const userRouter = require('./routes/userRouter')
const eventRouter = require('./routes/eventRouter')



app.use(express.json())
app.use(cors())

//test route
app.get("/", (req,res)=>{
    res.status(200).json({success : true, message : "MB events server"})
});
//routes

app.use("/api/user", userRouter)
app.use("/api/user/event", eventRouter)

//server and db 
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongo DB Connected")
        app.listen(process.env.PORT, ()=>{
            console.log(`Server running on port : ${process.env.PORT}`)
        })
    } catch (error) {
        console.log(error)
    }
}
startServer();

//error route
app.use((req, res)=>{
    res.status(401).json({success : false, message : "Route not found"})
})