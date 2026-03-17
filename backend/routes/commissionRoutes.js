import express from "express";
import { getCommissions, withdrawCommission } from "../controllers/commissionController.js";


const router = express.Router();

router.get("/", getCommissions);
router.post("/withdraw", withdrawCommission);

export default router;