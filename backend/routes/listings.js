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
    longitude: z.number().optional(),
    walkthroughVideo: z.string().optional(),
    amenities: z.array(z.string()).optional().default([]),
    wifiSpeed: z.number().optional().default(0),
    licensePlate: z.string().optional().default(""),
    registrationDate: z.string().optional().default(""),
    vehicleType: z.string().optional().default(""),
    registrationCategory: z.string().optional().default(""),
    cancellationPolicy: z.string().optional().default(""),
    rcDoc: z.string().optional().default(""),
    insuranceDoc: z.string().optional().default(""),
    pucDoc: z.string().optional().default("")
});

const variantSchema = z.object({
    name: z.string().min(1),
    price: z.number().min(0).optional().default(0),
    baseFloorPrice: z.number().min(0).optional(),
    qty: z.number().int().min(1).optional().default(1),
    type: z.string().optional(),
    desc: z.string().optional(),
    available: z.boolean().optional().default(true),
    image: z.string().optional(),
    amenities: z.array(z.string()).optional().default([])
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
            const escapedLocation = String(location).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.$or = [
                { title: { $regex: escapedLocation, $options: "i" } },
                { location: { $regex: escapedLocation, $options: "i" } }
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

        // Attach real review stats (avgRating, reviewCount) to each listing
        if (rows.length > 0) {
            const listingIds = rows.map(r => r._id.toString());
            const reviews = db.collection("reviews");
            const reviewStats = await reviews.aggregate([
                { $match: { listingId: { $in: listingIds } } },
                { $group: { _id: "$listingId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
            ]).toArray();

            const statsMap = {};
            reviewStats.forEach(s => { statsMap[s._id] = { avgRating: Math.round(s.avgRating * 10) / 10, reviewCount: s.count }; });

            rows.forEach(r => {
                const s = statsMap[r._id.toString()];
                r.avgRating = s?.avgRating || 0;
                r.reviewCount = s?.reviewCount || 0;
            });
        }

        res.json({ ok: true, rows, total, pages });
    } catch (err) { next(err); }
});

/* ── TRENDING — sorted by viewCount desc, featured listings pinned first ── */
router.get("/trending", async (req, res, next) => {
    try {
        const db = getDB();
        const limit = Math.min(Number(req.query.limit) || 8, 20);
        const filter = { approved: true };
        if (req.query.category) filter.category = req.query.category;
        const rows = await db.collection("listings")
            .find(filter)
            .sort({ featured: -1, viewCount: -1, createdAt: -1 })
            .limit(limit)
            .toArray();
        res.json({ ok: true, rows });
    } catch (err) { next(err); }
});

/* ── TRACK VIEW — fire-and-forget, increments viewCount ── */
router.post("/:id/view", async (req, res, next) => {
    try {
        const db = getDB();
        if (!ObjectId.isValid(req.params.id)) return res.json({ ok: false });
        await db.collection("listings").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $inc: { viewCount: 1 } }
        );
        res.json({ ok: true });
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

        const partner = await db.collection("partners").findOne({ email: listing.ownerEmail });
        listing.ownerGstEnabled = partner?.gstEnabled === true;

        // Attach real review stats — keeps this endpoint consistent with the list endpoint
        const listingIdStr = listing._id.toString();
        const reviewStats = await db.collection("reviews").aggregate([
            { $match: { listingId: listingIdStr } },
            { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
        ]).toArray();
        if (reviewStats.length > 0) {
            listing.avgRating = Math.round(reviewStats[0].avgRating * 10) / 10;
            listing.reviewCount = reviewStats[0].count;
        } else {
            listing.avgRating = 0;
            listing.reviewCount = 0;
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
        const {
            title, location, price, description, image, images, category,
            latitude, longitude, walkthroughVideo, amenities, wifiSpeed,
            licensePlate, registrationDate, vehicleType, registrationCategory,
            cancellationPolicy, rcDoc, insuranceDoc, pucDoc
        } = parsed.data;

        const result = await listings.insertOne({
            title, location,
            price: Number(price) || 0,
            baseFloorPrice: Number(price) || 0, // IMMUTABLE floor — set once at creation, never overridden
            description, image,
            images: images || [],
            category: category || "hotel",
            ownerEmail: req.user.email,
            variants: (category && category !== "hotel")
                ? [{ name: "Standard", price: Number(price) || 0, priceRules: [] }]
                : [],
            approved: false,
            latitude: latitude ? Number(latitude) : null,
            longitude: longitude ? Number(longitude) : null,
            walkthroughVideo: walkthroughVideo || null,
            amenities: amenities || [],
            wifiSpeed: Number(wifiSpeed) || 0,
            licensePlate: licensePlate || "",
            registrationDate: registrationDate || "",
            vehicleType: vehicleType || "",
            registrationCategory: registrationCategory || "",
            cancellationPolicy: cancellationPolicy || "",
            rcDoc: rcDoc || "",
            insuranceDoc: insuranceDoc || "",
            pucDoc: pucDoc || "",
            createdAt: new Date()
        });

        // Notify Admin of new listing for approval
        const adminPhone = process.env.ADMIN_PHONE;
        const msg = formatWhatsAppApprovalNeeded({
            ownerEmail: req.user.email,
            title,
            location
        });
        sendWhatsAppAlert(adminPhone, msg).catch(e => console.error("WhatsApp alert error:", e));

        res.json({ ok: true, id: result.insertedId });
    } catch (err) { next(err); }
});

router.put("/:id", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const listings = db.collection("listings");
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ ok: false });

        const listing = await listings.findOne({ _id: new ObjectId(req.params.id) });
        if (!listing || (listing.ownerEmail !== req.user.email && req.user.role !== "admin")) {
            return res.status(403).json({ ok: false, message: "Not authorized" });
        }

        const updates = {};
        const fields = [
            "title", "location", "description", "category", "latitude", "longitude",
            "walkthroughVideo", "image", "amenities", "wifiSpeed",
            "licensePlate", "registrationDate", "vehicleType", "registrationCategory",
            "cancellationPolicy", "rcDoc", "insuranceDoc", "pucDoc"
        ];
        fields.forEach(f => {
            if (req.body[f] !== undefined) {
                if (["latitude", "longitude"].includes(f) && req.body[f] !== null) {
                    updates[f] = Number(req.body[f]);
                } else {
                    updates[f] = req.body[f];
                }
            }
        });

        // ─── PART 1: ATOMIC PRICE FLOOR GUARD ───────────────────────────────────
        if (req.body.price !== undefined) {
            const newPrice = Number(req.body.price);

            // For legacy listings without a baseFloorPrice, initialize it to their current price first
            await listings.updateOne(
                { _id: new ObjectId(req.params.id), baseFloorPrice: { $exists: false } },
                { $set: { baseFloorPrice: listing.price || 0 } }
            );

            // ATOMIC GUARD: Only proceed if newPrice >= baseFloorPrice
            const atomicResult = await listings.updateOne(
                {
                    _id: new ObjectId(req.params.id),
                    $or: [
                        { baseFloorPrice: { $lte: newPrice } },  // Standard: price is above floor
                        { baseFloorPrice: { $exists: false } }   // Legacy fallback (shouldn't happen after above)
                    ]
                },
                { $set: { ...updates, price: newPrice, priceUpdatedAt: new Date() } }
            );

            if (atomicResult.matchedCount === 0) {
                // Re-fetch to get the real floor price for the error message
                const fresh = await listings.findOne({ _id: new ObjectId(req.params.id) });
                return res.status(400).json({
                    ok: false,
                    message: `Price ₹${newPrice.toLocaleString()} is below the minimum floor price of ₹${fresh?.baseFloorPrice?.toLocaleString() || 0} for this listing.`
                });
            }
            return res.json({ ok: true });
        }
        // ────────────────────────────────────────────────────────────────────────

        await listings.updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });
        res.json({ ok: true });
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

        const { name, type, price, qty, desc, available, image, amenities } = parsed.data;
        await listings.updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $push: {
                    variants: {
                        name, type,
                        price: Number(price) || 0,
                        baseFloorPrice: Number(price) || 0,
                        qty: Number(qty) || 1,
                        desc,
                        available: available !== false,
                        image: image || null,
                        amenities: amenities || [],
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
        const idx = parseInt(index, 10);
        if (isNaN(idx) || idx < 0) return res.status(400).json({ ok: false });
        const listing = await listings.findOne({ _id: new ObjectId(id) });
        if (!listing || (listing.ownerEmail !== req.user.email && req.user.role !== "admin")) return res.status(403).json({ ok: false });
        if (idx >= (listing.variants || []).length) return res.status(400).json({ ok: false, message: "Index out of bounds" });

        const variant = listing.variants[idx];
        const currentFloor = variant.baseFloorPrice !== undefined ? variant.baseFloorPrice : (variant.price || 0);
        
        const newPrice = req.body.price !== undefined ? Number(req.body.price) : undefined;
        if (newPrice !== undefined && newPrice < currentFloor) {
            return res.status(400).json({
                ok: false,
                message: `Price ₹${newPrice.toLocaleString()} is below the minimum floor price of ₹${currentFloor.toLocaleString()} for this variant.`
            });
        }

        const updates = {};
        ["name", "type", "price", "qty", "desc", "available", "image", "amenities"].forEach(f => {
            if (req.body[f] !== undefined) updates["variants." + idx + "." + f] = req.body[f];
        });

        // Initialize baseFloorPrice for legacy variant if not present
        if (variant.baseFloorPrice === undefined) {
            updates["variants." + idx + ".baseFloorPrice"] = currentFloor;
        }

        await listings.updateOne({ _id: new ObjectId(id) }, { $set: updates });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

router.delete("/:id/variant/:index", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const listings = db.collection("listings");
        const { id, index } = req.params;
        const idx = parseInt(index, 10);
        if (isNaN(idx) || idx < 0) return res.status(400).json({ ok: false });
        const listing = await listings.findOne({ _id: new ObjectId(id) });
        if (!listing || (listing.ownerEmail !== req.user.email && req.user.role !== "admin")) return res.status(403).json({ ok: false });
        if (idx >= (listing.variants || []).length) return res.status(400).json({ ok: false, message: "Index out of bounds" });
        await listings.updateOne({ _id: new ObjectId(id) }, { $unset: { ["variants." + idx]: 1 } });
        await listings.updateOne({ _id: new ObjectId(id) }, { $pull: { variants: null } });
        res.json({ ok: true });
    } catch (err) { next(err); }
});

