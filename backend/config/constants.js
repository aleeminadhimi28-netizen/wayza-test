/**
 * WAYZZA BUSINESS CONSTANTS
 * Centralized configuration for all business logic values.
 * Change these here instead of hunting through individual route files.
 */

// Tax & Fees
export const GST_RATE = 0.12;          // 12% GST
export const SERVICE_FEE = 99;         // ₹99 flat service fee per booking

// Commission
export const COMMISSION_RATE = 0.10;   // 10% platform commission on bookings

// Upload Limits
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

// Auth
export const JWT_EXPIRY = "7d";
export const BCRYPT_ROUNDS = 10;
