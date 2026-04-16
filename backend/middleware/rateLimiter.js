import rateLimit from "express-rate-limit";
import { captureEvent } from "../utils/posthog.js";

/**
 * PRODUCTION-GRADE RATE LIMITING
 * 
 * We implement multiple tiers of rate limiting:
 * 1. Global Limiter: Prevents general DDoS and resource exhaustion.
 * 2. Auth Limiter: Stricter limits on login/signup/password resets.
 * 3. Upload Limiter: Prevents storage/bandwidth exhaustion.
 */

// Global Limiter - Applies to all requests
export const globalLimiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MINS) || 1) * 60 * 1000, 
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: "System busy. Please try again in 1 minute.",
  },
  keyGenerator: (req) => req.ip,
  handler: (req, res, next, options) => {
    captureEvent(req.ip, "Global Rate Limit Hit", { url: req.originalUrl });
    res.status(options.statusCode).send(options.message);
  }
});

// Sensitive Routes Limiter (Login, Signup, Password Resets)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per 15 mins for auth
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    ok: false,
    message: "Too many authentication attempts. Please try again in 15 minutes."
  },
  handler: (req, res, next, options) => {
    captureEvent(req.ip, "Auth Brute Force Blocked", { 
        url: req.originalUrl,
        email: req.body?.email || "unknown" 
    });
    res.status(options.statusCode).send(options.message);
  }
});

// File Upload Limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit to 20 uploads per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: "Upload limit reached. Please try again in an hour."
  },
  handler: (req, res, next, options) => {
    captureEvent(req.ip, "Upload Limit Hit", { url: req.originalUrl });
    res.status(options.statusCode).send(options.message);
  }
});


