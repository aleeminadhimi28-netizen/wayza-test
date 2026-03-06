import express from "express";
import { getDB } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* ================= REVIEWS ================= */

router.get("/reviews/:listingId", async (req, res, next) => {
    try {
        const db = getDB();
        const rows = await db.collection("reviews").find({ listingId: req.params.listingId }).sort({ createdAt: -1 }).toArray();
        res.json({ ok: true, data: rows });
    } catch (err) { next(err); }
});

router.post("/reviews", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const { listingId, rating, comment } = req.body;
        if (!listingId || !rating) return res.status(400).json({ ok: false });

        const booked = await db.collection("bookings").findOne({ listingId, guestEmail: req.user.email, status: "paid" });
        if (!booked) return res.status(403).json({ ok: false, message: "You must book to review" });

        const already = await db.collection("reviews").findOne({ listingId, guestEmail: req.user.email });
        if (already) return res.status(400).json({ ok: false, message: "Already reviewed" });

        await db.collection("reviews").insertOne({
            listingId,
            rating: Number(rating),
            comment,
            guestEmail: req.user.email,
            createdAt: new Date()
        });

        res.json({ ok: true });
    } catch (err) { next(err); }
});

/* ================= WISHLIST ================= */

router.get("/wishlist", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const rows = await db.collection("wishlists").find({ email: req.user.email }).toArray();
        res.json({ ok: true, data: rows });
    } catch (err) { next(err); }
});

router.post("/wishlist/toggle", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const { listingId, title } = req.body;
        const email = req.user.email;
        const existing = await db.collection("wishlists").findOne({ email, listingId });

        if (existing) {
            await db.collection("wishlists").deleteOne({ _id: existing._id });
            return res.json({ ok: true, saved: false });
        } else {
            await db.collection("wishlists").insertOne({ email, listingId, title, createdAt: new Date() });
            return res.json({ ok: true, saved: true });
        }
    } catch (err) { next(err); }
});

export default router;
