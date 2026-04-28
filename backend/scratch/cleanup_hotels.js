require('dotenv').config();
import { MongoClient } from 'mongodb';

const uri = 'process.env.MONGO_URI;
const client = new MongoClient(uri);

async function cleanDB() {
    try {
        await client.connect();
        const db = client.db('wayza');
        const listings = db.collection('listings');

        // Find all hotels sorted by latest
        const hotels = await listings.find({ category: 'hotel' }).sort({ createdAt: -1 }).toArray();
        
        console.log(`Found ${hotels.length} hotels.`);
        
        // Let's keep unique titles so it doesn't look so repetitive
        const seenTitles = new Set();
        const toDeleteIds = [];

        for (const h of hotels) {
            // Keep "Sample Property" and "Neural Sanctuary E2E"
            if (h.title === "Sample Property" || h.title === "Neural Sanctuary E2E") {
                seenTitles.add(h.title);
                continue;
            }
            
            // For other properties, only keep one of each title
            if (!seenTitles.has(h.title)) {
                seenTitles.add(h.title);
            } else {
                // If we already have one with this title, mark for deletion
                toDeleteIds.push(h._id);
            }
        }

        console.log(`Deleting ${toDeleteIds.length} duplicate properties...`);

        if (toDeleteIds.length > 0) {
            const result = await listings.deleteMany({ _id: { $in: toDeleteIds } });
            console.log(`Successfully deleted ${result.deletedCount} duplicate properties.`);
        } else {
            console.log("No duplicates found.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

cleanDB();
