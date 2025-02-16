import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    senderAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    receiverAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    amount: { type: Number, required: true },
    transactionType: { type: String, enum: ["internal", "external"], required: true },
    timestamp: { type: Date, default: Date.now }
})

const transactionModel = mongoose.model("Transaction", transactionSchema)

export default transactionModel