import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGO_URL;
const client = new MongoClient(url);

async function checkUser() {
    try {
        await client.connect();
        const db = client.db();
        const users = db.collection('users');
        const partners = db.collection('partners');

        const email = "partner@wayza.com";
        const userFound = await users.findOne({ email });
        const partnerFound = await partners.findOne({ email });

        console.log(`Checking for ${email}:`);
        console.log("In 'users' collection:", userFound ? "FOUND" : "NOT FOUND");
        console.log("In 'partners' collection:", partnerFound ? "FOUND" : "NOT FOUND");

        if (userFound) {
            console.log("User Role:", userFound.role);
        }

    } finally {
        await client.close();
    }
}

checkUser();
