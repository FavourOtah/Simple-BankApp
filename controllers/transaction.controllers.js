import transactionModel from "../models/transaction.model.js";
import mongoose from "mongoose";
import accountModel from "../models/account.model.js";

const internalTransfer = async (req, res) => {
    //gets id from verified token//in order to ensure user is logged in before making a transaction
    const userId = req.user

    //if null, user is not logged in
    if (!userId) {
        return res.status(401).json({ message: "User has to be logged in order to make a transaction" })
    };

    //if all checks, we get the payload
    const { senderAccount, receiverAccount, amount, transactionType } = req.body

    //to check if the user types same account details twice
    if (senderAccount === receiverAccount) {
        return res.status(400).json({ message: "Same account details filled twice" })
    };

    //ensuring atomicity in the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        //getting the sender and receiver account
        //checking if the accounts actually exist in the database

        const sender = await accountModel.findById(senderAccount).populate("user_id",).session(session);
        const receiver = await accountModel.findById(receiverAccount).populate("user_id").session(session);

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
        const savedTransaction = await transactionModel.create([{ senderAccount, receiverAccount, amount, transactionType }], { session });

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


const externalTransfer = async (req, res) => {
    const userId = req.user

    //if null, user is not logged in
    if (!userId) {
        return res.status(401).json({ message: "User has to be logged in order to make a transaction" })
    };

    //if all checks, we get the payload
    const { senderAccount, receiverAccount, amount, transactionType } = req.body

    //initiating a mongoose session for transactions
    const session = await mongoose.startSession();
    session.startTransaction();


    try {
        const sender = await accountModel.findById(senderAccount).populate("user_id").session(session);
        const receiver = await accountModel.findById(receiverAccount).populate("user_id").session(session);

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
            [{ senderAccount, receiverAccount, amount, transactionType }], { session }
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


const getAllTransactions = async (req, res) => {
    const userId = req.user

    //if null, user is not logged in
    if (!userId) {
        return res.status(401).json({ message: "User has to be logged in order to make a transaction" })
    };

    const { accountId } = req.params;

    if (!accountId) {
        return res.status(400).json({ message: "Account is required" })
    };

    try {
        //getting account details and populating with its transactions
        const accountData = await accountModel.findById(accountId).populate({ path: "transactions", select: "senderAccount receiverAccount amount transactionType timestamp -_id" })

        //verify account existence
        if (!accountData) {
            return res.status(404).json({ message: "Account not found" })
        };

        //returning
        res.status(200).json({ accountId: accountData._id, transactions: accountData.transactions })
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }

};


export { internalTransfer, externalTransfer, getAllTransactions }