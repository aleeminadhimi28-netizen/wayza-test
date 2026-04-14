import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/**
 * PRODUCTION-GRADE RATE LIMITING
 * 
 * We implement two tiers of rate limiting:
 * 1. Global Limiter: Prevents general DDoS and resource exhaustion.
 * 2. Auth Limiter: Stricter limits on login/signup to prevent brute-force attacks.
 */

// Global Limiter - Applies to all requests
export const globalLimiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MINS) || 1) * 60 * 1000, // Default 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Default 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    ok: false,
    message: "Too many requests from this IP, please try again later.",
    retryAfter: "1 minute"
  },
  // Key by IP and User ID if available (handled in server.js after auth middleware if needed)
  keyGenerator: (req) => {
    return req.user ? req.user.email : ipKeyGenerator(req);
  }
});

// Sensitive Routes Limiter (Login, Signup, Password Resets)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per 15 mins for auth
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: "Too many authentication attempts. Please try again in 15 minutes."
  }
});
