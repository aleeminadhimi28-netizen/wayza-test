import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET = process.env.JWT_SECRET;

export function requireAuth(req, res, next) {
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
            error: "No token provided"
        });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;

        next();

    } catch (err) {

        console.log("JWT VERIFY ERROR:", err.message);

        return res.status(401).json({
            ok: false,
            error: "Invalid or expired token"
        });

    }

}