import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { z } from "zod";

const createPackageSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    price: z.number().min(0),
    hotelId: z.string().optional(),
    vehicleId: z.string().optional(),
    experienceDetails: z.string().optional(),
    image: z.string().optional(),
    active: z.boolean().optional().default(true)
});

const router = express.Router();

// Get all packages
router.get("/", async (req, res, next) => {
    try {
        const db = getDB();
        const packages = db.collection("packages");
        const rows = await packages.find({ active: true }).toArray();
        res.json({ ok: true, rows });
    } catch (err) { next(err); }
});

// Get single package
router.get("/:id", async (req, res, next) => {
    try {
        const db = getDB();
        const packages = db.collection("packages");
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ ok: false });
        const pkg = await packages.findOne({ _id: new ObjectId(req.params.id) });
        if (!pkg) return res.status(404).json({ ok: false });
        res.json({ ok: true, data: pkg });
    } catch (err) { next(err); }
});

// Create package
router.post("/", requireAuth, async (req, res, next) => {
    try {
        const parsed = createPackageSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid package data", errors: parsed.error.flatten() });

        const db = getDB();
        const packages = db.collection("packages");
        const result = await packages.insertOne({
            ...parsed.data,
            createdBy: req.user.email,
            createdAt: new Date()
        });

        res.json({ ok: true, id: result.insertedId });
    } catch (err) { next(err); }
});

export default router;
