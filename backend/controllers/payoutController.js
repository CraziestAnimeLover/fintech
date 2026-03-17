import { BankAccount } from "../models/BankAccountModel.js";
import Payout from "../models/PayoutModel.js";
import User from "../models/User.js";
import crypto from "crypto";

// Get all bank accounts of the user
export const getBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find({ userId: req.user._id });
    res.json({ success: true, accounts });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching bank accounts" });
  }
};

// Request a payout
export const requestPayout = async (req, res) => {
  const { bankAccountId, upiId, walletId, amount, currency, method } = req.body;

  if (!amount || !currency || !method) {
    return res.status(400).json({ success: false, message: "Amount, currency, and method are required" });
  }

  try {
    let payoutData = {
      userId: req.user._id,
      amount,
      currency,
      method,
      status: "pending",
      reference: crypto.randomBytes(8).toString("hex") // unique reference
    };

    // Attach payout destination
    if (method === "bank") {
      if (!bankAccountId) return res.status(400).json({ success: false, message: "Bank account is required for bank payouts" });
      const bank = await BankAccount.findOne({ _id: bankAccountId, userId: req.user._id });
      if (!bank) return res.status(404).json({ success: false, message: "Bank account not found" });
      payoutData.bankAccountId = bankAccountId;
    } else if (method === "upi") {
      if (!upiId) return res.status(400).json({ success: false, message: "UPI ID is required for UPI payouts" });
      payoutData.upiId = upiId;
    } else if (method === "wallet") {
      if (!walletId) return res.status(400).json({ success: false, message: "Wallet ID is required for wallet payouts" });
      payoutData.walletId = walletId;
    } else {
      return res.status(400).json({ success: false, message: "Invalid payout method" });
    }

    const payout = await Payout.create(payoutData);

    res.json({ success: true, message: "Payout requested successfully", payout });
  } catch (err) {
    console.error("PAYOUT ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to request payout" });
  }
};

// Admin/Agent: Update payout status (approve/reject)
export const updatePayoutStatus = async (req, res) => {
  const { payoutId } = req.params;
  const { status, note } = req.body;

  if (!["pending", "completed", "failed"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    const payout = await Payout.findById(payoutId);
    if (!payout) return res.status(404).json({ success: false, message: "Payout not found" });

    payout.status = status;
    payout.note = note || payout.note;

    if (status === "completed") payout.processedAt = Date.now();

    await payout.save();

    res.json({ success: true, message: "Payout status updated", payout });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update payout" });
  }
};

// Get all payouts of the user
export const getUserPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find({ userId: req.user._id }).sort({ requestedAt: -1 });
    res.json({ success: true, payouts });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch payouts" });
  }
};