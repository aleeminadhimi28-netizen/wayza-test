
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

        const email = "admin@wayzza.com";
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
