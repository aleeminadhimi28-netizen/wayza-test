import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import dns from "dns";

// Fix for Node.js DNS lookup issues with MongoDB SRV on some networks
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
}

dotenv.config();

const MONGO_URL = process.env.MONGO_URL ? process.env.MONGO_URL.trim() : null;

if (!MONGO_URL) {
    throw new Error("MONGO_URL is not configured in .env file");
}

const client = new MongoClient(MONGO_URL, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    maxPoolSize: 100,
    minPoolSize: 10
});

let db;

export const connectDB = async () => {
    try {
        await client.connect();
        console.log("✅ MongoDB Connected");
        db = client.db();
        await createIndexes(db);

        try {
            // Ensure legacy vehicle listings have licensePlate and registrationDate fields
            const migrationResult = await db.collection("listings").updateMany(
                { category: { $in: ["bike", "car"] }, licensePlate: { $exists: false } },
                { $set: { licensePlate: "", registrationDate: "" } }
            );
            if (migrationResult.modifiedCount > 0) {
                console.log(`✅ Migrated ${migrationResult.modifiedCount} legacy vehicle listings (added licensePlate & registrationDate)`);
            }

            // Ensure non-hotel listings have a default variant to support date-based custom pricing
            const cursor = db.collection("listings").find({
                category: { $in: ["bike", "car", "activity"] },
                $or: [
                    { variants: { $exists: false } },
                    { variants: { $size: 0 } },
                    { variants: null }
                ]
            });
            let variantMigrationCount = 0;
            while (await cursor.hasNext()) {
                const doc = await cursor.next();
                const parentPrice = typeof doc.price === "number" ? doc.price : Number(doc.price) || 0;
                await db.collection("listings").updateOne(
                    { _id: doc._id },
                    {
                        $set: {
                            variants: [
                                { name: "Standard", price: parentPrice, priceRules: [] }
                            ]
                        }
                    }
                );
                variantMigrationCount++;
            }
            if (variantMigrationCount > 0) {
                console.log(`✅ Migrated ${variantMigrationCount} listings to have a default variant`);
            }

            // Self-healing: Repair any listings where variants.price was set to the literal string "$price"
            const brokenCursor = db.collection("listings").find({
                category: { $in: ["bike", "car", "activity"] },
                "variants.price": "$price"
            });
            let healedCount = 0;
            while (await brokenCursor.hasNext()) {
                const doc = await brokenCursor.next();
                const parentPrice = typeof doc.price === "number" ? doc.price : Number(doc.price) || 0;
                const updatedVariants = (doc.variants || []).map(v => {
                    if (v.price === "$price") {
                        return { ...v, price: parentPrice };
                    }
                    return v;
                });
                await db.collection("listings").updateOne(
                    { _id: doc._id },
                    { $set: { variants: updatedVariants } }
                );
                healedCount++;
            }
            if (healedCount > 0) {
                console.log(`✅ Healed ${healedCount} listings with corrupted literal "$price" variants`);
            }

        } catch (migrationErr) {
            console.error("⚠️ Failed to migrate legacy vehicle listings:", migrationErr.message);
        }

        return db;
    } catch (err) {
        console.error("❌ Failed to connect to MongoDB:", err.message);
        process.exit(1);
    }
};

export const getDB = () => {
    if (!db) {
        throw new Error("Database not initialized. Call connectDB first.");
    }
    return db;
};

const createIndexes = async (db) => {
    const users = db.collection("users");
    const listings = db.collection("listings");
    const bookings = db.collection("bookings");
    const wishlists = db.collection("wishlists");
    const reviews = db.collection("reviews");
    const messages = db.collection("messages");
    const resetTokens = db.collection("resetTokens");

    await users.createIndex({ email: 1 }, { unique: true, sparse: true });
    await listings.createIndex({ ownerEmail: 1 });
    await listings.createIndex({ category: 1 });
    await listings.createIndex({ approved: 1 });
    await listings.createIndex({ "variants.price": 1 });
    await bookings.createIndex({ ownerEmail: 1 });
    await bookings.createIndex({ guestEmail: 1 });
    await bookings.createIndex({ status: 1 });
    await bookings.createIndex({ listingId: 1 });
    await bookings.createIndex({ checkIn: 1 });
    // Compound index for booking overlap detection (race condition prevention)
    await bookings.createIndex({ listingId: 1, variantIndex: 1, status: 1, checkIn: 1, checkOut: 1 });
    // Location search index for AI planner
    await listings.createIndex({ location: 1 });
    await listings.createIndex({ price: 1 });
    await listings.createIndex({ title: "text", location: "text" });

    // Safely migrate wishlist index
    await wishlists.dropIndex("userEmail_1").catch(() => {});
    await wishlists.createIndex({ email: 1 });
    await wishlists.createIndex({ email: 1, listingId: 1 }, { unique: true });
    await wishlists.createIndex({ listingId: 1 });

    await reviews.createIndex({ listingId: 1 });
    await messages.createIndex({ bookingId: 1, createdAt: 1 });
    await messages.createIndex({ timestamp: -1 });
    await resetTokens.createIndex({ expiry: 1 }, { expireAfterSeconds: 0 });

    const otps = db.collection("otps");
    await otps.createIndex({ expiry: 1 }, { expireAfterSeconds: 0 });

    const otpRequests = db.collection("otp_requests");
    await otpRequests.createIndex({ requestedAt: 1 }, { expireAfterSeconds: 900 });

    const coupons = db.collection("coupons");
    await coupons.createIndex({ code: 1 }, { unique: true });

    const webhooks = db.collection("webhooks");
    await webhooks.createIndex({ eventId: 1 }, { unique: true });

    const bookingLocks = db.collection("booking_locks");
    await bookingLocks.dropIndex("lockedAt_1").catch(() => {});
    await bookingLocks.createIndex({ lockedAt: 1 }, { expireAfterSeconds: 30 });

    // TTL: Auto-expire pending bookings after 15 minutes (900 seconds)
    // Only affects documents where status === "pending" (partial filter)
    const pendingBookings = db.collection("bookings");
    await pendingBookings.createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 900, partialFilterExpression: { status: "pending" } }
    );

    // Index for notification polling
    const notifications = db.collection("notifications");
    await notifications.createIndex({ email: 1, createdAt: -1 });

    // Index for packages
    const packages = db.collection("packages");
    await packages.createIndex({ active: 1 });

    // TTL: Auto-purge activity logs after 90 days (privacy + storage hygiene)
    const activityLogs = db.collection("activityLogs");
    await activityLogs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

    // Compound index for withdrawal balance checks (email + status queried together on every earnings call)
    const withdrawalRequests = db.collection("withdrawalRequests");
    await withdrawalRequests.createIndex({ email: 1, status: 1 });
    await withdrawalRequests.createIndex({ requestedAt: -1 });

    // TTL: Auto-expire webhook idempotency records after 30 days
    const webhooks = db.collection("webhooks");
    await webhooks.createIndex({ receivedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

    console.log("✅ Database indexes verified");
};
