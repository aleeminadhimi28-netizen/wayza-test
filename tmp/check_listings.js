import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

const url = process.env.MONGO_URL;
if (!url) {
    console.error("MONGO_URL not found");
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
        const sample = await listings.find({}).limit(5).toArray();

        console.log(`Total listings: ${count}`);
        console.log(`Approved listings: ${approvedCount}`);
        console.log("Sample listings (first 5):", JSON.stringify(sample, null, 2));
    } finally {
        await client.close();
    }
}

run();
