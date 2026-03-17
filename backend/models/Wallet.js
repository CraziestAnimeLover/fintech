import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
{
  // Wallet owner (User / Agent / Admin)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  // Total balance (optional summary)
  balance: {
    type: Number,
    default: 0
  },

  // Money coming into system (deposit)
  payinWallet: {
    type: Number,
    default: 0
  },

  // Money used for transfers / withdrawals
  payoutWallet: {
    type: Number,
    default: 0
  },

  // AEPS transaction wallet
  aepsWallet: {
    type: Number,
    default: 0
  },

  // Locked funds
  lienAmount: {
    type: Number,
    default: 0
  },

  // System reserve
  rollingReserve: {
    type: Number,
    default: 0
  },

  // Bank processing issues
  bankStuckAmount: {
    type: Number,
    default: 0
  },

  // Agent commission earned
  commissionBalance: {
    type: Number,
    default: 0
  },

  // Agent withdrawable amount
  settlementBalance: {
    type: Number,
    default: 0
  }

},
{ timestamps: true }
);

export default mongoose.model("Wallet", walletSchema);