import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import session from "express-session";
import passport from "./config/passport.js";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import developerRoutes from "./routes/developerRoutes.js";
import payoutRoutes from "./routes/payoutRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import bankRoutes from "./routes/bankRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import commissionRoutes from "./routes/commissionRoutes.js";

dotenv.config();

const app = express();

/* ---------------- BODY PARSER ---------------- */
app.use(json());

/* ---------------- SECURITY HEADERS ---------------- */
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
  })
);

/* ---------------- CORS ---------------- */
const allowedOrigins = [
  "http://localhost:3000",
  "https://fintech-kappa-two.vercel.app",
  "https://fintech-craziestanimelovers-projects.vercel.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") return res.sendStatus(200); // preflight
  next();
});

/* ---------------- STATIC FILES ---------------- */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ---------------- SESSION ---------------- */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none", // important for cross-site cookies (Google Auth)
    },
  })
);

/* ---------------- PASSPORT ---------------- */
app.use(passport.initialize());
app.use(passport.session());

/* ---------------- ROUTES ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/developer", developerRoutes);
app.use("/api", payoutRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api", bankRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/commissions", commissionRoutes);

app.get("/", (req, res) => res.send("API is running..."));
app.get("/api/health", (req, res) =>
  res.status(200).json({ success: true, message: "API is running", timestamp: new Date().toISOString() })
);

/* ---------------- ERROR HANDLER ---------------- */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

/* ---------------- 404 HANDLER ---------------- */
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" })
);

const PORT = process.env.PORT || 5000;

connectDB();

export default app;
