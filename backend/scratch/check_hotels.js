import { MongoClient } from 'mongodb';

const uri = 'mongodb://wayza:pudols123@ac-t1bgulx-shard-00-00.k5x8kar.mongodb.net:27017,ac-t1bgulx-shard-00-01.k5x8kar.mongodb.net:27017,ac-t1bgulx-shard-00-02.k5x8kar.mongodb.net:27017/wayza?ssl=true&authSource=admin&retryWrites=true&w=majority';
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
