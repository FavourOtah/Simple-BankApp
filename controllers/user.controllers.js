import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


//creating a user
const createUser = async (req, res) => {
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



//login in a user
const loginUser = async (req, res) => {
    //getting payload
    const { email, password } = req.body;
    try {
        //ensuring login credentials are provided
        if (!email || !password) {
            return res.status(400).json({ message: "Missing credential" })
        };

        //checking to see if the user exists in the database via the email 
        const userExist = await userModel.findOne({ email })

        if (!userExist) {
            return res.status(404).json({ message: "Account not found" })
        };

        //if user exist, we then crosscheck the validity of the password provided
        const validPassword = bcrypt.compareSync(password, userExist.password)
        if (!validPassword) {
            return res.status(401).json({ message: "Incorrect password" })
        };


        //if the password provided is valid, we create a unique jwt and log in
        const token = jwt.sign({ id: userExist.id, }, process.env.JWT_SECRET, {})

        //creating and returning  COOKIE THt contains the created token unique to the logged in user
        return res.cookie("token", token, { httpOnly: true, secure: false }).status(200).json(userExist)
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    };

};


export { loginUser, createUser }