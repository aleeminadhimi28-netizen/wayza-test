import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGO_URL || "mongodb://localhost:27017/wayza");

async function run() {
    try {
        await client.connect();
        const db = client.db();
        const admins = await db.collection("users").find({ role: "admin" }).toArray();
        console.log("Admin Users:");
        console.log(JSON.stringify(admins, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
