
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

        const email = "admin@wayza.com";
        const password = "adminpassword";

        await users.deleteOne({ email });

        const hash = await bcrypt.hash(password, 10);
        await users.insertOne({ email, password: hash, role: "admin", createdAt: new Date() });

        console.log(`- ADMIN SEED COMPLETE -`);
        console.log(`Admin: ${email}`);
        console.log(`Password: ${password}`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
