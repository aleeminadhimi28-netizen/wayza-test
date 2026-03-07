import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGO_URL;
const client = new MongoClient(url);

async function resetPassword() {
    try {
        await client.connect();
        const db = client.db();
        const users = db.collection('users');

        const email = "partner@wayza.com";
        const newPassword = "password"; // Setting it to exactly what they are typing
        const hash = await bcrypt.hash(newPassword, 10);

        const result = await users.updateOne({ email }, { $set: { password: hash } });

        if (result.modifiedCount > 0) {
            console.log(`Successfully reset password for ${email} to 'password'`);
        } else {
            console.log("No changes made. User might not exist or password hash matched.");
        }

    } finally {
        await client.close();
    }
}

resetPassword();
