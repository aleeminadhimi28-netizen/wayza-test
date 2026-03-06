import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* ================= CHAT ================= */

router.get("/chat/:bookingId", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const { bookingId } = req.params;
        if (!ObjectId.isValid(bookingId)) return res.status(400).json({ ok: false });

        const booking = await db.collection("bookings").findOne({ _id: new ObjectId(bookingId) });
        if (!booking) return res.status(404).json({ ok: false });

        const allowed = booking.guestEmail === req.user.email || booking.ownerEmail === req.user.email;
        if (!allowed) return res.status(403).json({ ok: false });

        const rows = await db.collection("messages").find({ bookingId }).sort({ createdAt: 1 }).toArray();
        res.json({ ok: true, data: rows });
    } catch (err) { next(err); }
});

router.post("/chat/:bookingId", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const { bookingId } = req.params;
        const { message } = req.body;
        if (!message?.trim()) return res.status(400).json({ ok: false });
        if (!ObjectId.isValid(bookingId)) return res.status(400).json({ ok: false });

        const booking = await db.collection("bookings").findOne({ _id: new ObjectId(bookingId) });
        if (!booking) return res.status(404).json({ ok: false });

        const allowed = booking.guestEmail === req.user.email || booking.ownerEmail === req.user.email;
        if (!allowed) return res.status(403).json({ ok: false });

        await db.collection("messages").insertOne({
            bookingId,
            senderEmail: req.user.email,
            message: message.trim(),
            createdAt: new Date()
        });

        res.json({ ok: true });
    } catch (err) { next(err); }
});

/* ================= NOTIFICATIONS ================= */

router.get("/notifications", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const rows = await db.collection("notifications").find({ email: req.user.email }).sort({ createdAt: -1 }).limit(20).toArray();
        res.json({ ok: true, data: rows });
    } catch (err) { next(err); }
});

router.post("/notifications/read", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        await db.collection("notifications").updateMany({ email: req.user.email }, { $set: { read: true } });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

/* ================= SUPPORT TICKETS ================= */

router.post("/support-tickets", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const { subject, message, category } = req.body;
        if (!subject || !message) return res.status(400).json({ ok: false, message: "Subject and message required" });
        const ticket = {
            email: req.user.email,
            role: req.user.role || "user",
            subject, message,
            category: category || "general",
            status: "open",
            replies: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await db.collection("support_tickets").insertOne(ticket);
        res.json({ ok: true, id: result.insertedId });
    } catch (err) { next(err); }
});

router.get("/support-tickets", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        let query = {};
        if (req.user.role !== "admin") query.email = req.user.email;
        const list = await db.collection("support_tickets").find(query).sort({ updatedAt: -1 }).toArray();
        res.json({ ok: true, data: list });
    } catch (err) { next(err); }
});

router.patch("/support-tickets/:id/reply", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ ok: false });
        const { reply, status } = req.body;

        const ticket = await db.collection("support_tickets").findOne({ _id: new ObjectId(req.params.id) });
        if (!ticket) return res.status(404).json({ ok: false });

        // Admins can reply to any, users only to theirs
        if (req.user.role !== "admin" && ticket.email !== req.user.email) return res.status(403).json({ ok: false });

        const update = { $set: { updatedAt: new Date() } };
        if (reply) {
            update.$push = { replies: { message: reply, from: req.user.role === "admin" ? "admin" : "user", createdAt: new Date() } };
        }
        if (status && req.user.role === "admin") update.$set.status = status;
        if (req.user.role !== "admin") update.$set.status = "open";

        await db.collection("support_tickets").updateOne({ _id: new ObjectId(req.params.id) }, update);
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.delete("/admin/support-tickets/:id", requireAuth, async (req, res, next) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ ok: false });
        const db = getDB();
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ ok: false });
        await db.collection("support_tickets").deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

export default router;
