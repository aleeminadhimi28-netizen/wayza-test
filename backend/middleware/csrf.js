import crypto from "crypto";

/**
 * CSRF Protection Middleware — Double-Submit Cookie Pattern
 *
 * How it works:
 * 1. On GET /api/v1/auth/csrf-token, the server generates a random token,
 *    sets it as a non-httpOnly cookie (readable by JS), and returns it in JSON.
 * 2. On every mutating request (POST, PUT, PATCH, DELETE), the client must send
 *    the token back in the X-CSRF-Token header.
 * 3. The middleware compares the header value to the cookie value.
 *    If they don't match, the request is rejected.
 *
 * Why this works: An attacker on a different origin cannot read the cookie value
 * (same-origin policy), so they can't forge the header.
 */

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";
const TOKEN_LENGTH = 32;

/**
 * Generate a CSRF token and set it as a cookie
 */
export function generateCSRFToken(req, res) {
    const token = crypto.randomBytes(TOKEN_LENGTH).toString("hex");
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie(CSRF_COOKIE, token, {
        httpOnly: false,                          // Must be readable by client JS
        secure: isProduction,                     // HTTPS-only in production; allows HTTP in dev
        sameSite: isProduction ? "none" : "lax", // cross-origin in prod, lax in dev
        maxAge: 24 * 60 * 60 * 1000,             // 24 hours
        path: "/",
    });

    res.json({ ok: true, csrfToken: token });
}

/**
 * Middleware: Validate the CSRF token on mutating requests
 */
export function validateCSRF(req, res, next) {
    // Skip safe methods
    const safeMethods = ["GET", "HEAD", "OPTIONS"];
    if (safeMethods.includes(req.method)) return next();

    // Skip webhook routes (they use their own signature verification)
    if (req.path.startsWith("/webhooks/")) return next();

    const cookieToken = req.cookies?.[CSRF_COOKIE];
    const headerToken = req.headers?.[CSRF_HEADER];

    if (!cookieToken || !headerToken) {
        const missing = !cookieToken && !headerToken ? "both" : (!cookieToken ? "cookie" : "header");
        return res.status(403).json({
            ok: false,
            message: `CSRF validation failed: Missing ${missing}`
        });
    }

    // Timing-safe comparison to prevent timing attacks
    if (cookieToken.length !== headerToken.length) {
        return res.status(403).json({
            ok: false,
            message: "CSRF validation failed: Token mismatch"
        });
    }

    const valid = crypto.timingSafeEqual(
        Buffer.from(cookieToken),
        Buffer.from(headerToken)
    );

    if (!valid) {
        return res.status(403).json({
            ok: false,
            message: "CSRF validation failed: Token mismatch"
        });
    }

    next();
}
