
import userModel from "../../../models/user.model.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//login in a user
export const loginUser = async (req, res) => {
    //getting payload
    const { email, password } = req.body;
    try {
        //ensuring login credentials are provided
        if (!email || !password) {
            return res.status(400).json({ message: "Missing credential" })
        };

        //checking to see if the user exists in the database via the email 
        const userExist = await userModel.findOne({ email }).select("name email password")

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
        return res.cookie("token", token, { httpOnly: true, secure: false }).status(200).json({ name: userExist.name, email: userExist.email })
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    };

};

