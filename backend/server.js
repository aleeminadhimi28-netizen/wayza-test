import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./utils/socket.js";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { globalLimiter, authLimiter } from "./middleware/rateLimiter.js";
import { requireAuth } from "./middleware/auth.js";

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

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",") 
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || (process.env.NODE_ENV === "development" && origin.includes("localhost"))) {
      return callback(null, true);
    }
    
    // Check for Vercel preview deployments if in staging/dev
    if (origin.endsWith(".vercel.app") && process.env.NODE_ENV === "development") {
      return callback(null, true);
    }

    return callback(new Error("CORS: Origin not allowed by security policy"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

const httpServer = createServer(app);
initSocket(httpServer, allowedOrigins);

// Apply global rate limiting to all requests
app.use(globalLimiter);

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

/* ---------------- ROUTES ---------------- */

app.get("/api/v1/health", (req, res) => {
  res.json({ ok: true, status: "up", uptime: process.uptime() });
});

app.post("/api/v1/upload", requireAuth, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: "No file uploaded" });
  res.json({ ok: true, filename: req.file.path });
});

// Apply stricter rate limiting to auth routes
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

httpServer.listen(PORT, () => {
  console.log(`🚀 Wayza backend running with WebSockets on PORT ${PORT}`);
});