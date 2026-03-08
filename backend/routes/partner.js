import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDB } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { z } from "zod";

const walletSchema = z.object({
    accountName: z.string().min(2),
    accountNumber: z.string().min(5),
    ifscCode: z.string().min(4),
    bankName: z.string().min(2),
    upiId: z.string().optional()
});

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

router.post("/register", async (req, res, next) => {
    try {
        const db = getDB();
        const users = db.collection("users");
        const partners = db.collection("partners");
        const { email, password, businessName, type } = req.body;
        if (!email || !password) return res.status(400).json({ ok: false });

        const exists = await users.findOne({ email });
        if (exists) return res.status(400).json({ ok: false, message: "Email already registered" });

        const hash = await bcrypt.hash(password, 10);
        await users.insertOne({ email, password: hash, role: "partner", createdAt: new Date() });
        await partners.insertOne({ email, businessName, type, onboarded: false, createdAt: new Date() });

        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.post("/login", async (req, res, next) => {
    try {
        const db = getDB();
        const users = db.collection("users");
        const { email, password } = req.body;
        const user = await users.findOne({ email });
        if (!user || user.role !== "partner")
            return res.status(401).json({ ok: false, message: "Not a partner account" });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ ok: false, message: "Invalid password" });

        const token = jwt.sign({ email: user.email, role: "partner" }, SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({ ok: true, email: user.email });
    } catch (err) { next(err); }
});

router.get("/status/:email", async (req, res, next) => {
    try {
        const db = getDB();
        const partners = db.collection("partners");
        const partner = await partners.findOne({ email: req.params.email });
        res.json({ onboarded: partner?.onboarded === true });
    } catch (err) { next(err); }
});

router.post("/onboard", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const partners = db.collection("partners");
        const listings = db.collection("listings");
        const { businessName, category, location, firstListing } = req.body;
        const email = req.user.email;

        await partners.updateOne(
            { email },
            { $set: { businessName, category, location, onboarded: true, updatedAt: new Date() } },
            { upsert: true }
        );

        if (firstListing?.title) {
            await listings.insertOne({
                title: firstListing.title,
                price: firstListing.price || 0,
                location, category,
                ownerEmail: email,
                variants: [],
                approved: false,
                latitude: firstListing.latitude ? Number(firstListing.latitude) : null,
                longitude: firstListing.longitude ? Number(firstListing.longitude) : null,
                createdAt: new Date()
            });
        }

        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.get("/earnings", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const bookings = db.collection("bookings");
        const allPaid = await bookings.find({ ownerEmail: req.user.email, status: "paid" }).toArray();

        let totalRevenue = 0;
        let platformFee = 0;
        let ownerPayout = 0;

        let pendingBalance = 0; // Money from future stays
        let availableBalance = 0; // Money from stays that have started/completed
        let alreadyPaid = 0; // Money already transferred to partner's bank

        const now = new Date();

        allPaid.forEach(b => {
            const earnings = b.netEarnings || (b.totalPrice * 0.9);
            const fee = b.commissionAmount || (b.totalPrice * 0.1);

            totalRevenue += b.totalPrice || 0;
            platformFee += fee;
            ownerPayout += earnings;

            if (b.payoutStatus === "paid_out") {
                alreadyPaid += earnings;
            } else {
                const checkInDate = new Date(b.checkIn);
                if (checkInDate > now) {
                    pendingBalance += earnings;
                } else {
                    availableBalance += earnings;
                }
            }
        });

        res.json({
            ok: true,
            totalRevenue: Math.round(totalRevenue),
            platformFee: Math.round(platformFee),
            ownerPayout: Math.round(ownerPayout),
            pendingBalance: Math.round(pendingBalance),
            availableBalance: Math.round(availableBalance),
            alreadyPaid: Math.round(alreadyPaid),
            totalBookings: allPaid.length
        });
    } catch (err) { next(err); }
});

router.get("/monthly-revenue", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const bookings = db.collection("bookings");
        const paid = await bookings.find({ ownerEmail: req.user.email, status: "paid" }).toArray();
        const map = {};
        paid.forEach(b => {
            const d = new Date(b.createdAt);
            const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
            const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
            if (!map[key]) map[key] = { month: label, revenue: 0, bookings: 0 };
            map[key].revenue += b.totalPrice || 0;
            map[key].bookings += 1;
        });
        const data = Object.values(map).sort((a, b) => a.month > b.month ? 1 : -1);
        res.json({ ok: true, data });
    } catch (err) { next(err); }
});

/* ================= OWNER SPECIFIC ================= */

router.get("/listings/:email", requireAuth, async (req, res, next) => {
    try {
        if (req.user.email !== req.params.email && req.user.role !== "admin") return res.status(403).json({ ok: false, message: "Forbidden" });
        const db = getDB();
        const listings = db.collection("listings");
        const rows = await listings.find({ ownerEmail: req.params.email }).sort({ createdAt: -1 }).toArray();
        res.json(rows);
    } catch (err) { next(err); }
});

