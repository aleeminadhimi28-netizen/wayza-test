import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const url = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wayza_db";

async function verify() {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db();
        const users = await db.collection("users").find({ email: { $in: ["admin@wayza.com", "partner@wayza.com"] } }).toArray();

        console.log("Found users:");
        for (const u of users) {
            const ok = await bcrypt.compare("12345678", u.password);
            console.log(`Email: ${u.email}, Role: ${u.role}, Password check: ${ok ? "PASS" : "FAIL"}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}
verify();
