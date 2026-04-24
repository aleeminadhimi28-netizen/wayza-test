import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/wayzza';

const extraInventory = [
    {
        title: "The Clifftop Sanctuary",
        location: "North Cliff, Varkala",
        price: 18500,
        description: "An elite boutique stay perched on the edge of the world. Floor-to-ceiling windows and private basalt pools. The pinnacle of Varkala luxury.",
        category: "hotel",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200",
        ownerEmail: "admin@wayzza.com",
        approved: true,
        createdAt: new Date()
    },
    {
        title: "Wayzza Premium SUV",
        location: "Varkala Town",
        price: 4500,
        description: "A blacked-out Range Rover Defender for your coastal exploration. Includes a professional driver if requested.",
        category: "car",
        image: "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&w=1200",
        ownerEmail: "admin@wayzza.com",
        approved: true,
        createdAt: new Date()
    },
    {
        title: "Scrambler 400X",
        location: "Varkala Cliff",
        price: 1800,
        description: "The perfect companion for narrow coastal roads. A retro-modern scrambler for the soulful explorer.",
        category: "bike",
        image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200",
        ownerEmail: "admin@wayzza.com",
        approved: true,
        createdAt: new Date()
    }
];

async function seed() {
    const client = new MongoClient(MONGO_URL.includes('wayzza') ? MONGO_URL.split('/wayzza')[0] : MONGO_URL);
    try {
        await client.connect();
        const db = client.db('wayzza');
        const count = await db.collection('listings').countDocuments({ location: { $regex: 'Varkala', $options: 'i' }, category: 'hotel' });

        if (count > 0) {
            console.log("Stays already exist in Varkala. Skipping redundant seed.");
        } else {
            const result = await db.collection('listings').insertMany(extraInventory);
            console.log(`Successfully seeded ${result.insertedCount} additional items for AI Planner.`);
        }
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await client.close();
    }
}

seed();
