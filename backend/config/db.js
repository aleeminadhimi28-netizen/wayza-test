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
    await wishlists.createIndex({ userEmail: 1 });
    await wishlists.createIndex({ listingId: 1 });
    await reviews.createIndex({ listingId: 1 });
    await messages.createIndex({ bookingId: 1, createdAt: 1 });
    await messages.createIndex({ timestamp: -1 });
    await resetTokens.createIndex({ expiry: 1 }, { expireAfterSeconds: 0 });

    const otps = db.collection("otps");
    await otps.createIndex({ expiry: 1 }, { expireAfterSeconds: 0 });

    const coupons = db.collection("coupons");
    await coupons.createIndex({ code: 1 }, { unique: true });

    const webhooks = db.collection("webhooks");
    await webhooks.createIndex({ eventId: 1 }, { unique: true });

    const bookingLocks = db.collection("booking_locks");
    await bookingLocks.createIndex({ lockedAt: 1 }, { expireAfterSeconds: 60 });

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

    console.log("✅ Database indexes verified");
};
