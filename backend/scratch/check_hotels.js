require('dotenv').config();
import { MongoClient } from 'mongodb';

const uri = 'process.env.MONGO_URI;
const client = new MongoClient(uri);

async function checkDB() {
    try {
        await client.connect();
        const db = client.db('wayza');
        const hotels = await db.collection('listings').find({ category: 'hotel' }).toArray();
        console.log("Remaining hotels:");
        hotels.forEach(h => console.log(`- ${h.title}`));
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
checkDB();
