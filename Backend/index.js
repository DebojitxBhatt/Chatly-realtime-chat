import express from "express";
import dotenv from "dotenv";
import dbConnect from "./database/dbConnect.js";
import authRouter from './Route/AuthUser.js'


const app = express();

dotenv.config();

app.use('/api/auth', authRouter)


app.get('/',(req,res)=>{
    res.send("Server Working")
})

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
    dbConnect();
    console.log(`backend working at ${PORT}`);
})