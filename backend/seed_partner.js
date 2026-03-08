
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
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
        const users = db.collection("users");
        const partners = db.collection("partners");

        const email = "partner@wayza.com";
        const password = "password123";

        const exists = await users.findOne({ email });
        if (exists) {
            console.log("Partner already exists. Updating role and password...");
            const hash = await bcrypt.hash(password, 10);
            await users.updateOne({ email }, { $set: { role: "partner", password: hash } });
        } else {
            const hash = await bcrypt.hash(password, 10);
            await users.insertOne({ email, password: hash, role: "partner", createdAt: new Date() });
            await partners.insertOne({
                email,
                businessName: "Wayza Main Partner",
                type: "mixed",
                onboarded: true,
                createdAt: new Date()
            });
            console.log("Partner created: partner@wayza.com / password123");
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
