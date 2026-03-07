import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGO_URL;
const client = new MongoClient(url);

async function listUsers() {
    try {
        await client.connect();
        const db = client.db();
        const users = db.collection('users');

        const allUsers = await users.find({}).project({ password: 0 }).toArray();
        console.log("All Users in Database:");
        console.table(allUsers);

    } finally {
        await client.close();
    }
}

listUsers();
