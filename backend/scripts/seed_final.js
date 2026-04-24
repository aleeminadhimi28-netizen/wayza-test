
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

if (process.env.NODE_ENV === "production") {
    console.error("SEED SCRIPTS CANNOT RUN IN PRODUCTION");
    process.exit(1);
}
const client = new MongoClient(process.env.MONGO_URL);

async function run() {
    try {
        await client.connect();
        const db = client.db();
        const users = db.collection("users");
        const partners = db.collection("partners");

        const email = "partner@wayzza.com";
        const password = "password";

        await users.deleteOne({ email });
        await partners.deleteOne({ email });

        const hash = await bcrypt.hash(password, 10);
        await users.insertOne({ email, password: hash, role: "partner", createdAt: new Date() });
        await partners.insertOne({
            email,
            businessName: "Wayzza Test Partner",
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
