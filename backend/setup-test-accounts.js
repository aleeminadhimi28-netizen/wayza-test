import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const url = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wayza_db";

async function setupAccounts() {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db();
        const users = db.collection("users");

        const passwordHash = await bcrypt.hash("12345678", 10);

        // Setup Admin
        await users.updateOne(
            { email: "admin@wayza.com" },
            {
                $set: {
                    password: passwordHash,
                    role: "admin",
                    createdAt: new Date(),
                    name: "Admin User",
                    status: "approved"
                }
            },
            { upsert: true }
        );
        console.log("Admin account setup: admin@wayza.com");

        // Setup Partner
        await users.updateOne(
            { email: "partner@wayza.com" },
            {
                $set: {
                    password: passwordHash,
                    role: "partner",
                    createdAt: new Date(),
                    name: "Partner User",
                    status: "approved"
                }
            },
            { upsert: true }
        );
        console.log("Partner account setup: partner@wayza.com");

        // Setup Guest
        await users.updateOne(
            { email: "test_guest@gmail.com" },
            {
                $set: {
                    password: passwordHash,
                    role: "guest",
                    createdAt: new Date(),
                    name: "Test Guest",
                    status: "approved"
                }
            },
            { upsert: true }
        );
        console.log("Guest account setup: test_guest@gmail.com");

    } catch (err) {
        console.error("Error setting up accounts:", err);
    } finally {
        await client.close();
    }
}

setupAccounts();
