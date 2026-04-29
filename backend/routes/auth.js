import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getDB } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { getTransporter } from "../utils/emailTemplates.js";
import { z } from "zod";
import { BCRYPT_ROUNDS, JWT_EXPIRY } from "../config/constants.js";
import { captureEvent } from "../utils/posthog.js";
import { generateSecret, generateQRCode, verifyToken } from "../utils/twoFactor.js";
import { OAuth2Client } from "google-auth-library";


const signupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone is required"),
    email: z.string().email(),
    password: z.string().min(6)
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

const router = express.Router();
const SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID || "");

router.post("/signup", async (req, res, next) => {
    try {
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid input", errors: parsed.error.flatten() });

        const db = getDB();
        const users = db.collection("users");
        const email = parsed.data.email.toLowerCase().trim();
        const { password, name, phone } = parsed.data;

        const exists = await users.findOne({ email });
        if (exists) return res.status(400).json({ ok: false, message: "Email already exists" });

        const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        await users.insertOne({ email, password: hash, name, phone, role: "guest", createdAt: new Date() });

        // Track signup in PostHog
        captureEvent(email, "User Signed Up", { role: "guest" });

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

        // Guard: Google-only users don't have a password
        if (!user.password) {
            return res.status(401).json({ ok: false, message: "This account uses Google sign-in. Please log in with Google." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ ok: false, message: "Invalid email or password" });
        }

        if (user.twoFactorEnabled) {
            const tempToken = jwt.sign({ email: user.email, temp: true }, SECRET, { expiresIn: "10m" });
            return res.json({ ok: true, twoFactorRequired: true, tempToken });
        }

        if (!SECRET) throw new Error("JWT_SECRET is not configured");
        const token = jwt.sign({ email: user.email, role: user.role }, SECRET, { expiresIn: JWT_EXPIRY });

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Track successful login in PostHog
        captureEvent(user.email, "User Logged In", { role: user.role });

        res.json({

            ok: true,
            data: {
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        next(err);
    }
});

router.post("/google", async (req, res, next) => {
    try {
        const { credential } = req.body;
        if (!credential) return res.status(400).json({ ok: false, message: "No Google credential provided" });
        if (!GOOGLE_CLIENT_ID) return res.status(500).json({ ok: false, message: "Google client ID is not configured on the server" });

        let email, name, picture;

        // Try to decode as JWT first (id_token)
        if (credential.split('.').length === 3) {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            email = payload?.email?.toLowerCase()?.trim();
            name = payload?.name;
            picture = payload?.picture;
        } else {
            // Otherwise, treat it as an access_token and fetch user info
            const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
                headers: { Authorization: `Bearer ${credential}` }
            });
            if (!response.ok) {
                throw new Error("Failed to fetch user info from Google");
            }
            const payload = await response.json();
            email = payload?.email?.toLowerCase()?.trim();
            name = payload?.name;
            picture = payload?.picture;
        }

        if (!email) {
            throw new Error("Google account email was not returned by Google");
        }

        const db = getDB();
        let user = await db.collection("users").findOne({ email });

        if (!user) {
            // Register if new
            await db.collection("users").insertOne({
                email,
                role: "guest",
                name,
                picture,
                phone: "", // Google auth doesn't provide phone, so leave empty for now
                createdAt: new Date()
            });
            user = await db.collection("users").findOne({ email });
            captureEvent(user.email, "User Signed Up via Google", { role: "guest" });
        } else {
            captureEvent(user.email, "User Logged In via Google", { role: user.role });
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
            data: { email: user.email, role: user.role }
        });
    } catch (err) {
        console.error("Google Auth Error:", err);
        // Provide more context if it's a verification error
        const status = (err.message && err.message.includes("token")) ? 401 : 401; // Standardize on 401 for auth errors
        res.status(status).json({ 
            ok: false, 
            message: err.message || "Google authentication failed",
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined 
        });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const user = await db.collection("users").findOne({ email: req.user.email }, { projection: { _id: 0, email: 1, role: 1, name: 1, phone: 1 } });
        if (!user) return res.status(404).json({ ok: false, message: "User not found" });

        res.json({ ok: true, data: user });
    } catch (err) {
        next(err);
    }
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
        const transporter = await getTransporter();
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetUrl = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        if (transporter) {
            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.EMAIL_USER || "noreply@wayzza.com",
                to: email,
                subject: "Wayzza — Reset Your Password",
                html: `
                    <div style="font-family:system-ui;max-width:500px;margin:0 auto;padding:40px;background:#fff;">
                        <h2 style="color:#0f172a;">Reset Your Password</h2>
                        <p style="color:#64748b;">Click the button below to reset your Wayzza password. This link expires in 1 hour.</p>
                        <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:#059669;color:#fff;text-decoration:none;border-radius:12px;font-weight:bold;margin:24px 0;">Reset Password</a>
                        <p style="color:#94a3b8;font-size:12px;">If you didn't request this, please ignore this email.</p>
                    </div>
                `
            });
            if (info.messageId) {
                // If using free ethereal email setup, log the preview URL
                const nodemailer = await import('nodemailer');
                const previewUrl = nodemailer.getTestMessageUrl(info);
                if (previewUrl) console.log("Account Email Preview URL: ", previewUrl);
            }
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

/* ================= OTP SYSTEM ================= */

router.post("/send-otp", async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ ok: false, message: "Email required" });

        const db = getDB();
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await db.collection("otps").deleteMany({ email: email.toLowerCase().trim() });
        await db.collection("otps").insertOne({ email: email.toLowerCase().trim(), otp, expiry });

        const transporter = await getTransporter();
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.EMAIL_USER || "noreply@wayzza.com",
            to: email,
            subject: "Your Wayzza Authentication Code",
            html: `
                <div style="font-family:system-ui;max-width:500px;margin:0 auto;padding:40px;background:#fff;text-align:center;">
                    <h2 style="color:#0f172a;">Authentication Code</h2>
                    <p style="color:#64748b;">Use the following 6-digit code to log in or sign up. It expires in 10 minutes.</p>
                    <div style="font-size:32px;font-weight:900;letter-spacing:0.25em;color:#059669;margin:30px 0;">${otp}</div>
                </div>
            `
        });

        const nodemailer = await import('nodemailer');
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) console.log("OTP Email URL: ", previewUrl);

        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.post("/verify-otp", async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ ok: false, message: "Email and OTP required" });

        const db = getDB();
        const record = await db.collection("otps").findOne({ email: email.toLowerCase().trim(), otp: otp.trim() });

        if (!record || new Date(record.expiry) < new Date()) {
            return res.status(400).json({ ok: false, message: "Invalid or expired OTP" });
        }

        await db.collection("otps").deleteMany({ email: email.toLowerCase().trim() });

        let user = await db.collection("users").findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            // Register if new
            await db.collection("users").insertOne({ email: email.toLowerCase().trim(), role: "guest", name: "", phone: "", createdAt: new Date() });
            user = await db.collection("users").findOne({ email: email.toLowerCase().trim() });
            captureEvent(user.email, "User Signed Up via OTP", { role: "guest" });
        } else {
            captureEvent(user.email, "User Logged In via OTP", { role: user.role });
        }

        if (user.twoFactorEnabled) {
            const tempToken = jwt.sign({ email: user.email, temp: true }, SECRET, { expiresIn: "10m" });
            return res.json({ ok: true, twoFactorRequired: true, tempToken });
        }

        if (!SECRET) throw new Error("JWT_SECRET is not configured");
        const token = jwt.sign({ email: user.email, role: user.role }, SECRET, { expiresIn: JWT_EXPIRY });

        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none", maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.json({ ok: true, data: { email: user.email, role: user.role } });
    } catch (err) { next(err); }
});

