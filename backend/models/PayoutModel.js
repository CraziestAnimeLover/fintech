import { Schema, model } from "mongoose";

const payoutSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  agentId: { type: Schema.Types.ObjectId, ref: "Agent" }, // optional, if payout for agent
  bankAccountId: { type: String }, // bank account for payout
  upiId: { type: String }, // optional, for UPI payouts
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  method: { type: String, enum: ["bank", "upi", "wallet"], default: "bank" },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  reference: { type: String, unique: true }, // unique payout reference
  note: { type: String }, // optional note or description
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date }, // set when payout is completed
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update `updatedAt` automatically
payoutSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

export default model("Payout", payoutSchema);