import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

// Config & DB
import { connectDB } from "./config/db.js";
import { upload } from "./config/cloudinary.js";

// Routes
import authRoutes from "./routes/auth.js";
import listingRoutes from "./routes/listings.js";
import bookingRoutes from "./routes/bookings.js";
import partnerRoutes from "./routes/partner.js";
import adminRoutes from "./routes/admin.js";
import miscRoutes from "./routes/misc.js";
import communicationRoutes from "./routes/communication.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database
connectDB();

/* ---------------- MIDDLEWARE ---------------- */
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(compression());
app.use(morgan("dev"));

app.use(cors({
  origin: (origin, callback) => {
    // Allow any Vercel domain and localhost
    const isVercel = origin && (origin.endsWith(".vercel.app") || origin.includes("vercel"));
    const isLocal = !origin || origin.includes("localhost");

    if (isVercel || isLocal) {
      return callback(null, true);
    }
    return callback(new Error("CORS: Not allowed — " + origin));
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

/* ---------------- ROUTES ---------------- */

app.get("/api/v1/health", (req, res) => {
  res.json({ ok: true, status: "up", uptime: process.uptime() });
});

app.post("/api/v1/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: "No file uploaded" });
  res.json({ ok: true, filename: req.file.path });
});

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { ok: false, message: "Too many attempts" } });
app.use("/api/v1/auth", authLimiter);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/listings", listingRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/partner", partnerRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/misc", miscRoutes);
app.use("/api/v1/comm", communicationRoutes);

app.get("/", (_, res) => res.json({ ok: true, status: "Wayza API v1 Running" }));

app.use((err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err);
  res.status(err.status || 500).json({ ok: false, message: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Wayza backend running on PORT ${PORT}`);
});