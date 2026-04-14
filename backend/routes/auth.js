import express from "express";
import bcrypt from "bcryptjs";
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

        const hash = await bcrypt.hash(password, 8);
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
        const token = jwt.sign({ email: user.email, role: user.role }, SECRET, { expiresIn: "7d" });

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

export default router;
