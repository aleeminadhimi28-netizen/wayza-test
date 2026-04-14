import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { emitMessage } from "../utils/socket.js";
import { z } from "zod";

const chatSchema = z.object({
    message: z.string().min(1).max(2000)
});

const supportTicketSchema = z.object({
    subject: z.string().min(1).max(200),
    message: z.string().min(1).max(5000),
    category: z.string().optional().default("general")
});

const replySchema = z.object({
    reply: z.string().min(1).max(5000).optional(),
    status: z.enum(["open", "in_progress", "resolved", "closed"]).optional()
});

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
        const parsed = chatSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Message is required (max 2000 chars)" });

        const db = getDB();
        const { bookingId } = req.params;
        if (!ObjectId.isValid(bookingId)) return res.status(400).json({ ok: false, message: "Invalid booking ID" });

        const booking = await db.collection("bookings").findOne({ _id: new ObjectId(bookingId) });
        if (!booking) return res.status(404).json({ ok: false, message: "Booking not found" });

        const allowed = booking.guestEmail === req.user.email || booking.ownerEmail === req.user.email;
        if (!allowed) return res.status(403).json({ ok: false, message: "Not authorized for this chat" });

        const newMessage = {
            bookingId,
            senderEmail: req.user.email,
            message: parsed.data.message.trim(),
            createdAt: new Date()
        };

        const result = await db.collection("messages").insertOne(newMessage);
        newMessage._id = result.insertedId;

        emitMessage(bookingId, newMessage);

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
        const parsed = supportTicketSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Subject and message are required", errors: parsed.error.flatten() });

        const db = getDB();
        const { subject, message, category } = parsed.data;
        const ticket = {
            email: req.user.email,
            role: req.user.role || "user",
            subject, message,
            category,
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
        const parsed = replySchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid reply data", errors: parsed.error.flatten() });

        const db = getDB();
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ ok: false, message: "Invalid ticket ID" });

        const ticket = await db.collection("support_tickets").findOne({ _id: new ObjectId(req.params.id) });
        if (!ticket) return res.status(404).json({ ok: false, message: "Ticket not found" });

        if (req.user.role !== "admin" && ticket.email !== req.user.email) return res.status(403).json({ ok: false, message: "Not authorized" });

        const { reply, status } = parsed.data;
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
