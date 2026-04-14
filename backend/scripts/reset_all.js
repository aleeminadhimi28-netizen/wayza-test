import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGO_URL;
const client = new MongoClient(url);

async function resetAll() {
    try {
        await client.connect();
        const db = client.db();
        const users = db.collection('users');

        const accounts = [
            "partner@wayza.com",
            "admin@wayza.com",
            "test@wayza.com"
        ];

        const password = "password";
        const hash = await bcrypt.hash(password, 10);

        for (const email of accounts) {
            await users.updateOne({ email }, { $set: { password: hash } });
            console.log(`Reset ${email} to 'password'`);
        }

    } finally {
        await client.close();
    }
}

resetAll();
