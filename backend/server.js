import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import session from "express-session";

// Load ENV FIRST
dotenv.config();

// Import passport AFTER env
import passport from "./config/passport.js";

// Import DB connection
import { connectDB } from "./config/db.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import developerRoutes from "./routes/developerRoutes.js";
import payoutRoutes from "./routes/payoutRoutes.js";
import walletRoutes from "./routes/walletRoutes.js"; 
import bankRoutes from "./routes/bankRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import commissionRoutes from "./routes/commissionRoutes.js";

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
app.use(
  cors({
    origin: ["http://localhost:3000","https://fintech-craziestanimelovers-projects.vercel.app"],
    credentials: true,
  })
);

/* ---------------- STATIC FILES ---------------- */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ---------------- SESSION ---------------- */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
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
app.get("/", (req, res) => {
  res.send("API is running...");
});
/* ---------------- HEALTH CHECK ---------------- */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

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
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

/* ---------------- SERVER START ---------------- */
const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();

export default app;