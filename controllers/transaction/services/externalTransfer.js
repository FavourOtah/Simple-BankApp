import transactionModel from "../../../models/transaction.model.js";
import mongoose from "mongoose";
import accountModel from "../../../models/account.model.js";

export const externalTransfer = async (req, res) => {
    const userId = req.user

    //if null, user is not logged in
    if (!userId) {
        return res.status(401).json({ message: "User has to be logged in order to make a transaction" })
    };

    //if all checks, we get the payload
    const { senderAccountNumber, receiverAccountNumber, amount, transactionType } = req.body

    //initiating a mongoose session for transactions
    const session = await mongoose.startSession();
    session.startTransaction();


    try {
        const sender = await accountModel.findOne({ account_no: senderAccountNumber }).populate("user_id",).session(session);
        const receiver = await accountModel.findOne({ account_no: receiverAccountNumber }).populate("user_id").session(session);

        if (!sender || !receiver) {
            throw new Error("One or both accounts not found");
        }

        //ensuring the sender is authorized
        if (sender.user_id._id.toString() !== userId) {
            return res.status(401).json({ message: "Unauthorized client" })
        }

        //checking sender account balance
        if (sender.balance < amount) {
            return res.status(400).json({ message: "Insufficient funds" })
        };

        sender.balance -= amount
        receiver.balance += amount

        //creating transaction record
        const newTransaction = await transactionModel.create(
            [{ senderAccountNumber, receiverAccountNumber, amount, transactionType }], { session }
        );

        //getting unique transaction id
        const transactionId = newTransaction[0]._id;

        // Pushing new transaction ID to sender and receiver
        sender.transactions.push(transactionId);
        receiver.transactions.push(transactionId);

        // Save both accounts within the same session
        await sender.save({ session });
        await receiver.save({ session });


        await session.commitTransaction();
        session.endSession();


        res.status(200).json({ message: "Transfer Successful" })


    } catch (error) {

        //to rollback transaction if an error occurs
        await session.abortTransaction();
        res.status(400).json({ error: error.message })

    } finally {

        session.endSession();
    }

};
