import express from "express";
import {
  getDeveloperKeys,
  generateDeveloperKeys,
  updateDeveloperSettings,
} from "../controllers/developerController.js";
import { protect } from "../middleware/authMiddleware.js"; // <- must match export

const router = express.Router();

// GET /api/developer
router.get("/", protect, getDeveloperKeys);

// POST /api/developer/generate
router.post("/generate", protect, generateDeveloperKeys);

// PUT /api/developer/update
router.put("/update", protect, updateDeveloperSettings);

export default router;