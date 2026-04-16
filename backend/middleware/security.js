import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import slowDown from "express-slow-down";
import { captureEvent } from "../utils/posthog.js";

/**
 * DEFENSIVE SLOW DOWN
 * This penalizes clients that make too many requests by adding a delay
 * to their response. This is more "polite" than a hard block and helps 
 * mitigate Layer 7 DDoS by making it expensive for the attacker to maintain connections.
 */
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: (hits) => (hits - 50) * 500, // add 500ms of delay per hit after the 50th
  maxDelayMs: 20000, // maximum delay of 20 seconds
  onLimitReached: (req) => {
    captureEvent(req.ip, "Security Throttling Initiated", {
        url: req.originalUrl,
        hits: req.slowDown?.current || "multiple"
    });
  }
});

/**
 * SECURITY MIDDLEWARE COMPOSITION
 * Exports a set of standard security guards to be used in server.js
 */
export const securityGuards = [
  // 1. Prevent NoSQL Injection by stripping out $ and . from keys in req.body/params/query
  mongoSanitize(),

  // 2. Prevent HTTP Parameter Pollution (e.g. ?id=1&id=2)
  hpp(),

  // 3. Apply the speed limiter (Penalize high frequency)
  speedLimiter,
];

