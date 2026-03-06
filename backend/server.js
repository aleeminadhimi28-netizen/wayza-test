import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";

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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database
connectDB();

/* ---------------- MIDDLEWARE ---------------- */
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) return callback(null, true);
    return callback(new Error("CORS: Not allowed — " + origin));
  },
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ---------------- ROUTES ---------------- */

// Health Check
app.get("/api/v1/health", (req, res) => {
  res.json({ ok: true, status: "up", uptime: process.uptime() });
});

// File Upload
app.post("/api/v1/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: "No file uploaded" });
  res.json({ ok: true, filename: req.file.path });
});

// API v1 Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/listings", listingRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/partner", partnerRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/misc", miscRoutes);
app.use("/api/v1/comm", communicationRoutes);

// Legacy Root (for compatibility during transition if needed, or just redirect)
app.get("/", (_, res) => res.json({ ok: true, status: "Wayza API v1 Running" }));

/* ---------------- ERROR HANDLING ---------------- */
app.use((err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err);
  res.status(err.status || 500).json({ ok: false, message: err.message || "Internal Server Error" });
});

/* ---------------- START SERVER ---------------- */
app.listen(PORT, () => {
  console.log(`🚀 Wayza backend running on http://localhost:${PORT}`);
});