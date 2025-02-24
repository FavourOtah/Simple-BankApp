import transactionModel from "../../../models/transaction.model.js";
import mongoose from "mongoose";
import accountModel from "../../../models/account.model.js";

export const internalTransfer = async (req, res) => {
    //gets id from verified token//in order to ensure user is logged in before making a transaction
    const userId = req.user

    //if null, user is not logged in
    if (!userId) {
        return res.status(401).json({ message: "User has to be logged in order to make a transaction" })
    };

    //if all checks, we get the payload
    const { senderAccountNumber, receiverAccountNumber, amount, transactionType } = req.body

    //to check if the user types same account details twice
    if (senderAccountNumber === receiverAccountNumber) {
        return res.status(400).json({ message: "Same account details filled twice" })
    };

    //ensuring atomicity in the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        //getting the sender and receiver account
        //checking if the accounts actually exist in the database

        const sender = await accountModel.findOne({ account_no: senderAccountNumber }).populate("user_id",).session(session);
        const receiver = await accountModel.findOne({ account_no: receiverAccountNumber }).populate("user_id").session(session);

        console.log(sender)

        //if not found
        if (!sender || !receiver) {
            return res.status(404).json({ message: "One or both account not found" })
        };

        //ensuring the sender is authorized
        if (sender.user_id._id.toString() !== userId) {
            return res.status(401).json({ message: "Unauthorized client" })
        }

        //verifying that it is an internal transfer, that is both account having the same user_id
        if (sender.user_id._id.toString() !== receiver.user_id._id.toString()) {
            return res.status(400).json({ message: "Acoounts do not belong to the same owner" })
        };

        //if all checks out, we then verify the account balance
        if (sender.balance < amount) {
            return res.status(400).json({ message: "Insufficent funds" });
        };


        //if all checks, we perform the maths//also updates the balances vias dot notation.
        sender.balance -= amount;
        receiver.balance += amount;

        //creating saving the transaction to the database
        const savedTransaction = await transactionModel.create([{ senderAccountNumber, receiverAccountNumber, amount, transactionType }], { session });

        const newTransactionId = savedTransaction[0]._id;

        // Pushing new transaction ID to sender and receiver
        sender.transactions.push(newTransactionId);
        receiver.transactions.push(newTransactionId);

        // Save both accounts within the same session
        await sender.save({ session });
        await receiver.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: "Transfer succesful", newTransactionId })

    } catch (error) {
        //to cancel all changes made during the execution of the transaction(no partial updates)
        await session.abortTransaction();

        res.status(400).json({ error: error.message })
    } finally {
        //Ensuring session is closed
        //closing the session
        session.endSession();
    }
};
