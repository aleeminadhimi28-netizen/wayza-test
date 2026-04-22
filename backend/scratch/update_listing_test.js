import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb://wayza:pudols123@ac-t1bgulx-shard-00-00.k5x8kar.mongodb.net:27017,ac-t1bgulx-shard-00-01.k5x8kar.mongodb.net:27017,ac-t1bgulx-shard-00-02.k5x8kar.mongodb.net:27017/wayza?ssl=true&authSource=admin&retryWrites=true&w=majority';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('wayza');
    const result = await db.collection('listings').updateOne(
      { _id: new ObjectId('69ac8acabba8b55edce050dd') },
      { $set: { amenities: ['Free WiFi', 'Breakfast included', '24hr security', 'Power backup'] } }
    );
    console.log(`Matched ${result.matchedCount} and modified ${result.modifiedCount}`);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
