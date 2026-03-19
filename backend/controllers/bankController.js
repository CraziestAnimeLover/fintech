import { BankAccount } from "../models/BankAccountModel.js";

// Add a new bank account
// 🔐 Helper (mask account number)
const maskAccount = (acc) => {
  if (!acc) return "";
  return "XXXXXX" + acc.slice(-4);
};



// 🔥 VERIFY BANK (DEMO / CONNECT API LATER)
export const verifyBankAccount = async (req, res) => {
  try {
    const { accountNumber, ifsc ,accountHolderName} = req.body;

    if (!accountNumber || !ifsc) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // 👉 Replace this with Razorpay / Cashfree later
    return res.json({
      success: true,
      accountHolderName: accountHolderName,
    });

  } catch (err) {
    console.error("Verify Bank Error:", err);
    res.status(500).json({ success: false });
  }
};



// ✅ ADD BANK (ONLY IF VERIFIED)
export const addBankAccount = async (req, res) => {
  try {
    const {
      accountHolderName,
      bankName,
      accountNumber,
      ifsc,
      branch,
      isVerified,
    } = req.body;

    if (!isVerified) {
      return res.status(400).json({
        message: "Bank must be verified before adding",
      });
    }

    const bank = await BankAccount.create({
      userId: req.user._id,
      accountHolder: accountHolderName,
      bankName,
      accountNumber,
      ifsc,
      branch,
      isDefault: false,

      // 🔥 new fields
      isVerified: true,
      verifiedName: accountHolderName,
      verifiedAt: new Date(),
    });

    res.json({ success: true, bank });

  } catch (err) {
    console.error("Add Bank Error:", err);
    res.status(500).json({ message: err.message });
  }
};



// ✅ GET BANKS
export const getBankAccounts = async (req, res) => {
  try {
    const banks = await BankAccount.find({
      userId: req.user._id,
      isActive: true,
    }).select("+accountNumber");

    // 🔐 mask account numbers
    const safeBanks = banks.map((b) => {
      const obj = b.toObject();
      obj.accountNumber = maskAccount(obj.accountNumber);
      return obj;
    });

    res.json({ success: true, accounts: safeBanks });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



// ✅ UPDATE BANK
export const updateBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      accountHolderName,
      bankName,
      accountNumber,
      ifsc,
      branch,
    } = req.body;

   const bank = await BankAccount.findOneAndUpdate(
  { _id: id, userId: req.user._id },
  {
    accountHolder: accountHolderName,
    bankName,
    accountNumber,
    ifsc,
    branch,

    // ✅ keep verification if same data
    ...(req.body.isVerified && {
      isVerified: true,
      verifiedName: accountHolderName,
      verifiedAt: new Date(),
    }),
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



// ✅ DELETE (SOFT DELETE)
export const deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const bank = await BankAccount.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );

    if (!bank) return res.status(404).json({ message: "Bank not found" });

    res.json({ success: true, message: "Bank removed" });

  } catch (err) {
    console.error("Delete Bank Error:", err);
    res.status(500).json({ message: err.message });
  }
};



// ✅ SET DEFAULT
export const setDefaultBank = async (req, res) => {
  try {
    const { id } = req.params;

    // remove old default
    await BankAccount.updateMany(
      { userId: req.user._id },
      { isDefault: false }
    );

    const bank = await BankAccount.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { isDefault: true },
      { new: true }
    );

    if (!bank) return res.status(404).json({ message: "Bank not found" });

    res.json({ success: true, bank });

  } catch (err) {
    console.error("Set Default Error:", err);
    res.status(500).json({ message: err.message });
  }
};