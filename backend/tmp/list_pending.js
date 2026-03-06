import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGO_URL || "mongodb://localhost:27017/wayza");

async function run() {
    try {
        await client.connect();
        const db = client.db();
        const pending = await db.collection("listings").find({ approved: false }).toArray();
        console.log("Pending Listings:");
        console.log(JSON.stringify(pending, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
