import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();

if (process.env.NODE_ENV === "production") {
    console.error("SEED SCRIPTS CANNOT RUN IN PRODUCTION");
    process.exit(1);
}
const client = new MongoClient(process.env.MONGO_URL || "mongodb://localhost:27017/wayza");

async function run() {
    try {
        await client.connect();
        const db = client.db();
        const email = "admin@wayza.com";
        const password = "admin"; // Using 'admin' as requested or common default
        const hash = await bcrypt.hash(password, 10);

        await db.collection("users").updateOne(
            { email, role: "admin" },
            { $set: { password: hash } },
            { upsert: true }
        );
        console.log(`Admin user ${email} updated/created with password: ${password}`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
