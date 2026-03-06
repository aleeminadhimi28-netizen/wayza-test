import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGO_URL);

async function run() {
    try {
        await client.connect();
        const db = client.db();
        const listing = await db.collection("listings").findOne({ title: "STAY EDAVA" });
        console.log(JSON.stringify(listing, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
