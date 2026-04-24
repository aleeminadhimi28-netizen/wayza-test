
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

        const email = "partner@wayzza.com";
        const password = "password123";

        // Remove old occurrences
        await users.deleteOne({ email });
        await partners.deleteOne({ email });

        const hash = await bcrypt.hash(password, 10);
        await users.insertOne({ email, password: hash, role: "partner", createdAt: new Date() });
        await partners.insertOne({
            email,
            businessName: "Wayzza Main Partner",
            type: "mixed",
            onboarded: true,
            createdAt: new Date()
        });

        console.log(`- SEED COMPLETE -`);
        console.log(`Partner: ${email}`);
        console.log(`Password: ${password}`);

        const check = await users.findOne({ email });
        console.log(`Verification: ${check.email} is ${check.role}`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
