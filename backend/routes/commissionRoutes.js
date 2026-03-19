import express from "express";
import { getCommissions, withdrawCommission } from "../controllers/commissionController.js";
import { protect } from "../middleware/authMiddleware.js"; // <- import protect

const router = express.Router();

// All routes require login
router.get("/", protect, getCommissions);
router.post("/withdraw", protect, withdrawCommission);

export default router;