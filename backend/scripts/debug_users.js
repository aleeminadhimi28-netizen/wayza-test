
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
    console.error("MONGO_URL not found in .env");
    process.exit(1);
}

const client = new MongoClient(MONGO_URL);

async function run() {
    try {
        await client.connect();
        const db = client.db();
        const users = await db.collection("users").find({}).toArray();
        console.log("Users in DB:");
        users.forEach(u => {
            console.log(`- ${u.email} (Role: ${u.role})`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
