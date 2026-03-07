import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getDB } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { getTransporter } from "../utils/emailTemplates.js";
import { z } from "zod";

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

router.post("/signup", async (req, res, next) => {
    try {
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid input", errors: parsed.error.flatten() });

        const db = getDB();
        const users = db.collection("users");
        const { email, password } = parsed.data;

        const exists = await users.findOne({ email });
        if (exists) return res.status(400).json({ ok: false, message: "Email already exists" });

        const hash = await bcrypt.hash(password, 10);
        await users.insertOne({ email, password: hash, role: "guest", createdAt: new Date() });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.post("/login", async (req, res, next) => {
    try {
        const db = getDB();
        const users = db.collection("users");
        const { email, password } = req.body;
        const user = await users.findOne({ email });
        if (!user) return res.status(401).json({ ok: false, message: "User not found" });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ ok: false, message: "Invalid password" });

        const token = jwt.sign({ email: user.email, role: user.role }, SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({ ok: true, data: { email: user.email, role: user.role } });
    } catch (err) { next(err); }
});

router.post("/forgot-password", async (req, res, next) => {
    try {
        const db = getDB();
        const users = db.collection("users");
        const resetTokens = db.collection("resetTokens");
        const transporter = getTransporter();

        const { email } = req.body;
        if (!email) return res.status(400).json({ ok: false });

        const user = await users.findOne({ email });
        if (!user) return res.json({ ok: true });

        const token = crypto.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 60 * 60 * 1000);

        await resetTokens.deleteMany({ email });
        await resetTokens.insertOne({ email, token, expiry, createdAt: new Date() });

        const resetUrl = (process.env.FRONTEND_URL || "http://localhost:5173") + "/reset-password?token=" + token;
        const year = new Date().getFullYear();

        if (transporter) {
            await transporter.sendMail({
                from: '"Wayza" <' + process.env.EMAIL_USER + '>',
                to: email,
                subject: "Reset your Wayza password",
                html: `<div style='font-family:system-ui;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;'>
                <h2 style='color:#1e3a8a;'>Reset your password</h2>
                <p style='color:#4b5563;'>You requested a password reset for your Wayza account.</p>
                <a href='${resetUrl}' style='display:inline-block;margin:24px 0;padding:14px 28px;background:#2563eb;color:white;text-decoration:none;border-radius:10px;font-weight:600;'>Reset Password</a>
                <p style='color:#9ca3af;font-size:13px;'>This link expires in 1 hour. If you did not request this, ignore this email.</p>
                <p style='color:#9ca3af;font-size:12px;'>© ${year} Wayza</p>
                </div>`
            });
        }

        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.post("/reset-password", async (req, res, next) => {
    try {
        const db = getDB();
        const users = db.collection("users");
        const resetTokens = db.collection("resetTokens");

        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ ok: false });
        if (password.length < 6) return res.status(400).json({ ok: false, message: "Password must be at least 6 characters" });

        const record = await resetTokens.findOne({ token });
        if (!record) return res.status(400).json({ ok: false, message: "Invalid or expired reset link" });

        if (new Date() > new Date(record.expiry))
            return res.status(400).json({ ok: false, message: "Reset link has expired" });

        const hash = await bcrypt.hash(password, 10);
        await users.updateOne({ email: record.email }, { $set: { password: hash, updatedAt: new Date() } });
        await resetTokens.deleteOne({ token });

        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.get("/profile", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const users = db.collection("users");
        const user = await users.findOne({ email: req.user.email }, { projection: { password: 0 } });
        if (!user) return res.status(404).json({ ok: false });
        res.json({ ok: true, data: user });
    } catch (err) { next(err); }
});

router.put("/profile", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const users = db.collection("users");
        const { name, phone } = req.body;
        const updates = { updatedAt: new Date() };
        if (name !== undefined) updates.name = name;
        if (phone !== undefined) updates.phone = phone;
        await users.updateOne({ email: req.user.email }, { $set: updates });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.get("/me", requireAuth, (req, res) => {
    res.json({ ok: true, data: { email: req.user.email, role: req.user.role } });
});

router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ ok: true });
});

export default router;
