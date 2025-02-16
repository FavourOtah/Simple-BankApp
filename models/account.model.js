import mongoose from "mongoose"


const accountSchema = new mongoose.Schema({
    account_no: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],

}, { timestamps: true })


const accountModel = mongoose.model("Account", accountSchema)
export default accountModel