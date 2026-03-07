import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { getTransporter, payoutSettledEmail, withdrawalStatusEmail } from "../utils/emailTemplates.js";

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

router.post("/login", async (req, res, next) => {
    try {
        const db = getDB();
        const users = db.collection("users");
        const { email, password } = req.body;
        const user = await users.findOne({ email });
        if (!user || user.role !== "admin")
            return res.status(401).json({ ok: false, message: "Unauthorized: Not an admin account" });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ ok: false, message: "Invalid password" });

        const token = jwt.sign({ email: user.email, role: "admin" }, SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({ ok: true, email: user.email });
    } catch (err) { next(err); }
});

router.get("/stats", requireAuth, async (req, res, next) => {
    try {
        if (req.user.role !== "admin")
            return res.status(403).json({ ok: false, message: "Admin only" });

        const db = getDB();
        const users = db.collection("users");
        const listings = db.collection("listings");
        const bookings = db.collection("bookings");

        const [totalUsers, totalPartners, totalListings, totalBookings, pendingListings, recentBookings] = await Promise.all([
            users.countDocuments({ role: { $ne: "admin" } }),
            users.countDocuments({ role: "partner" }),
            listings.countDocuments(),
            bookings.countDocuments({ status: "paid" }),
            listings.countDocuments({ approved: false }),
            bookings.find({ status: "paid" }).sort({ createdAt: -1 }).limit(5).toArray()
        ]);

        const paid = await bookings.find({ status: "paid" }).toArray();
        const totalRevenue = paid.reduce((s, b) => s + (b.totalPrice || 0), 0);
        const platformCommission = Math.round(totalRevenue * 0.1);

        const revenueMap = {};
        paid.forEach(b => {
            const d = new Date(b.createdAt);
            const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
            const label = d.toLocaleString("default", { month: "short" });
            if (!revenueMap[key]) revenueMap[key] = { name: label, rev: 0 };
            revenueMap[key].rev += b.totalPrice || 0;
        });
        const monthlyRevenue = Object.values(revenueMap).sort((a, b) => a.name > b.name ? 1 : -1).slice(-6);

        res.json({
            ok: true,
            totalUsers,
            totalPartners,
            totalListings,
            totalBookings,
            totalRevenue,
            platformCommission,
            pendingListings,
            recentBookings,
            monthlyRevenue
        });
    } catch (err) { next(err); }
});

router.get("/users", requireAuth, async (req, res, next) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ ok: false });
        const db = getDB();
        const users = db.collection("users");
        const list = await users.find({ role: { $ne: "admin" } }, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
        res.json({ ok: true, data: list });
    } catch (err) { next(err); }
});

router.get("/partners", requireAuth, async (req, res, next) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ ok: false });
        const db = getDB();
        const partners = db.collection("partners");
        const list = await partners.find({}).sort({ createdAt: -1 }).toArray();
        res.json({ ok: true, data: list });
    } catch (err) { next(err); }
});

router.delete("/users/:email", requireAuth, async (req, res, next) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ ok: false });
        const db = getDB();
        await db.collection("users").deleteOne({ email: req.params.email });
        await db.collection("partners").deleteOne({ email: req.params.email });
        await db.collection("listings").deleteMany({ ownerEmail: req.params.email });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.delete("/partners/:email", requireAuth, async (req, res, next) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ ok: false });
        const db = getDB();
        await db.collection("partners").deleteOne({ email: req.params.email });
        await db.collection("users").deleteOne({ email: req.params.email });
        await db.collection("listings").deleteMany({ ownerEmail: req.params.email });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.get("/listings", requireAuth, async (req, res, next) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ ok: false });
        const db = getDB();
        const list = await db.collection("listings").find({}).sort({ createdAt: -1 }).toArray();
        res.json({ ok: true, data: list });
    } catch (err) { next(err); }
});

router.delete("/listings/:id", requireAuth, async (req, res, next) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ ok: false });
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ ok: false });
        const db = getDB();
        await db.collection("listings").deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.patch("/listings/:id/approve", requireAuth, async (req, res, next) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ ok: false });
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ ok: false });

        const db = getDB();
        const { approved } = req.body;
        await db.collection("listings").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { approved: approved === true, approvedAt: new Date() } }
        );
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.patch("/users/:email/mute", requireAuth, async (req, res, next) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ ok: false });
        const db = getDB();
        const { muted } = req.body;
        await db.collection("users").updateOne({ email: req.params.email }, { $set: { muted: muted === true, mutedAt: new Date() } });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.get("/bookings", requireAuth, async (req, res, next) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ ok: false });
        const db = getDB();
        const list = await db.collection("bookings").find({}).sort({ createdAt: -1 }).toArray();
        res.json({ ok: true, data: list });
    } catch (err) { next(err); }
});

router.patch("/bookings/:id/payout", requireAuth, async (req, res, next) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ ok: false });
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ ok: false });

        const db = getDB();
        const { status } = req.body;
        const booking = await db.collection("bookings").findOne({ _id: new ObjectId(req.params.id) });
        await db.collection("bookings").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { payoutStatus: status, settledAt: new Date() } }
        );

        // Send email notification to partner
        const transporter = getTransporter();
        if (transporter && booking?.ownerEmail && status === "paid_out") {
            transporter.sendMail(payoutSettledEmail({
                ownerEmail: booking.ownerEmail,
                amount: booking.netEarnings || Math.round(booking.totalPrice * 0.9),
                bookingTitle: booking.title || "Your Property"
            })).catch(e => console.error("Payout email error:", e));
        }

        res.json({ ok: true });
    } catch (err) { next(err); }
});

// ===== WITHDRAWAL MANAGEMENT =====

router.get("/withdrawals", requireAuth, async (req, res, next) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ ok: false });
        const db = getDB();
        const rows = await db.collection("withdrawalRequests").find({}).sort({ requestedAt: -1 }).toArray();
        res.json({ ok: true, data: rows });
    } catch (err) { next(err); }
});

router.patch("/withdrawals/:id", requireAuth, async (req, res, next) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ ok: false });
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ ok: false });

        const db = getDB();
        const { status, reason } = req.body; // "approved", "completed", "rejected"
        const request = await db.collection("withdrawalRequests").findOne({ _id: new ObjectId(req.params.id) });

        await db.collection("withdrawalRequests").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status, reason: reason || null, processedAt: new Date() } }
        );

        // Send email notification
        const transporter = getTransporter();
        if (transporter && request?.email) {
            transporter.sendMail(withdrawalStatusEmail({
                ownerEmail: request.email,
                amount: request.amount,
                status,
                reason
            })).catch(e => console.error("Withdrawal email error:", e));
        }

        res.json({ ok: true });
    } catch (err) { next(err); }
});

export default router;
