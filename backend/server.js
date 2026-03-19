import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import session from "express-session";
import passport from "./config/passport.js";
import { connectDB } from "./config/db.js";

/* ---------------- ROUTES ---------------- */
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import developerRoutes from "./routes/developerRoutes.js";
import bankRoutes from "./routes/bankRoutes.js";
import commissionRoutes from "./routes/commissionRoutes.js";

dotenv.config();

const app = express();

/* ---------------- BODY PARSER ---------------- */
app.use(express.json());

/* ---------------- SECURITY ---------------- */
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
  })
);

/* ---------------- CORS ---------------- */
const allowedOrigins = [
  "https://fintech-kappa-two.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

/* ---------------- SESSION ---------------- */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    },
  })
);

/* ---------------- PASSPORT ---------------- */
app.use(passport.initialize());
app.use(passport.session());

/* ---------------- ROUTES ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/developer", developerRoutes);
app.use("/api/bank", bankRoutes);
app.use("/api/commissions", commissionRoutes);

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => res.send("API is running..."));
app.get("/api/health", (req, res) =>
  res.status(200).json({ success: true, message: "API is running" })
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

/* ---------------- SERVER ---------------- */
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});

export default app;