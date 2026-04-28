require('dotenv').config();
import { MongoClient, ObjectId } from 'mongodb';

const uri = 'process.env.MONGO_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('wayza');
    const result = await db.collection('listings').updateOne(
      { _id: new ObjectId('69ac8acabba8b55edce050dd') },
      { 
        $set: { 
          wifiSpeed: 150,
          amenities: [
            'Free High-Speed Wi-Fi',
            'Air Conditioning',
            'Power Backup / Generator',
            'Beach Access',
            'Yoga Deck / Meditation Space',
            'Dedicated Workspace',
            'Smart Lock / Self Check-in'
          ] 
        } 
      }
    );
    console.log(`Matched ${result.matchedCount} and modified ${result.modifiedCount}`);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
