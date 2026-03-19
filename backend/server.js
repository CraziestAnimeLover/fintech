import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import session from "express-session";
import passport from "./config/passport.js";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
// ... other imports

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
const allowedOrigins = ["https://fintech-kappa-two.vercel.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow mobile apps or curl requests with no origin
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed"));
    },
    credentials: true, // important if sending cookies or Authorization headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
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
// ... other routes

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
