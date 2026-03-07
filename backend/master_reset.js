import { MongoClient } from 'mongodb';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const url = "mongodb://wayza:pudols123@ac-t1bgulx-shard-00-00.k5x8kar.mongodb.net:27017,ac-t1bgulx-shard-00-01.k5x8kar.mongodb.net:27017,ac-t1bgulx-shard-00-02.k5x8kar.mongodb.net:27017/wayza?ssl=true&authSource=admin&retryWrites=true&w=majority";

const client = new MongoClient(url);

async function masterReset() {
    try {
        await client.connect();
        const db = client.db();
        const users = db.collection('users');

        const password = "password";
        const hash = await bcryptjs.hash(password, 8);

        const accounts = [
            "partner@wayza.com",
            "admin@wayza.com",
            "test@wayza.com"
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