router.get("/bookings", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const bookings = db.collection("bookings");
        const rows = await bookings.find({ ownerEmail: req.user.email }).sort({ createdAt: -1 }).toArray();
        res.json(rows);
    } catch (err) { next(err); }
});

// ===== WALLET =====

router.get("/wallet", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const wallets = db.collection("partnerWallets");
        const wallet = await wallets.findOne({ email: req.user.email });
        res.json({ ok: true, wallet: wallet || null });
    } catch (err) { next(err); }
});

router.post("/wallet", requireAuth, async (req, res, next) => {
    try {
        const parsed = walletSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid input", errors: parsed.error.flatten() });

        const db = getDB();
        const wallets = db.collection("partnerWallets");
        const { accountName, accountNumber, ifscCode, bankName, upiId } = parsed.data;
        await wallets.updateOne(
            { email: req.user.email },
            { $set: { email: req.user.email, accountName, accountNumber, ifscCode, bankName, upiId, updatedAt: new Date() } },
            { upsert: true }
        );
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.post("/wallet/request", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const withdrawals = db.collection("withdrawalRequests");
        const { amount } = req.body;
        if (!amount || Number(amount) <= 0) return res.status(400).json({ ok: false, message: "Invalid amount" });

        // Check available balance by summing netEarnings from cleared bookings
        const bookings = db.collection("bookings");
        const now = new Date();
        const allPaid = await bookings.find({ ownerEmail: req.user.email, status: "paid" }).toArray();
        const available = allPaid.reduce((sum, b) => {
            if (b.payoutStatus === "paid_out") return sum;
            if (new Date(b.checkIn) <= now) return sum + (b.netEarnings || (b.totalPrice * 0.9));
            return sum;
        }, 0);

        if (Number(amount) > Math.round(available)) {
            return res.status(400).json({ ok: false, message: "Insufficient available balance" });
        }

        await withdrawals.insertOne({
            email: req.user.email,
            amount: Number(amount),
            status: "pending",
            requestedAt: new Date()
        });

        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.get("/wallet/requests", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const withdrawals = db.collection("withdrawalRequests");
        const rows = await withdrawals.find({ email: req.user.email }).sort({ requestedAt: -1 }).toArray();
        res.json({ ok: true, data: rows });
    } catch (err) { next(err); }
});

/* ================= CALENDAR SYNC (ICS) ================= */

router.get("/calendar-feed/:token", async (req, res, next) => {
    try {
        const db = getDB();
        const partners = db.collection("partners");
        const bookings = db.collection("bookings");

        // The token is a secure string
        const partner = await partners.findOne({ calendarToken: req.params.token });
        if (!partner) return res.status(404).send("Invalid Calendar Token");

        const rows = await bookings.find({
            ownerEmail: partner.email,
            status: "paid"
        }).toArray();

        let ics = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Wayza//Partner Calendar//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH"
        ];

        rows.forEach(b => {
            const start = new Date(b.checkIn).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
            const end = new Date(b.checkOut).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
            const created = new Date(b.createdAt || new Date()).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

            ics.push("BEGIN:VEVENT");
            ics.push(`UID:${b._id}@wayza.com`);
            ics.push(`DTSTAMP:${created}`);
            ics.push(`DTSTART;VALUE=DATE:${start.substring(0, 8)}`);
            ics.push(`DTEND;VALUE=DATE:${end.substring(0, 8)}`);
            ics.push(`SUMMARY:Wayza Booking - ${b.title || "Stay"}`);
            ics.push(`DESCRIPTION:Guest: ${b.guestEmail}\\nTotal: ₹${b.totalPrice}\\nNights: ${b.nights}`);
            ics.push("END:VEVENT");
        });

        ics.push("END:VCALENDAR");

        res.setHeader("Content-Type", "text/calendar");
        res.setHeader("Content-Disposition", `attachment; filename="wayza_${partner.email}.ics"`);
        res.send(ics.join("\r\n"));
    } catch (err) { next(err); }
});

router.get("/calendar-settings", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const partners = db.collection("partners");
        const partner = await partners.findOne({ email: req.user.email });
        if (!partner) return res.status(404).json({ ok: false });

        const baseUrl = process.env.API_URL || "http://localhost:5000";
        let token = partner.calendarToken;
        if (!token) {
            token = require('crypto').randomBytes(32).toString('hex');
            await partners.updateOne({ _id: partner._id }, { $set: { calendarToken: token } });
        }
        const feedUrl = `${baseUrl}/api/v1/partner/calendar-feed/${token}`;

        res.json({ ok: true, feedUrl });
    } catch (err) { next(err); }
});

export default router;
