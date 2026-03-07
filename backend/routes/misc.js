import express from "express";
import { getDB } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";

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
        const db = getDB();
        const { listingId, rating, comment } = req.body;
        if (!listingId || !rating) return res.status(400).json({ ok: false });

        const booked = await db.collection("bookings").findOne({ listingId, guestEmail: req.user.email, status: "paid" });
        if (!booked) return res.status(403).json({ ok: false, message: "You must book to review" });

        const already = await db.collection("reviews").findOne({ listingId, guestEmail: req.user.email });
        if (already) return res.status(400).json({ ok: false, message: "Already reviewed" });

        await db.collection("reviews").insertOne({
            listingId,
            rating: Number(rating),
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
        const db = getDB();
        const { listingId, title } = req.body;
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
        const db = getDB();
        const { destination, vibe } = req.body;
        if (!destination) return res.status(400).json({ ok: false, message: "Destination required" });

        const listingsColl = db.collection("listings");

        // Logic: Find listings in that location (approved only)
        // Note: Destination input might be broad like "Varkala". We'll use regex for location.
        const baseFilter = { location: { $regex: destination, $options: "i" }, approved: true };

        // 1. Find a stay
        const stay = await listingsColl.findOne({ ...baseFilter, category: "hotel" });

        // 2. Find a vehicle (car or bike)
        const vehicle = await listingsColl.findOne({ ...baseFilter, category: { $in: ["car", "bike"] } });

        // 3. Find activities (up to 3)
        const activities = await listingsColl.find({ ...baseFilter, category: "activity" }).limit(3).toArray();

        if (!stay && activities.length === 0) {
            return res.json({ ok: false, message: "Could not find enough inventory for this destination." });
        }

        // Map Vibe to a "Title" suffix
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
                {
                    day: 1,
                    title: "Arrival & Orientation",
                    items: []
                },
                {
                    day: 2,
                    title: "Deep Exploration",
                    items: []
                }
            ],
            totalPrice: 0
        };

        let calculatedTotal = 0;

        // Populate Day 1
        if (vehicle) {
            totalItinerary.days[0].items.push({
                type: 'vehicle',
                time: "10:00 AM",
                title: `Pickup: ${vehicle.title}`,
                desc: `Your ${vehicle.category} is ready at the arrival point.`
            });
            calculatedTotal += (vehicle.price || 0);
        }

        if (stay) {
            totalItinerary.days[0].items.push({
                type: 'hotel',
                time: "02:00 PM",
                title: `Check-in: ${stay.title}`,
                desc: stay.description?.substring(0, 100) + "..."
            });
            calculatedTotal += (stay.price || 0); // Assuming 1 night
        }

        if (activities[0]) {
            totalItinerary.days[0].items.push({
                type: 'activity',
                time: "05:00 PM",
                title: activities[0].title,
                desc: activities[0].description?.substring(0, 100) + "..."
            });
            calculatedTotal += (activities[0].price || 0);
        }

        // Populate Day 2 (Deep Exploration)
        if (activities[1]) {
            totalItinerary.days[1].items.push({
                type: 'activity',
                time: "10:00 AM",
                title: activities[1].title,
                desc: activities[1].description?.substring(0, 100) + "..."
            });
            calculatedTotal += (activities[1].price || 0);
        }

        if (activities[2]) {
            totalItinerary.days[1].items.push({
                type: 'activity',
                time: "03:00 PM",
                title: activities[2].title,
                desc: activities[2].description?.substring(0, 100) + "..."
            });
            calculatedTotal += (activities[2].price || 0);
        }

        totalItinerary.totalPrice = calculatedTotal;

        res.json({ ok: true, data: totalItinerary });

    } catch (err) { next(err); }
});

export default router;
