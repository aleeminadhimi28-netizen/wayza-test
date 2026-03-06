
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGO_URL);

async function run() {
    try {
        await client.connect();
        const db = client.db();
        const users = db.collection("users");
        const partners = db.collection("partners");

        const email = "partner@wayza.com";
        const password = "password";

        await users.deleteOne({ email });
        await partners.deleteOne({ email });

        const hash = await bcrypt.hash(password, 10);
        await users.insertOne({ email, password: hash, role: "partner", createdAt: new Date() });
        await partners.insertOne({
            email,
            businessName: "Wayza Test Partner",
            type: "mixed",
            onboarded: true,
            createdAt: new Date()
        });

        console.log(`- SEED COMPLETE -`);
        console.log(`Partner: ${email}`);
        console.log(`Password: ${password}`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
