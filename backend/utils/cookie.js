import dotenv from "dotenv";
dotenv.config();

/**
 * Utility to generate consistent and secure cookie options based on the request origin.
 * This dynamically selects SameSite=Lax for same-site requests (to avoid mobile Safari/Chrome blocking SameSite=None)
 * and SameSite=None for cross-site requests (like Vercel preview environments).
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {Object} options - Custom cookie options.
 * @param {boolean} [options.httpOnly=true] - Whether the cookie is httpOnly.
 * @param {number} [options.maxAge] - The maxAge of the cookie in milliseconds.
 * @param {boolean} [options.useDomain=false] - Whether to set the domain to .wayzza.live for same-site.
 * @param {string} [options.domain] - Explicit domain to override.
 * @returns {import('express').CookieOptions}
 */
export function getCookieOptions(req, options = {}) {
    const isProduction = process.env.NODE_ENV === "production";
    
    const origin = req.headers.origin || "";
    const referer = req.headers.referer || "";
    
    // Check if the request is coming from our main production domain
    const isSameSite = isProduction && (origin.includes("wayzza.live") || referer.includes("wayzza.live"));
    
    const cookieOptions = {
        httpOnly: options.httpOnly !== false,
        secure: isProduction,
        // Use "lax" for same-site requests to bypass third-party cookie blocking on mobile browsers.
        // Fall back to "none" for cross-origin preview / dev environments.
        sameSite: isProduction ? (isSameSite ? "lax" : "none") : "lax",
        maxAge: options.maxAge || 24 * 60 * 60 * 1000,
        path: "/"
    };

    if (options.domain) {
        cookieOptions.domain = options.domain;
    } else if (isProduction && isSameSite && options.useDomain) {
        cookieOptions.domain = ".wayzza.live";
    }

    return cookieOptions;
}
