import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getDB } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { getTransporter } from "../utils/emailTemplates.js";
import { z } from "zod";
import { BCRYPT_ROUNDS, JWT_EXPIRY } from "../config/constants.js";

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

router.post("/signup", async (req, res, next) => {
    try {
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid input", errors: parsed.error.flatten() });

        const db = getDB();
        const users = db.collection("users");
        const email = parsed.data.email.toLowerCase().trim();
        const { password } = parsed.data;

        const exists = await users.findOne({ email });
        if (exists) return res.status(400).json({ ok: false, message: "Email already exists" });

        const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        await users.insertOne({ email, password: hash, role: "guest", createdAt: new Date() });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.post("/login", async (req, res, next) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid input", errors: parsed.error.flatten() });

        const db = getDB();
        const users = db.collection("users");
        const email = parsed.data.email.toLowerCase().trim();
        const password = parsed.data.password.trim();

        const user = await users.findOne({ email });

        if (!user) {
            return res.status(401).json({ ok: false, message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ ok: false, message: "Invalid email or password" });
        }

        if (!SECRET) throw new Error("JWT_SECRET is not configured");
        const token = jwt.sign({ email: user.email, role: user.role }, SECRET, { expiresIn: JWT_EXPIRY });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            ok: true,
            data: {
                email: user.email,
                role: user.role,
                token: token
            }
        });
    } catch (err) {
        next(err);
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
    res.json({ ok: true, data: { email: req.user.email, role: req.user.role } });
});

/* ================= PASSWORD RESET ================= */

router.post("/forgot-password", async (req, res, next) => {
    try {
        const parsed = z.object({ email: z.string().email() }).safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Valid email is required" });

        const db = getDB();
        const users = db.collection("users");
        const resetTokens = db.collection("resetTokens");
        const email = parsed.data.email.toLowerCase().trim();

        const user = await users.findOne({ email });
        // Always return ok to prevent email enumeration
        if (!user) return res.json({ ok: true, message: "If this email exists, a reset link has been sent." });

        const token = crypto.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await resetTokens.deleteMany({ email }); // Remove old tokens
        await resetTokens.insertOne({ email, token, expiry, createdAt: new Date() });

        // Send reset email
        const transporter = getTransporter();
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetUrl = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        if (transporter) {
            transporter.sendMail({
                from: process.env.EMAIL_USER || "noreply@wayza.com",
                to: email,
                subject: "Wayza — Reset Your Password",
                html: `
                    <div style="font-family:system-ui;max-width:500px;margin:0 auto;padding:40px;background:#fff;">
                        <h2 style="color:#0f172a;">Reset Your Password</h2>
                        <p style="color:#64748b;">Click the button below to reset your Wayza password. This link expires in 1 hour.</p>
                        <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:#059669;color:#fff;text-decoration:none;border-radius:12px;font-weight:bold;margin:24px 0;">Reset Password</a>
                        <p style="color:#94a3b8;font-size:12px;">If you didn't request this, please ignore this email.</p>
                    </div>
                `
            }).catch(e => console.error("Reset email error:", e));
        }

        res.json({ ok: true, message: "If this email exists, a reset link has been sent." });
    } catch (err) { next(err); }
});

router.post("/reset-password", async (req, res, next) => {
    try {
        const parsed = z.object({
            email: z.string().email(),
            token: z.string().min(1),
            password: z.string().min(6)
        }).safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid input" });

        const db = getDB();
        const users = db.collection("users");
        const resetTokens = db.collection("resetTokens");
        const { email, token, password } = parsed.data;

        const record = await resetTokens.findOne({ email: email.toLowerCase().trim(), token });
        if (!record) return res.status(400).json({ ok: false, message: "Invalid or expired reset token" });
        if (new Date(record.expiry) < new Date()) {
            await resetTokens.deleteOne({ _id: record._id });
            return res.status(400).json({ ok: false, message: "Reset token has expired. Please request a new one." });
        }

        const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        await users.updateOne({ email: email.toLowerCase().trim() }, { $set: { password: hash } });
        await resetTokens.deleteMany({ email: email.toLowerCase().trim() });

        res.json({ ok: true, message: "Password has been reset successfully." });
    } catch (err) { next(err); }
});

/* ================= PROFILE UPDATE ================= */

router.put("/profile", requireAuth, async (req, res, next) => {
    try {
        const parsed = z.object({
            name: z.string().min(1).optional(),
            phone: z.string().optional()
        }).safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid input" });

        const db = getDB();
        const updates = {};
        if (parsed.data.name) updates.name = parsed.data.name;
        if (parsed.data.phone) updates.phone = parsed.data.phone;
        updates.updatedAt = new Date();

        await db.collection("users").updateOne({ email: req.user.email }, { $set: updates });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

export default router;
