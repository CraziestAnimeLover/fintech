import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // agent handling the user
  amount: { type: Number, required: true },
  bankId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Bank"
},
  utr: { type: String }, // transaction reference

  method: { type: String, enum: ["deposit", "withdraw", "transfer"], required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },

  mdr: { type: Number, default: 2 },          // MDR fee %
  adminShare: { type: Number, default: 0 },   // admin share of MDR
  agentShare: { type: Number, default: 0 },   // agent share of MDR
  platformProfit: { type: Number, default: 0 }, // platform profit
  commissionGenerated: {
  type: Boolean,
  default: false,
}, // to prevent duplicate commission
  commissionPaid: { type: Boolean, default: false }, // if agent received commission
  settlementAmount: {
  type: Number,
  default: 0
}
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);