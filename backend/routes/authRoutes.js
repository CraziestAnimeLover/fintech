import express from "express";
import {
  register,
  login,
  verifyOtp,
  resendOtp,
  getMe,
  logout,
  sendOtpLogin,googleLogin
} from "../controllers/authController.js";
import passport from "passport";
import { googleCallback } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOtpLogin);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

// Google login route
router.post("/google", googleLogin);

router.get("/me", getMe);
router.get("/logout", logout);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

export default router;