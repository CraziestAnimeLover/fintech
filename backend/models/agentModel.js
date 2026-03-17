import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  commissionRate: { type: Number, default: 0 }, // e.g., 1% = 0.01
  commissionEarned: { type: Number, default: 0 },
  payoutRequests: [{
    amount: Number,
    status: { type: String, enum: ["pending","approved","rejected"], default: "pending" },
    createdAt: { type: Date, default: Date.now }
  }]
});

export default mongoose.model("Agent", agentSchema);