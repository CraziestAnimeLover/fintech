import { Router } from "express";
import { getCommissions,withdrawCommission} from "../controllers/commissionController.js";
import { getAgentDashboardStats, getAgentTransactions,getAllAgents } from "../controllers/agentController.js";
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);

// All routes require the agent to be logged in


// Get commissions with optional filters
router.get("/commissions", getCommissions);
router.get("/dashboard",  getAgentDashboardStats);
router.get("/", getAllAgents);
router.get("/transactions", getAgentTransactions);
router.post("/withdraw-commission", withdrawCommission);

export default router;