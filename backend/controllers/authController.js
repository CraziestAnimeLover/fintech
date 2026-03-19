import User from "../models/User.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import { sendOtp } from "../utils/sendOtp.js";

import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

// SEND OTP (Login Step 1)
// @desc Send OTP for login
// @route POST /api/auth/send-otp
export async function sendOtpLogin(req, res) {
  try {
    await connectDB(); // ensure DB connected

    const { email, role } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const user = await User.findOne({ email, role });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = await user.generateOtp();
    await sendOtp(email, otp);

    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("sendOtpLogin error:", error);
    return res.status(500).json({ success: false, message: "Error sending OTP", error: error.message });
  }
}


// VERIFY OTP (Login Step 2)
export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      "otp.code": otp,
      "otp.expiresAt": { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
}


// RESEND OTP
export async function resendOtp(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = await user.generateOtp();
    await sendOtp(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
}



// GET CURRENT LOGGED IN USER
// @route GET /api/auth/me
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error getting user"
    });
  }
}

export async function login(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
}


// LOGOUT USER
// @desc Logout user
// @route GET /api/auth/logout
export async function logout(req, res) {
  try {
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Logout failed"
    });
  }
}


export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= GOOGLE CALLBACK ================= */
export const googleCallback = (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).send("User not found");
    }

    if (req.user.status === "BLOCKED") {
      return res.status(403).send("Account blocked");
    }

    const token = jwt.sign(
      {
        id: req.user._id,
        role: req.user.role,
        isAdmin: req.user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";

    res.redirect(`${frontendUrl}/login?token=${token}`);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    res.status(500).send("OAuth failed");
  }
};
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);




export const googleLogin = async (req, res) => {
  try {

    console.log("BODY:", req.body);

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success:false,
        message:"Token missing"
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    console.log("PAYLOAD:", payload);

    const { email, name, picture } = payload;

   let user = await User.findOne({ email });

if (!user) {

  const randomPassword = `G${Math.random().toString(36).slice(-5)}@1A`;
user = await User.create({
  name,
  email,
  provider: "google", // Add this!
  isVerified: true,
  role: "user"
});

}

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token: jwtToken,
      user
    });

  } catch (error) {

    console.error("GOOGLE LOGIN ERROR:", error);

    res.status(500).json({
      success:false,
      message:"Google authentication failed"
    });
  }
};
