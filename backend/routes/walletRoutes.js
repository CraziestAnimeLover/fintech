import express from "express";
import { getWallet, addMoney, sendMoney,withdrawMoney } from "../controllers/walletController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getWallet);
router.post("/add", protect, addMoney);
router.post("/send", protect, sendMoney);
router.post("/withdraw", protect, withdrawMoney);

export default router;