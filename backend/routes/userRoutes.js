import { Router } from 'express';
import passport from 'passport';
import { googleCallback } from '../controllers/authController.js';
// import { uploadDocuments, getMyDocuments, deleteDocument, } from "../controllers/documentController.js";
import { upload } from "../middleware/upload.js";
import { getUsers, getUser, updateProfile, updatePassword, deleteUser,createCompany,getCompany,updateCompany,createCommercial,getCurrentUser,getWallet,depositRequest,getCommercial,updateCommercial,uploadDocuments, getMyDocuments, deleteDocument, } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(protect);

// ✅ DOCUMENT ROUTES FIRST
router.post(
  "/documents",
  upload.fields([
    { name: "pan", maxCount: 1 },
    { name: "aadhaar", maxCount: 1 },
    { name: "gst", maxCount: 1 },
    { name: "cin", maxCount: 1 },
    { name: "incorporation", maxCount: 1 },
    { name: "llp_agreement", maxCount: 1 },
    { name: "board_resolution", maxCount: 1 },
    { name: "moa", maxCount: 1 },
    { name: "bank_proof", maxCount: 1 },
    { name: "udyam", maxCount: 1 }
  ]),
  uploadDocuments
);
router.get("/documents", getMyDocuments);
router.delete("/documents/:docKey", deleteDocument);

router.get("/me", protect, getCurrentUser);
// USER ROUTES
router.get('/', getUsers);
router.put('/profile', updateProfile);
router.put('/password', updatePassword);

router.get("/wallet", getWallet);
router.post("/deposit-request", depositRequest);


router.post("/company", createCompany);
router.get("/company", getCompany);
router.put("/company", updateCompany);

router.post("/commercial", createCommercial);
router.get("/commercial", getCommercial);
router.put("/commercial", updateCommercial);

// ---------------- GOOGLE OAUTH ----------------
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Redirect callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleCallback // redirects to FRONTEND_URL/login?token=...
);

// ⚠️ dynamic routes always last
router.get('/:id', getUser);
router.delete('/:id', deleteUser);

export default router;