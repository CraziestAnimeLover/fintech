import mongoose from "mongoose";
const commissionSchema = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
    enum: ["agent", "admin"],
    required: true,
  },
  amount: Number,
  status: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
  },
}, { timestamps: true });

export default mongoose.model("Commission", commissionSchema);