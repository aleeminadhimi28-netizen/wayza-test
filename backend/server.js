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
import { globalLimiter, authLimiter, uploadLimiter, paymentLimiter } from "./middleware/rateLimiter.js";
import { requireAuth } from "./middleware/auth.js";
import { activityLogger } from "./middleware/activityLogger.js";
import { securityGuards } from "./middleware/security.js";
import { generateCSRFToken, validateCSRF } from "./middleware/csrf.js";
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
import payRoutes from "./routes/pay.js";
import webhookRoutes from "./routes/webhooks.js";

const app = express();
const PORT = process.env.PORT || 5000;

// 1. PRODUCTION-READY PROXY & CORS
app.set("trust proxy", 1);

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",") 
  : ["http://localhost:5173", "http://localhost:3000", "https://wayza-test.vercel.app", "https://wayzza.live", "https://www.wayzza.live"];

const checkOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (allowedOrigins.includes(origin) || (process.env.NODE_ENV === "development" && origin.includes("localhost"))) {
    return callback(null, true);
  }
  // Allow only Wayzza Vercel domains (production and previews)
  if (origin.endsWith(".vercel.app") && (origin.includes("wayza") || origin.includes("wayzza"))) {
    return callback(null, true);
  }
  return callback(new Error("CORS: Origin not allowed by security policy"));
};

app.use(cors({
  origin: checkOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-CSRF-Token"]
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
      connectSrc: ["'self'", "wss:", "https://api.cloudinary.com", "https://*.onrender.com", "https://us.i.posthog.com", "https://*.vercel.app", "https://*.wayzza.live", "https://wayzza.live"],
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

// 7. WEBHOOKS (raw body MUST come before express.json to preserve signature verification)
app.use("/api/v1/webhooks/razorpay", express.raw({ type: "application/json" }));

// 8. BODY PARSING
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(cookieParser());

// 9. AUDIT LOGGING
app.use(activityLogger); 

// 10. CSRF PROTECTION (after cookieParser, before routes)
// Skips GET/HEAD/OPTIONS and webhook routes automatically
if (process.env.NODE_ENV !== "test") {
  app.use("/api/v1", validateCSRF);
}

app.use("/uploads", express.static("uploads"));

const httpServer = createServer(app);
initSocket(httpServer, checkOrigin);


/* ---------------- ROUTES ---------------- */

app.get("/api/v1/health", (req, res) => {
  res.json({ ok: true, status: "up", uptime: process.uptime() });
});

// CSRF token endpoint (must be before the CSRF middleware for GET requests to work)
app.get("/api/v1/auth/csrf-token", generateCSRFToken);




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
app.use("/api/v1/payments", paymentLimiter, payRoutes);

// Webhook routes (raw body parser was registered above, before express.json)
app.use("/api/v1/webhooks", webhookRoutes);

app.get("/", (_, res) => res.json({ ok: true, status: "Wayzza API v1 Running" }));

app.use((err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err);
  res.status(err.status || 500).json({ ok: false, message: err.message || "Internal Server Error" });
});


httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Wayzza backend running with WebSockets on PORT ${PORT}`);
});

process.on("SIGTERM", async () => {
    console.log("Shutting down PostHog...");
    await shutdownPostHog();
    process.exit(0);
});