import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";

// Get wallet info
export const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      wallet = new Wallet({ user: user._id, balance: 0 });
      await wallet.save();
    }

    res.json({
      balance: wallet.balance,
      transactions: user.transactions || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add money to wallet
export const addMoney = async (req, res) => {
  try {
    const { amount } = req.body;

const user = await User.findById(req.user._id);

const transaction = await Transaction.create({
  user: user._id,
  agent: user.agent,   // ✅ FIXED
  amount,
  method: "deposit",
  status: "pending",
});

    res.json({
      message: "Deposit request created. Waiting for admin approval",
      transaction,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Send money
export const sendMoney = async (req, res) => {
  try {
    const { amount, recipientEmail } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const sender = await User.findById(req.user._id);
    const recipient = await User.findOne({ email: recipientEmail });

    if (!sender || !recipient) return res.status(404).json({ message: "User not found" });

    let senderWallet = await Wallet.findOne({ user: sender._id });
    let recipientWallet = await Wallet.findOne({ user: recipient._id });

    if (!senderWallet) senderWallet = new Wallet({ user: sender._id, balance: 0 });
    if (!recipientWallet) recipientWallet = new Wallet({ user: recipient._id, balance: 0 });

    if (senderWallet.balance < amount) return res.status(400).json({ message: "Insufficient balance" });

    // Update balances
    senderWallet.balance -= amount;
    recipientWallet.balance += amount;

    await senderWallet.save();
    await recipientWallet.save();

    // Save transactions
    sender.transactions = sender.transactions || [];
    sender.transactions.push({
      type: "debit",
      amount,
      description: `Sent to ${recipientEmail}`,
      date: new Date(),
    });
    await sender.save();

    recipient.transactions = recipient.transactions || [];
    recipient.transactions.push({
      type: "credit",
      amount,
      description: `Received from ${sender.email}`,
      date: new Date(),
    });
    await recipient.save();

    res.json({ balance: senderWallet.balance, message: `₹${amount} sent to ${recipientEmail}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const withdrawMoney = async (req, res) => {
  const { amount, bankId } = req.body;

  try {
    let wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id, balance: 0, transactions: [] });
    }

    if (!wallet.transactions) {
      wallet.transactions = [];
    }

    // Add transaction
await Transaction.create({
  user: req.user._id,
  amount,
  method: "withdraw",
  bankId,
  status: "pending",
});

    await wallet.save();

    res.status(200).json({ success: true, message: "Withdraw request submitted" });
  } catch (err) {
    console.error("Withdraw Error:", err);
    res.status(500).json({ success: false, message: "Withdraw failed" });
  }
};
