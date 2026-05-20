import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getDB } from "../config/db.js";

dotenv.config();

const SECRET = process.env.JWT_SECRET;

/**
 * REQUIRE AUTH MIDDLEWARE
 * Enforces that a valid JWT is present in either cookies or Authorization header.
 */
export async function requireAuth(req, res, next) {
    if (!SECRET) {
        console.error("FATAL: JWT_SECRET is not defined in environment.");
        return res.status(500).json({ ok: false, error: "Internal server security configuration error" });
    }

    let token = null;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else {
        const header = req.headers.authorization;
        if (header && header.startsWith("Bearer ")) {
            token = header.split(" ")[1];
        }
    }

    if (!token) {
        return res.status(401).json({
            ok: false,
            error: "Authentication required: No token provided"
        });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        
        // Ensure critical fields exist in the token
        if (!decoded.email || !decoded.role) {
            throw new Error("Invalid token payload structure");
        }

        // Query database to check if user is muted/suspended
        const db = getDB();
        const userDoc = await db.collection("users").findOne({ email: decoded.email });
        if (userDoc && userDoc.muted === true) {
            return res.status(403).json({
                ok: false,
                error: "Your account has been suspended. Please contact customer support."
            });
        }

        req.user = decoded;
        next();

    } catch (err) {
        console.log(`[AUTH] Unauthorized access attempt: ${err.message}`);
        return res.status(401).json({
            ok: false,
            error: "Invalid or expired session. Please login again."
        });
    }
}

/**
 * REQUIRE ROLE MIDDLEWARE
 * Enforces that the authenticated user has one of the allowed roles.
 */
export function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ ok: false, error: "Authentication required" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            console.warn(`[AUTH] Access denied for ${req.user.email}: Role '${req.user.role}' not in [${allowedRoles}]`);
            return res.status(403).json({
                ok: false,
                error: "Access denied: Insufficient permissions"
            });
        }

        next();
    };
}