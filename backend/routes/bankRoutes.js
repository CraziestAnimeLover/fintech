import { Router } from "express";
import {
  addBankAccount,
  getBankAccounts,
  updateBankAccount,
  deleteBankAccount,
  setDefaultBank,
  verifyBankAccount,
} from "../controllers/bankController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

// 🔥 VERIFY BANK
router.post("/bank-accounts/verify", verifyBankAccount);

// CRUD
router.post("/bank-accounts", addBankAccount);
router.get("/bank-accounts", getBankAccounts);
router.put("/bank-accounts/:id", updateBankAccount);
router.delete("/bank-accounts/:id", deleteBankAccount);
router.put("/bank-accounts/default/:id", setDefaultBank);

export default router;