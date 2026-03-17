import express from "express";
import { getBankAccounts, requestPayout } from "../controllers/payoutController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/bank-accounts
router.get("/bank-accounts", protect, getBankAccounts);

// POST /api/payouts
router.post("/payouts", protect, requestPayout);

export default router;