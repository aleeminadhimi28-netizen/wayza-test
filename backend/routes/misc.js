import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { requireAuth } from "../middleware/auth.js";
import { generateItinerary, answerListingQuery, generateNeighborhoodVibe } from "../utils/ai.js";
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

const newsletterSchema = z.object({
    email: z.string().email()
});

const router = express.Router();

/* ================= PLATFORM CONFIG ================= */

router.get("/config", async (req, res, next) => {
    try {
        const db = getDB();
        const config = await db.collection("settings").findOne({ type: "financials" }) || {
            gstRate: 0.12,
            serviceFee: 99,
            commissionRate: 0.10
        };
        res.json({ ok: true, data: config });
    } catch (err) { next(err); }
});

/* ================= NEWSLETTER ================= */

router.post("/newsletter", async (req, res, next) => {
    try {
        const parsed = newsletterSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Valid email is required" });

        const db = getDB();
        const { email } = parsed.data;

        await db.collection("newsletters").updateOne(
            { email },
            { $setOnInsert: { email, createdAt: new Date() } },
            { upsert: true }
        );

        res.json({ ok: true, message: "Subscribed successfully" });
    } catch (err) { next(err); }
});

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

/* ================= COUPONS ================= */

const couponValidateSchema = z.object({
    code: z.string().min(1)
});

router.post("/validate-coupon", async (req, res, next) => {
    try {
        const parsed = couponValidateSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Coupon code is required" });

        const db = getDB();
        const code = parsed.data.code.toUpperCase();
        const coupon = await db.collection("coupons").findOne({ code, isActive: true });

        if (!coupon) {
            return res.status(400).json({ ok: false, message: "Invalid or inactive coupon code" });
        }

        res.json({ 
            ok: true, 
            discountPercentage: coupon.discountPercentage,
            code: coupon.code
        });
    } catch (err) { next(err); }
});

/* ================= AI CONCIERGE CHAT ================= */

const chatSchema = z.object({
    listingId: z.string().min(1),
    query: z.string().min(3).max(500)
});

router.post("/chat", async (req, res, next) => {
    try {
        const parsed = chatSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ ok: false, message: "Listing ID and query are required" });

        const { listingId, query } = parsed.data;
        const db = getDB();
        
        if (!ObjectId.isValid(listingId)) return res.status(400).json({ ok: false, message: "Invalid ID" });
        const listing = await db.collection("listings").findOne({ _id: new ObjectId(listingId) });
        if (!listing) return res.status(404).json({ ok: false, message: "Listing not found" });

        // Logic check for AI key
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") {
            try {
                const answer = await answerListingQuery(query, listing);
                return res.json({ ok: true, answer });
            } catch (aiErr) {
                console.error("AI Concierge failed:", aiErr.message);
            }
        }

        // Fallback if AI fails or key is missing
        res.json({ 
            ok: true, 
            answer: "Thank you for your inquiry. Our elite concierge team is currently reviewing your request about " + listing.title + " and will respond shortly."
        });

    } catch (err) { next(err); }
});

/* ================= NEIGHBORHOOD VIBE ================= */

router.get("/neighborhood-vibe", async (req, res, next) => {
    try {
        const { location, category } = req.query;
        if (!location) return res.status(400).json({ ok: false, message: "Location is required" });

        // Try AI generation
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") {
            try {
                const vibe = await generateNeighborhoodVibe(location, category);
                return res.json({ ok: true, data: vibe });
            } catch (aiErr) {
                console.error("Vibe generation failed:", aiErr.message);
            }
        }

        // Fallback
        res.json({
            ok: true,
            data: {
                vibeTitle: "Coastal Rhapsody",
                vibeDesc: "A sanctuary where the rhythm of the waves meets the soul of contemporary luxury.",
                hotspots: [
                    { name: "The Cliff Trail", iconLabel: "Compass", label: "Adventure" },
                    { name: "Soul Food Cafe", iconLabel: "Coffee", label: "Gourmet" },
                    { name: "Private Shore", iconLabel: "Waves", label: "Exclusive" },
                    { name: "Luna Lounge", iconLabel: "Moon", label: "Nightlife" }
                ]
            }
        });
    } catch (err) { next(err); }
});

// ---------------- SEED DATA ----------------
if (process.env.ALLOW_SEED === 'true') {
    router.post('/seed', async (req, res, next) => {
        try {
            const db = getDB();
            await db.collection('bookings').deleteMany({});
            
            // Insert admin user
            const users = db.collection('users');
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@wayza.com';
            const adminExists = await users.findOne({ email: adminEmail });
            if (!adminExists) {
                await users.insertOne({
                    email: adminEmail,
                    password: '$2a$10$placeholderhash', // placeholder bcrypt hash
                    role: 'admin',
                    createdAt: new Date()
                });
            }
            // Insert sample property
            const listings = db.collection('listings');
            const sampleExists = await listings.findOne({ title: 'Sample Property' });
            if (!sampleExists) {
                await listings.insertOne({
                    title: 'Sample Property',
                    location: 'Sample City',
                    price: 100,
                    category: 'hotel',
                    description: 'A sample property for testing.',
                    ownerEmail: adminEmail,
                    approved: true,
                    createdAt: new Date(),
                    variants: []
                });
            }
            res.json({ ok: true, message: 'Seed data inserted' });
        } catch (err) {
            next(err);
        }
    });
}
export default router;
