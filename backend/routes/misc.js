import express from "express";
import { getDB } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { generateItinerary } from "../utils/ai.js";
import { z } from "zod";

const reviewSchema = z.object({
    listingId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(2000).optional()
});

const wishlistSchema = z.object({
    listingId: z.string().min(1),
    title: z.string().optional()
});

const tripPlannerSchema = z.object({
    destination: z.string().min(1),
    vibe: z.string().optional()
});

const router = express.Router();

/* ================= REVIEWS ================= */

router.get("/reviews/:listingId", async (req, res, next) => {
    try {
        const db = getDB();
        const rows = await db.collection("reviews").find({ listingId: req.params.listingId }).sort({ createdAt: -1 }).toArray();
        res.json({ ok: true, data: rows });
    } catch (err) { next(err); }
});

router.post("/reviews", requireAuth, async (req, res, next) => {
    try {
        const parsed = reviewSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid review data", errors: parsed.error.flatten() });

        const db = getDB();
        const { listingId, rating, comment } = parsed.data;

        const booked = await db.collection("bookings").findOne({ listingId, guestEmail: req.user.email, status: "paid" });
        if (!booked) return res.status(403).json({ ok: false, message: "You must book to review" });

        const already = await db.collection("reviews").findOne({ listingId, guestEmail: req.user.email });
        if (already) return res.status(400).json({ ok: false, message: "Already reviewed" });

        await db.collection("reviews").insertOne({
            listingId,
            rating,
            comment,
            guestEmail: req.user.email,
            createdAt: new Date()
        });

        res.json({ ok: true });
    } catch (err) { next(err); }
});

/* ================= WISHLIST ================= */

router.get("/wishlist", requireAuth, async (req, res, next) => {
    try {
        const db = getDB();
        const rows = await db.collection("wishlists").find({ email: req.user.email }).toArray();
        res.json({ ok: true, data: rows });
    } catch (err) { next(err); }
});

router.post("/wishlist/toggle", requireAuth, async (req, res, next) => {
    try {
        const parsed = wishlistSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Invalid wishlist data", errors: parsed.error.flatten() });

        const db = getDB();
        const { listingId, title } = parsed.data;
        const email = req.user.email;
        const existing = await db.collection("wishlists").findOne({ email, listingId });

        if (existing) {
            await db.collection("wishlists").deleteOne({ _id: existing._id });
            return res.json({ ok: true, saved: false });
        } else {
            await db.collection("wishlists").insertOne({ email, listingId, title, createdAt: new Date() });
            return res.json({ ok: true, saved: true });
        }
    } catch (err) { next(err); }
});

/* ================= AI TRIP PLANNER ================= */

router.post("/trip-planner", async (req, res, next) => {
    try {
        const parsed = tripPlannerSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Destination is required", errors: parsed.error.flatten() });

        const db = getDB();
        const { destination, vibe } = parsed.data;

        const listingsColl = db.collection("listings");
        const baseFilter = { 
            location: { $regex: destination, $options: "i" }, 
            approved: true 
        };

        // Fetch all relevant high-quality inventory for this location
        const inventory = await listingsColl.find(baseFilter).toArray();

        if (inventory.length === 0) {
            return res.json({ ok: false, message: "Could not find enough inventory for this destination." });
        }

        // Try AI generation if API Key exists
        if (process.env.GEMINI_API_KEY) {
            try {
                const aiItinerary = await generateItinerary(destination, vibe, inventory);
                return res.json({ ok: true, data: aiItinerary });
            } catch (aiErr) {
                console.error("AI Generation failed, falling back to heuristic:", aiErr);
                // Fallback to legacy logic below...
            }
        }

        // --- LEGACY HEURISTIC FALLBACK (used if AI is off or fails) ---
        const stay = inventory.find(i => i.category === "hotel");
        const vehicle = inventory.find(i => ["car", "bike"].includes(i.category));
        const activities = inventory.filter(i => i.category === "activity").slice(0, 3);

        const vibeMap = {
            chill: "Serene & Relaxed",
            adventure: "High Octane",
            culture: "Heritage & Soul",
            luxury: "Grand & Elite"
        };

        const totalItinerary = {
            destination: destination.charAt(0).toUpperCase() + destination.slice(1),
            vibe: vibeMap[vibe] || "Custom",
            days: [
                { day: 1, title: "Arrival & Orientation", items: [] },
                { day: 2, title: "Deep Exploration", items: [] }
            ],
            totalPrice: 0
        };

        let calculatedTotal = 0;
        if (vehicle) {
            totalItinerary.days[0].items.push({
                type: 'vehicle', time: "10:00 AM", title: `Pickup: ${vehicle.title}`,
                desc: `Your ${vehicle.category} is ready at the arrival point.`
            });
            calculatedTotal += (vehicle.price || 0);
        }
        if (stay) {
            totalItinerary.days[0].items.push({
                type: 'hotel', time: "02:00 PM", title: `Check-in: ${stay.title}`,
                desc: stay.description?.substring(0, 100) + "..."
            });
            calculatedTotal += (stay.price || 0);
        }
        if (activities[0]) {
            totalItinerary.days[0].items.push({
                type: 'activity', time: "05:00 PM", title: activities[0].title,
                desc: activities[0].description?.substring(0, 100) + "..."
            });
            calculatedTotal += (activities[0].price || 0);
        }
        if (activities[1]) {
            totalItinerary.days[1].items.push({
                type: 'activity', time: "10:00 AM", title: activities[1].title,
                desc: activities[1].description?.substring(0, 100) + "..."
            });
            calculatedTotal += (activities[1].price || 0);
        }
        if (activities[2]) {
            totalItinerary.days[1].items.push({
                type: 'activity', time: "03:00 PM", title: activities[2].title,
                desc: activities[2].description?.substring(0, 100) + "..."
            });
            calculatedTotal += (activities[2].price || 0);
        }
        totalItinerary.totalPrice = calculatedTotal;
        res.json({ ok: true, data: totalItinerary });

    } catch (err) { next(err); }
});

export default router;
