import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

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
    await wishlists.createIndex({ userEmail: 1 });
    await wishlists.createIndex({ listingId: 1 });
    await reviews.createIndex({ listingId: 1 });
    await messages.createIndex({ sender: 1, receiver: 1 });
    await messages.createIndex({ timestamp: -1 });

    console.log("✅ Database indexes verified");
};