/* ================= PROFILE UPDATE ================= */

router.put("/profile", requireAuth, async (req, res, next) => {
    try {
        const parsed = z.object({
            name: z.string().min(1).optional(),
            phone: z.string().min(1).optional(),
            picture: z.string().min(1).optional()
        }).safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid input" });

        const db = getDB();
        const updates = {};
        if (parsed.data.name !== undefined) updates.name = parsed.data.name;
        if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone;
        if (parsed.data.picture !== undefined) updates.picture = parsed.data.picture;
        updates.updatedAt = new Date();

        await db.collection("users").updateOne({ email: req.user.email }, { $set: updates });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

/* ================= 2FA SYSTEM ================= */

router.get("/2fa/setup", requireAuth, async (req, res, next) => {
    try {
        const secret = generateSecret();
        const qrCode = await generateQRCode(req.user.email, secret);

        const db = getDB();
        await db.collection("users").updateOne({ email: req.user.email }, { $set: { tempTwoFactorSecret: secret } });

        res.json({ ok: true, data: { qrCode, secret } });
    } catch (err) { next(err); }
});

router.post("/2fa/enable", requireAuth, async (req, res, next) => {
    try {
        const { token } = req.body;
        const db = getDB();
        const user = await db.collection("users").findOne({ email: req.user.email });

        if (!user.tempTwoFactorSecret) return res.status(400).json({ ok: false, message: "Setup not initiated" });

        const valid = verifyToken(token, user.tempTwoFactorSecret);
        if (!valid) return res.status(400).json({ ok: false, message: "Invalid code" });

        await db.collection("users").updateOne(
            { email: req.user.email },
            { $set: { twoFactorEnabled: true, twoFactorSecret: user.tempTwoFactorSecret }, $unset: { tempTwoFactorSecret: "" } }
        );

        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.post("/2fa/disable", requireAuth, async (req, res, next) => {
    try {
        const { token } = req.body;
        const db = getDB();
        const user = await db.collection("users").findOne({ email: req.user.email });

        if (!user.twoFactorEnabled) return res.status(400).json({ ok: false, message: "2FA not enabled" });

        const valid = verifyToken(token, user.twoFactorSecret);
        if (!valid) return res.status(400).json({ ok: false, message: "Invalid code" });

        await db.collection("users").updateOne({ email: req.user.email }, { $set: { twoFactorEnabled: false }, $unset: { twoFactorSecret: "" } });

        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.post("/2fa/verify", async (req, res, next) => {
    try {
        const { tempToken, token: totpToken } = req.body;
        if (!tempToken || !totpToken) return res.status(400).json({ ok: false, message: "Input missing" });

        const decoded = jwt.verify(tempToken, SECRET);
        if (!decoded.temp) return res.status(401).json({ ok: false, message: "Invalid token" });

        const db = getDB();
        const user = await db.collection("users").findOne({ email: decoded.email });

        const valid = verifyToken(totpToken, user.twoFactorSecret);
        if (!valid) return res.status(400).json({ ok: false, message: "Invalid code" });

        const token = jwt.sign({ email: user.email, role: user.role }, SECRET, { expiresIn: JWT_EXPIRY });
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none", maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.json({ ok: true, data: { email: user.email, role: user.role } });
    } catch (err) { next(err); }
});

export default router;
