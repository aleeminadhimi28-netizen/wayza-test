import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET = process.env.JWT_SECRET;

export function requireAuth(req, res, next) {

    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({
            ok: false,
            error: "No token provided"
        });
    }

    const token = header.split(" ")[1];

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