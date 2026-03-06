import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGO_URL || "mongodb://localhost:27017/wayza");

async function run() {
    try {
        await client.connect();
        const db = client.db();

        // Update STAY EDAVA
        await db.collection("listings").updateOne(
            { title: "STAY EDAVA" },
            { $set: { latitude: 8.8053, longitude: 76.6713 } }
        );

        // Update Mumbai Grand Hotel
        await db.collection("listings").updateOne(
            { title: "Mumbai Grand Hotel" },
            { $set: { latitude: 19.0760, longitude: 72.8777 } }
        );

        console.log("Updated sample listings with GPS coordinates.");
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
