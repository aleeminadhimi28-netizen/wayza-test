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

        // Broad search: match destination against both title and location fields
        const baseFilter = {
            approved: true,
            $or: [
                { location: { $regex: destination, $options: "i" } },
                { title: { $regex: destination, $options: "i" } }
            ]
        };

        // Fetch all relevant inventory for this location
        const inventory = await listingsColl.find(baseFilter).toArray();

        // If nothing matches the destination, try a broader fallback with ALL approved listings
        let usedInventory = inventory;
        let broadened = false;
        if (inventory.length === 0) {
            usedInventory = await listingsColl.find({ approved: true }).limit(20).toArray();
            broadened = true;
            if (usedInventory.length === 0) {
                return res.json({ ok: false, message: "No inventory available yet. Partners need to list properties first." });
            }
        }

        // Try AI generation if API Key exists and is real
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") {
            try {
                const aiItinerary = await generateItinerary(destination, vibe, usedInventory);
                return res.json({ ok: true, data: aiItinerary });
            } catch (aiErr) {
                console.error("AI Generation failed, falling back to heuristic:", aiErr.message);
            }
        }

        // --- HEURISTIC FALLBACK ---
        const stays = usedInventory.filter(i => i.category === "hotel");
        const vehicles = usedInventory.filter(i => ["car", "bike"].includes(i.category));
        const activities = usedInventory.filter(i => i.category === "activity");

        const stay = stays[0];
        const vehicle = vehicles[0];
        const actList = activities.slice(0, 4);

        const vibeMap = {
            chill: "Serene & Relaxed",
            adventure: "High Octane",
            culture: "Heritage & Soul",
            luxury: "Grand & Elite"
        };

        const vibeDescMap = {
            chill: "Unwind with scenic views and peaceful moments.",
            adventure: "Get your adrenaline pumping with thrilling activities.",
            culture: "Immerse yourself in local traditions and history.",
            luxury: "Indulge in premium experiences and five-star comfort."
        };

        const destName = destination.charAt(0).toUpperCase() + destination.slice(1);
        let calculatedTotal = 0;

        // Day 1: Arrival
        const day1Items = [];
        if (vehicle) {
            day1Items.push({
                type: "vehicle", time: "09:30 AM",
                title: `Pickup: ${vehicle.title}`,
                desc: `Your ${vehicle.category === "bike" ? "two-wheeler" : "ride"} awaits at the arrival point. ${vehicle.description?.substring(0, 80) || "Comfortable and reliable transport for your trip."}`,
            });
            calculatedTotal += (vehicle.price || 0);
        } else {
            day1Items.push({
                type: "vehicle", time: "09:30 AM",
                title: "Local Transport Arranged",
                desc: "A local cab or auto will be arranged for comfortable transfers throughout your stay."
            });
        }

        if (stay) {
            day1Items.push({
                type: "hotel", time: "12:00 PM",
                title: `Check-in: ${stay.title}`,
                desc: stay.description?.substring(0, 120) || "Settle into your accommodation and take in the surroundings."
            });
            calculatedTotal += (stay.price || 0);
        } else {
            day1Items.push({
                type: "hotel", time: "12:00 PM",
                title: `Stay in ${destName}`,
                desc: "Check into a comfortable local stay and freshen up before exploring."
            });
        }

        if (actList[0]) {
            day1Items.push({
                type: "activity", time: "04:30 PM",
                title: actList[0].title,
                desc: actList[0].description?.substring(0, 120) || vibeDescMap[vibe] || "A curated experience to kick off your trip."
            });
            calculatedTotal += (actList[0].price || 0);
        } else {
            day1Items.push({
                type: "activity", time: "04:30 PM",
                title: `Explore ${destName}`,
                desc: `Take a leisurely walk and discover the local charm of ${destName}. ${vibeDescMap[vibe] || ""}`
            });
        }

        // Day 2: Exploration
        const day2Items = [];
        if (actList[1]) {
            day2Items.push({
                type: "activity", time: "08:00 AM",
                title: actList[1].title,
                desc: actList[1].description?.substring(0, 120) || "Start the day with an enriching experience."
            });
            calculatedTotal += (actList[1].price || 0);
        } else {
            day2Items.push({
                type: "activity", time: "08:00 AM",
                title: "Morning at leisure",
                desc: `Enjoy a relaxed breakfast and soak in the morning vibes of ${destName}.`
            });
        }

        if (actList[2]) {
            day2Items.push({
                type: "activity", time: "12:00 PM",
                title: actList[2].title,
                desc: actList[2].description?.substring(0, 120) || "A midday highlight curated just for you."
            });
            calculatedTotal += (actList[2].price || 0);
        }

        if (actList[3]) {
            day2Items.push({
                type: "activity", time: "04:00 PM",
                title: actList[3].title,
                desc: actList[3].description?.substring(0, 120) || "Wind down with one final memorable experience."
            });
            calculatedTotal += (actList[3].price || 0);
        }

        // Always add a checkout step
        day2Items.push({
            type: "hotel", time: "06:00 PM",
            title: stay ? `Check-out: ${stay.title}` : "Check-out & Departure",
            desc: `Wrap up your ${destName} adventure. We hope you had an incredible time!`
        });

        const totalItinerary = {
            destination: destName + (broadened ? " (Region)" : ""),
            vibe: vibeMap[vibe] || "Custom",
            days: [
                { day: 1, title: "Arrival & First Impressions", items: day1Items },
                { day: 2, title: "Deep Exploration & Departure", items: day2Items }
            ],
            totalPrice: calculatedTotal
        };

        res.json({ ok: true, data: totalItinerary });

    } catch (err) { next(err); }
});

export default router;
