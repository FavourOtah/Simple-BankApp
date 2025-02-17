import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import userRoutes from "./routes/user.route.js";
import accountRoutes from "./routes/account.route.js";
import transactionRoutes from "./routes/transaction.route.js"




dotenv.config();
const app = express();


app.use(express.json());
app.use(cookieParser());

const PORT = (process.env.MONGO_URL) || 6050


//estabishing connection with database
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Connection to Database Succesful")
    })

    .catch(() => {
        console.log("Something went wrong")
    })


app.use(userRoutes)
app.use(accountRoutes)
app.use(transactionRoutes)
app.listen(PORT, () => { console.log("The server is up and running") })