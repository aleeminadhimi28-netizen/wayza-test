import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGO_URL;
console.log("Using MONGO_URL:", url ? "Found" : "NOT FOUND");

if (!url) {
    process.exit(1);
}

const client = new MongoClient(url);

async function run() {
    try {
        await client.connect();
        const db = client.db();
        const listings = db.collection('listings');
        const count = await listings.countDocuments();
        const approvedCount = await listings.countDocuments({ approved: true });

        console.log(`Total listings: ${count}`);
        console.log(`Approved listings: ${approvedCount}`);

        const allListings = await listings.find({}).limit(10).toArray();
        console.log("All Listings (short):", allListings.map(l => ({ id: l._id, title: l.title, approved: l.approved, category: l.category })));
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

run();
