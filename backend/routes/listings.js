import express from "express";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { getDB } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { sendWhatsAppAlert, formatWhatsAppApprovalNeeded } from "../utils/whatsapp.js";
import { z } from "zod";

const createListingSchema = z.object({
    title: z.string().min(1),
    location: z.string().optional(),
    price: z.number().min(0).optional().default(0),
    description: z.string().optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional().default([]),
    category: z.string().optional().default("hotel"),
    latitude: z.number().optional(),
    longitude: z.number().optional()
});

const variantSchema = z.object({
    name: z.string().min(1),
    price: z.number().min(0).optional().default(0),
    qty: z.number().int().min(1).optional().default(1),
    type: z.string().optional(),
    desc: z.string().optional(),
    available: z.boolean().optional().default(true),
    image: z.string().optional()
});

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

router.get("/", async (req, res, next) => {
    try {
        const db = getDB();
        const listings = db.collection("listings");
        const { location, minPrice, maxPrice, sort, category, page = 1, limit = 6 } = req.query;

        const filter = { approved: true };
        if (category) {
            filter.category = category;
        }
        if (location) {
            filter.$or = [
                { title: { $regex: location, $options: "i" } },
                { location: { $regex: location, $options: "i" } }
            ];
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        let sortOpt = { createdAt: -1 };
        if (sort === "price_asc") sortOpt = { price: 1 };
        if (sort === "price_desc") sortOpt = { price: -1 };

        const skip = (Number(page) - 1) * Number(limit);
        const total = await listings.countDocuments(filter);
        const pages = Math.ceil(total / Number(limit));
        const rows = await listings.find(filter).sort(sortOpt).skip(skip).limit(Number(limit)).toArray();

        res.json({ ok: true, rows, total, pages });
    } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
    try {
        const db = getDB();
        const listings = db.collection("listings");
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ ok: false });
        const listing = await listings.findOne({ _id: new ObjectId(req.params.id) });
        if (!listing) return res.status(404).json({ ok: false });

        if (!listing.approved) {
            const authHeader = req.headers.authorization;
            let token = null;
            if (req.cookies && req.cookies.token) {
                token = req.cookies.token;
            } else if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
            let requesterEmail = null;
            let requesterRole = null;
            if (token) {
                try {
                    const decoded = jwt.verify(token, SECRET);
                    requesterEmail = decoded.email;
                    requesterRole = decoded.role;
                } catch (_) { }
            }
            if (requesterEmail !== listing.ownerEmail && requesterRole !== "admin") {
                return res.status(403).json({ ok: false, message: "Forbidden" });
            }
        }

        res.json({ ok: true, data: listing });
    } catch (err) { next(err); }
});

router.post("/", requireAuth, async (req, res, next) => {
    try {
        const parsed = createListingSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid listing data", errors: parsed.error.flatten() });

        const db = getDB();
        const listings = db.collection("listings");
        const { title, location, price, description, image, images, category, latitude, longitude } = parsed.data;

        const result = await listings.insertOne({
            title, location,
            price: Number(price) || 0,
            description, image,
            images: images || [],
            category: category || "hotel",
            ownerEmail: req.user.email,
            variants: [],
            approved: false,
            latitude: latitude ? Number(latitude) : null,
            longitude: longitude ? Number(longitude) : null,
            createdAt: new Date()
        });

        // Notify Admin of new listing for approval
        const adminPhone = process.env.ADMIN_PHONE || "918608827725";
        const msg = formatWhatsAppApprovalNeeded({
            ownerEmail: req.user.email,
            title,
            location
        });
        sendWhatsAppAlert(adminPhone, msg).catch(e => console.error("WhatsApp alert error:", e));

        res.json({ ok: true, id: result.insertedId });
    } catch (err) { next(err); }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const listings = db.collection("listings");
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ ok: false });
        await listings.deleteOne({ _id: new ObjectId(req.params.id), ownerEmail: req.user.email });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

/* ================= VARIANTS ================= */

router.post("/:id/variant", requireAuth, async (req, res, next) => {
    try {
        const parsed = variantSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid variant data", errors: parsed.error.flatten() });

        const db = getDB();
        const listings = db.collection("listings");
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ ok: false, message: "Invalid listing ID" });

        const listing = await listings.findOne({ _id: new ObjectId(req.params.id) });
        if (!listing || (listing.ownerEmail !== req.user.email && req.user.role !== "admin")) return res.status(403).json({ ok: false, message: "Not authorized" });

        const { name, type, price, qty, desc, available, image } = parsed.data;
        await listings.updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $push: {
                    variants: {
                        name, type,
                        price: Number(price) || 0,
                        qty: Number(qty) || 1,
                        desc,
                        available: available !== false,
                        image: image || null,
                        createdAt: new Date()
                    }
                }
            }
        );
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.put("/:id/variant/:index", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const listings = db.collection("listings");
        const { id, index } = req.params;
        const listing = await listings.findOne({ _id: new ObjectId(id) });
        if (!listing || (listing.ownerEmail !== req.user.email && req.user.role !== "admin")) return res.status(403).json({ ok: false });
        const updates = {};
        ["name", "type", "price", "qty", "desc", "available", "image"].forEach(f => {
            if (req.body[f] !== undefined) updates["variants." + index + "." + f] = req.body[f];
        });
        await listings.updateOne({ _id: new ObjectId(id) }, { $set: updates });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.delete("/:id/variant/:index", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const listings = db.collection("listings");
        const { id, index } = req.params;
        const listing = await listings.findOne({ _id: new ObjectId(id) });
        if (!listing || (listing.ownerEmail !== req.user.email && req.user.role !== "admin")) return res.status(403).json({ ok: false });
        await listings.updateOne({ _id: new ObjectId(id) }, { $unset: { ["variants." + index]: 1 } });
        await listings.updateOne({ _id: new ObjectId(id) }, { $pull: { variants: null } });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

export default router;
