import dotenv from "dotenv";
dotenv.config();
import { MongoClient } from "mongodb";

const MONGO_URL = process.env.MONGO_URL;

const client = new MongoClient(MONGO_URL);

try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();
    const users = db.collection("users");

    // 1. Delete documents with empty or null email (invalid accounts)
    const deleteResult = await users.deleteMany({
        $or: [
            { email: "" },
            { email: null },
            { email: { $exists: false } }
        ]
    });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} invalid user documents (empty/null email)`);

    // 2. Check for any remaining duplicate emails
    const pipeline = [
        { $group: { _id: "$email", count: { $sum: 1 }, ids: { $push: "$_id" } } },
        { $match: { count: { $gt: 1 } } }
    ];
    const duplicates = await users.aggregate(pipeline).toArray();

    if (duplicates.length > 0) {
        console.log(`⚠️  Found ${duplicates.length} duplicate email groups. Removing extras...`);
        for (const dup of duplicates) {
            // Keep the first document, remove the rest
            const [keep, ...remove] = dup.ids;
            const removeResult = await users.deleteMany({ _id: { $in: remove } });
            console.log(`  - email "${dup._id}": kept ${keep}, removed ${removeResult.deletedCount} duplicates`);
        }
    } else {
        console.log("✅ No duplicate emails found");
    }

    // 3. Drop existing index if exists and recreate
    try {
        await users.dropIndex("email_1");
        console.log("🗑️  Dropped old email_1 index");
    } catch (e) {
        console.log("ℹ️  No existing email_1 index to drop (or already removed)");
    }

    // 4. Recreate the unique index cleanly
    await users.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log("✅ Recreated unique email index (sparse: true to handle edge cases)");

    console.log("\n✅ Database cleanup complete! You can now start the server.");
} catch (err) {
    console.error("❌ Error during cleanup:", err.message);
} finally {
    await client.close();
}
