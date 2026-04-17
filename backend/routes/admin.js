import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getTransporter, payoutSettledEmail, withdrawalStatusEmail } from "../utils/emailTemplates.js";
import { sendWhatsAppAlert, formatWhatsAppListingApproved, formatWhatsAppPartnerOnboarded } from "../utils/whatsapp.js";
import { z } from "zod";
import { JWT_EXPIRY } from "../config/constants.js";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

router.post("/login", async (req, res, next) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid input", errors: parsed.error.flatten() });

        const db = getDB();
        const users = db.collection("users");
        const { email, password } = parsed.data;
        const user = await users.findOne({ email });
        if (!user || user.role !== "admin")
            return res.status(401).json({ ok: false, message: "Unauthorized: Not an admin account" });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ ok: false, message: "Invalid password" });

        const token = jwt.sign({ email: user.email, role: "admin" }, SECRET, { expiresIn: JWT_EXPIRY });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({ ok: true, email: user.email });
    } catch (err) { next(err); }
});

router.patch("/config", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
        const { gstRate, serviceFee, commissionRate } = req.body;
        if (typeof gstRate !== "number" || typeof serviceFee !== "number" || typeof commissionRate !== "number") {
             return res.status(400).json({ ok: false, message: "Invalid configuration types" });
        }
        
        const db = getDB();
        await db.collection("settings").updateOne(
            { type: "financials" },
            { $set: { gstRate, serviceFee, commissionRate, updatedAt: new Date() } },
            { upsert: true }
        );
        res.json({ ok: true, message: "Platform configuration updated safely." });
    } catch (err) { next(err); }
});

router.get("/stats", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
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
        const platformCommission = paid.reduce((s, b) => s + (b.commissionAmount || Math.round((b.totalPrice || 0) * 0.10)), 0);

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

router.get("/users", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
        const db = getDB();
        const users = db.collection("users");
        const list = await users.find({ role: { $ne: "admin" } }, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
        res.json({ ok: true, data: list });
    } catch (err) { next(err); }
});

router.get("/partners", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
        const db = getDB();
        const partners = db.collection("partners");
        const list = await partners.find({}).sort({ createdAt: -1 }).toArray();
        res.json({ ok: true, data: list });
    } catch (err) { next(err); }
});

router.delete("/users/:email", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
        const db = getDB();
        await db.collection("users").deleteOne({ email: req.params.email });
        await db.collection("partners").deleteOne({ email: req.params.email });
        await db.collection("listings").deleteMany({ ownerEmail: req.params.email });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.delete("/partners/:email", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
        const db = getDB();
        await db.collection("partners").deleteOne({ email: req.params.email });
        await db.collection("users").deleteOne({ email: req.params.email });
        await db.collection("listings").deleteMany({ ownerEmail: req.params.email });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.get("/listings", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
        const db = getDB();
        const list = await db.collection("listings").find({}).sort({ createdAt: -1 }).toArray();
        res.json({ ok: true, data: list });
    } catch (err) { next(err); }
});

router.delete("/listings/:id", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ ok: false });
        const db = getDB();
        await db.collection("listings").deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.patch("/partners/:email/approve", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
        const db = getDB();
        await db.collection("partners").updateOne(
            { email: req.params.email },
            { $set: { onboarded: true, updatedAt: new Date() } }
        );

        // Notify Partner of account approval
        const partner = await db.collection("partners").findOne({ email: req.params.email });
        if (partner?.phone) {
            const msg = formatWhatsAppPartnerOnboarded({ email: req.params.email });
            sendWhatsAppAlert(partner.phone, msg).catch(e => console.error("WhatsApp alert error:", e));
        }

        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.patch("/listings/:id/approve", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ ok: false });

        const db = getDB();
        const { approved } = req.body;
        await db.collection("listings").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { approved: approved === true, approvedAt: new Date() } }
        );

        // Notify Partner of listing approval
        if (approved === true) {
            const listing = await db.collection("listings").findOne({ _id: new ObjectId(req.params.id) });
            const partner = await db.collection("partners").findOne({ email: listing?.ownerEmail });
            if (partner?.phone) {
                const msg = formatWhatsAppListingApproved({ title: listing.title });
                sendWhatsAppAlert(partner.phone, msg).catch(e => console.error("WhatsApp alert error:", e));
            }
        }

        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.patch("/users/:email/mute", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
        const db = getDB();
        const { muted } = req.body;
        await db.collection("users").updateOne({ email: req.params.email }, { $set: { muted: muted === true, mutedAt: new Date() } });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.get("/bookings", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
        const db = getDB();
        const list = await db.collection("bookings").find({}).sort({ createdAt: -1 }).toArray();
        res.json({ ok: true, data: list });
    } catch (err) { next(err); }
});

router.patch("/bookings/:id/payout", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ ok: false });

        const db = getDB();
        const { status } = req.body;
        const booking = await db.collection("bookings").findOne({ _id: new ObjectId(req.params.id) });
        await db.collection("bookings").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { payoutStatus: status, settledAt: new Date() } }
        );

        // Send email notification to partner
        const transporter = await getTransporter();
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

router.get("/withdrawals", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
        const db = getDB();
        const rows = await db.collection("withdrawalRequests").find({}).sort({ requestedAt: -1 }).toArray();
        res.json({ ok: true, data: rows });
    } catch (err) { next(err); }
});

router.patch("/withdrawals/:id", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ ok: false });

        const db = getDB();
        const { status, reason } = req.body; // "approved", "completed", "rejected"
        const request = await db.collection("withdrawalRequests").findOne({ _id: new ObjectId(req.params.id) });

        await db.collection("withdrawalRequests").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status, reason: reason || null, processedAt: new Date() } }
        );

        // Send email notification
        const transporter = await getTransporter();
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

// ===== COUPON MANAGEMENT =====

const createCouponSchema = z.object({
    code: z.string().min(3).max(20),
    discountPercentage: z.number().min(0.01).max(0.99)
});

router.get("/coupons", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
        const db = getDB();
        const coupons = await db.collection("coupons").find({}).sort({ createdAt: -1 }).toArray();
        res.json({ ok: true, data: coupons });
    } catch (err) { next(err); }
});

router.post("/coupons", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
        const parsed = createCouponSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid coupon data", errors: parsed.error.flatten() });

        const db = getDB();
        const { code, discountPercentage } = parsed.data;
        const normalizedCode = code.toUpperCase();

        const existing = await db.collection("coupons").findOne({ code: normalizedCode });
        if (existing) {
            return res.status(400).json({ ok: false, message: "Coupon code already exists" });
        }

        const coupon = {
            code: normalizedCode,
            discountPercentage,
            isActive: true,
            createdAt: new Date()
        };

        await db.collection("coupons").insertOne(coupon);
        res.json({ ok: true, data: coupon });
    } catch (err) { next(err); }
});

router.delete("/coupons/:id", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ ok: false });

        const db = getDB();
        await db.collection("coupons").deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.get("/logs", requireAuth, requireRole(["admin"]), async (req, res, next) => {
    try {
        const db = getDB();
        const logs = await db.collection("activityLogs")
            .find({})
            .sort({ createdAt: -1 })
            .limit(200) // limit results for performance
            .toArray();
        res.json({ ok: true, data: logs });
    } catch (err) { next(err); }
});

export default router;
