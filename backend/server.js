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
    crossOriginOpenerPolicy: false, // 🔥 IMPORTANT for Google OAuth
    crossOriginEmbedderPolicy: false,
  })
);

/* ---------------- CORS ---------------- */
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://fintech-kappa-two.vercel.app",
  "https://fintech-craziestanimelovers-projects.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps / postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// 🔥 HANDLE PREFLIGHT (CRITICAL)
app.options("*", cors());

// 🔥 FORCE HEADERS (VERCEL FIX)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://fintech-kappa-two.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

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
      secure: true,       // 🔥 REQUIRED for HTTPS (Vercel)
      httpOnly: true,
      sameSite: "none",   // 🔥 REQUIRED for cross-origin cookies
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

/* ---------------- HEALTH ---------------- */
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

/* ---------------- ERROR HANDLER ---------------- */
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

/* ---------------- 404 ---------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();

// 🔥 EXPORT FOR VERCEL
export default app;