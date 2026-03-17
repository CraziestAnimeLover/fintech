import { Router } from "express";
import {
  addBankAccount,
  getBankAccounts,
  updateBankAccount,
  deleteBankAccount,
  setDefaultBank,
} from "../controllers/bankController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect); // all routes need authentication

// Create a bank account
router.post("/bank-accounts", addBankAccount);

// Get all bank accounts for the user
router.get("/bank-accounts", getBankAccounts);

// Update a bank account
router.put("/bank-accounts/:id", updateBankAccount);

// Delete a bank account
router.delete("/bank-accounts/:id", deleteBankAccount);

// Set a bank account as default
router.put("/bank-accounts/default/:id", setDefaultBank);

export default router;