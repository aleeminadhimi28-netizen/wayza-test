
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

        const email = "partner@wayza.com";
        const password = "password123";

        const user = await users.findOne({ email });
        if (!user) {
            console.log("User not found");
            return;
        }

        const ok = await bcrypt.compare(password, user.password);
        console.log(`Password match for ${email}: ${ok}`);
        console.log(`Hash in DB: ${user.password}`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

run();
