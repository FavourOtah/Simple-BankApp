import accountModel from "../../../models/account.model.js";
import userModel from "../../../models/user.model.js";
import mongoose from "mongoose";

export const createAccount = async (req, res) => {
    //the logic here is that only logged in users are able to create accounts. 
    const id = (req.user)

    try {
        //to know if the user is logged in by checking for id from the verified token
        if (!id) {
            return res.status(401).json({ message: "Log in to continue with this action" })
        }

        //if logged in, we get the payload and save to the database
        const payload = req.body

        //saving the account
        const newAccount = new accountModel({ user_id: id, ...payload });
        const savedAccount = await newAccount.save();

        //we update the user's model account array with the newly created accountid
        //first get the unique user
        const uniqueUser = await userModel.findById(id);

        //getting the array of accounts for this user
        const arrayOfAccounts = uniqueUser.accounts;

        //update the array with the id of the new account
        arrayOfAccounts.push(savedAccount._id)

        //updating the schema with the newly updated array 
        await userModel.findByIdAndUpdate(id, { accounts: arrayOfAccounts }, { new: true });
        res.status(200).json({ message: "Account successfully created" });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })

    }
};
