import { getDB } from "../config/db.js";

export const activityLogger = (req, res, next) => {
    // Intercept after response finishes
    res.on("finish", () => {
        // Skip GET and OPTIONS to prevent noise, unless it's a critical read like downloading data
        if (req.method === "GET" || req.method === "OPTIONS") return;
        
        // Skip internal logs fetches so tracking the tracker doesn't cause a loop
        if (req.originalUrl.includes("/logs") || req.originalUrl.includes("/stats")) return;

        try {
            const db = getDB();
            if (!db) return; 

            // Extract identity if available
            const userEmail = req?.user?.email || req?.body?.email || "anonymous";
            
            const safeBody = {};
            const allowedKeys = ['listingId', 'variantIndex', 'checkIn', 'checkOut', 'status', 'role', 'title', 'category', 'location', 'price', 'nights', 'bookingId'];
            for (const key of Object.keys(req.body || {})) {
                if (allowedKeys.includes(key)) {
                    safeBody[key] = req.body[key];
                } else {
                    safeBody[key] = "[FILTERED]";
                }
            }
            
            const logEntry = {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                actor: userEmail,
                body: safeBody,
                ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                createdAt: new Date()
            };

            db.collection("activityLogs").insertOne(logEntry).catch(() => {});
        } catch (err) {
            // Fail silently to avoid breaking the main request
        }
    });

    next();
};
