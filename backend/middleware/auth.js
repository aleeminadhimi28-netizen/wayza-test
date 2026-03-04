import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "wayza-dev-secret";

export function requireAuth(req, res, next) {

    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = header.split(" ")[1];

    if (!token || token === "undefined") {
        return res.status(401).json({ error: "Invalid token" });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.log("JWT VERIFY ERROR:", err.message);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}