/* ================= DATE PRICE RULES (per variant/room) ================= */

// GET /:id/variant/:index/price-rules
router.get("/:id/variant/:index/price-rules", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const { id, index } = req.params;
        const idx = parseInt(index, 10);
        if (!ObjectId.isValid(id) || isNaN(idx)) return res.status(400).json({ ok: false });
        const listing = await db.collection("listings").findOne(
            { _id: new ObjectId(id) },
            { projection: { variants: 1, ownerEmail: 1 } }
        );
        if (!listing) return res.status(404).json({ ok: false });
        if (listing.ownerEmail !== req.user.email && req.user.role !== "admin") {
            return res.status(403).json({ ok: false, message: "Not authorized" });
        }
        const variant = (listing.variants || [])[idx];
        if (!variant) return res.status(404).json({ ok: false, message: "Variant not found" });
        res.json({ ok: true, priceRules: variant.priceRules || [] });
    } catch (err) { next(err); }
});

// PUT /:id/variant/:index/price-rules
router.put("/:id/variant/:index/price-rules", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const { id, index } = req.params;
        const idx = parseInt(index, 10);
        if (!ObjectId.isValid(id) || isNaN(idx)) return res.status(400).json({ ok: false });
        const listing = await db.collection("listings").findOne(
            { _id: new ObjectId(id) },
            { projection: { ownerEmail: 1, baseFloorPrice: 1, variants: 1 } }
        );
        if (!listing) return res.status(404).json({ ok: false });
        if (listing.ownerEmail !== req.user.email && req.user.role !== "admin") {
            return res.status(403).json({ ok: false, message: "Not authorized" });
        }
        const variant = (listing.variants || [])[idx];
        if (!variant) return res.status(404).json({ ok: false, message: "Variant not found" });

        const rules = Array.isArray(req.body.priceRules) ? req.body.priceRules : [];
        const floor = listing.baseFloorPrice || 0;
        for (const rule of rules) {
            if (!rule.date || typeof rule.date !== "string") {
                return res.status(400).json({ ok: false, message: "Each rule must have a valid date" });
            }
            const p = Number(rule.price);
            if (isNaN(p) || p < floor) {
                return res.status(400).json({
                    ok: false,
                    message: `Price ₹${p} for ${rule.date} is below the floor price of ₹${floor}`
                });
            }
        }

        await db.collection("listings").updateOne(
            { _id: new ObjectId(id) },
            { $set: { [`variants.${idx}.priceRules`]: rules } }
        );
        res.json({ ok: true });
    } catch (err) { next(err); }
});

export default router;
