import { BankAccount } from "../models/BankAccountModel.js";

// Add a new bank account
export const addBankAccount = async (req, res) => {
  try {
    const { accountHolderName, bankName, accountNumber, ifsc, branch } = req.body;

    const bank = await BankAccount.create({
      userId: req.user._id, // from auth middleware
      accountHolder: accountHolderName,
      bankName,
      accountNumber,
      ifsc,
      branch,
      isDefault: false, // new bank is not default by default
    });

    res.json({ success: true, bank });
  } catch (err) {
    console.error("Add Bank Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all bank accounts for logged-in user
export const getBankAccounts = async (req, res) => {
  try {
    const userId = req.user._id;
    const banks = await BankAccount.find({ userId }).select(
      "+accountNumber" // explicitly include accountNumber
    );

    res.json({ success: true, accounts: banks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a bank account
export const updateBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountHolderName, bankName, accountNumber, ifsc, branch } = req.body;

    const bank = await BankAccount.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      {
        accountHolder: accountHolderName,
        bankName,
        accountNumber,
        ifsc,
        branch,
      },
      { new: true }
    );

    if (!bank) return res.status(404).json({ message: "Bank not found" });

    res.json({ success: true, bank });
  } catch (err) {
    console.error("Update Bank Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete a bank account
export const deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const bank = await BankAccount.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!bank) return res.status(404).json({ message: "Bank not found" });

    res.json({ success: true, message: "Bank deleted" });
  } catch (err) {
    console.error("Delete Bank Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Set a bank as default
export const setDefaultBank = async (req, res) => {
  try {
    const { id } = req.params;

    // Unset previous default
    await BankAccount.updateMany({ userId: req.user._id }, { isDefault: false });

    // Set new default
    const bank = await BankAccount.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { isDefault: true },
      { new: true }
    );

    if (!bank) return res.status(404).json({ message: "Bank not found" });

    res.json({ success: true, bank });
  } catch (err) {
    console.error("Set Default Bank Error:", err);
    res.status(500).json({ message: err.message });
  }
};