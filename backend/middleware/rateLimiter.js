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
    const safeBody = { ...req.body };
    if (safeBody.password) safeBody.password = "[REDACTED]";
    if (safeBody.newPassword) safeBody.newPassword = "[REDACTED]";
    if (safeBody.oldPassword) safeBody.oldPassword = "[REDACTED]";
    if (safeBody.otp) safeBody.otp = "[REDACTED]";
    if (safeBody.razorpay_signature) safeBody.razorpay_signature = "[REDACTED]";
    if (safeBody.razorpay_payment_id) safeBody.razorpay_payment_id = "[REDACTED]";
    if (safeBody.twoFactorSecret) safeBody.twoFactorSecret = "[REDACTED]";
    
    captureEvent(req.ip, "Auth Brute Force Blocked", { 
        url: req.originalUrl,
        body: safeBody
    });
    res.status(options.statusCode).send(options.message);
  }
});

// Payment Limiter
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 15, // 15 orders per hour per IP
  message: { 
    ok: false, 
    message: "Too many payment attempts. Please contact support if you are having issues." 
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


