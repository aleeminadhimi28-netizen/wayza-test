import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGO_URL || "mongodb://localhost:27017/wayza");

async function run() {
    try {
        await client.connect();
        const db = client.db();
        const listingsWithGps = await db.collection("listings").find({ latitude: { $exists: true } }).toArray();
        console.log("Listings with GPS data:");
        console.log(JSON.stringify(listingsWithGps, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
