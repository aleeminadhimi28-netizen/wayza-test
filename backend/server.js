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
import { globalLimiter, authLimiter, uploadLimiter } from "./middleware/rateLimiter.js";
import { requireAuth } from "./middleware/auth.js";
import { activityLogger } from "./middleware/activityLogger.js";
import { securityGuards } from "./middleware/security.js";
import { shutdownPostHog } from "./utils/posthog.js";


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

// 1. PRODUCTION-READY PROXY & CORS
app.set("trust proxy", 1);

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",") 
  : ["http://localhost:5173", "http://localhost:3000", "https://wayza-test.vercel.app"];

const checkOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (allowedOrigins.includes(origin) || (process.env.NODE_ENV === "development" && origin.includes("localhost"))) {
    return callback(null, true);
  }
  // Allow any Vercel domain (production and previews)
  if (origin.endsWith(".vercel.app")) {
    return callback(null, true);
  }
  return callback(new Error("CORS: Origin not allowed by security policy"));
};

app.use(cors({
  origin: checkOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// 2. INITIALIZE DATABASE
connectDB();

/* ---------------- MIDDLEWARE ---------------- */
// 3. SECURE HEADERS (CSP)
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://us.i.posthog.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://us.i.posthog.com"],
      connectSrc: ["'self'", "wss:", "https://api.cloudinary.com", "https://*.onrender.com", "https://us.i.posthog.com", "https://*.vercel.app"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// 4. PERFORMANCE & LOGGING
app.use(compression());
app.use(morgan("dev"));

// 5. SECURITY GUARDS
app.use(securityGuards);

// 6. RATE LIMITING
app.use(globalLimiter);

// 7. BODY PARSING
app.use(express.json({ limit: "15kb" }));
app.use(express.urlencoded({ extended: true, limit: "15kb" }));
app.use(cookieParser());

// 8. AUDIT LOGGING
app.use(activityLogger); 

app.use("/uploads", express.static("uploads"));

const httpServer = createServer(app);
initSocket(httpServer, checkOrigin);


/* ---------------- ROUTES ---------------- */

app.get("/api/v1/health", (req, res) => {
  res.json({ ok: true, status: "up", uptime: process.uptime() });
});




// Apply upload specific rate limits
app.post("/api/v1/upload", uploadLimiter, requireAuth, upload.single("image"), (req, res) => {

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

process.on("SIGTERM", async () => {
    console.log("Shutting down PostHog...");
    await shutdownPostHog();
    process.exit(0);
});