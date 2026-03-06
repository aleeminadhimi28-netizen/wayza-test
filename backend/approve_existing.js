
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGO_URL);

async function run() {
    try {
        await client.connect();
        const db = client.db();
        const listings = db.collection("listings");

        const res = await listings.updateMany(
            { approved: { $exists: false } },
            { $set: { approved: true, approvedAt: new Date() } }
        );

        console.log(`Updated ${res.modifiedCount} existing listings to approved status.`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
