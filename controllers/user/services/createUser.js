import userModel from "../../../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


//creating a user
export const createUser = async (req, res) => {
    //getting payload via destructuring
    const { password, ...others } = req.body

    try {
        //ensuring the neccessary credentials for registration are provided
        if (!others.email || !others.name || !password) { return res.status(400).json({ message: "Name, Email and Password are required." }) }


        //checking if the email provided already belongs to an existing user
        const isUser = await userModel.findOne({ email: others.email })
        if (isUser) {
            return res.json({ message: "The email provided belongs to an existing user" })
        };

        //hashing the provided password
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(password, salt)

        //saving the new user to the database 
        const newUser = new userModel({ password: hashedPassword, ...others });
        await newUser.save();
        res.status(200).send("User created succesfully")
    } catch (error) {
        res.send("Something went wrong")

    };
};

