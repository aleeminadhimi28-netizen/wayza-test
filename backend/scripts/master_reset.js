import { MongoClient } from 'mongodb';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const url = "process.env.MONGO_URI;

const client = new MongoClient(url);

async function masterReset() {
    try {
        await client.connect();
        const db = client.db();
        const users = db.collection('users');

        const password = "password";
        const hash = await bcryptjs.hash(password, 8);

        const accounts = [
            "partner@wayzza.com",
            "admin@wayzza.com",
            "test@wayzza.com"
        ];

        for (const email of accounts) {
            const res = await users.updateOne(
                { email: email },
                { $set: { password: hash, role: email.startsWith("admin") ? "admin" : "partner" } },
                { upsert: true }
            );
            console.log(`Updated ${email}: ${res.modifiedCount || res.upsertedCount} changes.`);
        }

        console.log("Master reset complete. Use 'password' for all these accounts.");

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

masterReset();
