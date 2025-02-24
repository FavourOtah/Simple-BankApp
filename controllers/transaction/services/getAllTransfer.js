import transactionModel from "../../../models/transaction.model.js";
import mongoose from "mongoose";
import accountModel from "../../../models/account.model.js";


export const getAllTransactions = async (req, res) => {
    const { data, find } = req.body


    // //if null, user is not logged in
    // if (!userId) {
    //     return res.status(401).json({ message: "User has to be logged in order to make a transaction" })
    // };

    // const { accountId } = req.params;

    // if (!accountId) {
    //     return res.status(400).json({ message: "Account is required" })
    // };

    try {
        //let newArray = payload.map(abc => abc.number)
        let result = data.find(abc => abc.accessor === find) //the first find here is a method on arrays, while the second find is from the object.
        //using the find method, it returns a unique item whose accessor is same qith the value of find.

        let result2 = data.map(abc => abc.name)
        // .map is a method, here it returns a new array containg all the name values for each of the item.

        return res.json({ result, result2 })
        // //getting account details and populating with its transactions
        // const accountData = await accountModel.findById(accountId).populate({ path: "transactions", select: "senderAccount receiverAccount amount transactionType timestamp -_id" })

        // //verify account existence
        // if (!accountData) {
        //     return res.status(404).json({ message: "Account not found" })
        // };

        // //returning
        // res.status(200).json({ accountId: accountData._id, transactions: accountData.transactions })
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }

};
