import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGO_URL;
if (!url) {
    console.error("MONGO_URL not found in .env");
    process.exit(1);
}

const client = new MongoClient(url);

const sampleListings = [
    {
        title: "Ocean View Luxury Villa",
        location: "Varkala Cliff, Kerala",
        description: "A stunning 3-bedroom villa overlooking the Arabian Sea. Features a private infinity pool and traditional Kerala architecture.",
        price: 15000,
        category: "hotel",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        approved: true,
        features: ["WiFi", "Pool", "Beach Access", "Breakfast"],
        createdAt: new Date()
    },
    {
        title: "Tropical Garden Retreat",
        location: "Varkala, Kerala",
        description: "Serene cottage surrounded by lush palm trees and exotic gardens. Perfect for a quiet getaway.",
        price: 8500,
        category: "hotel",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        approved: true,
        features: ["Garden", "AC", "WiFi"],
        createdAt: new Date()
    },
    {
        title: "Royal Enfield Himalayan 411",
        location: "Varkala Station",
        description: "The ultimate adventure bike for exploring the coastal roads of Kerala.",
        price: 1200,
        category: "bike",
        image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
        approved: true,
        features: ["Helmet Included", "Full Tank", "Insured"],
        createdAt: new Date()
    },
    {
        title: "Coastal Sunset Jeep Safari",
        location: "North Cliff",
        description: "Experience the majestic sunset of Varkala from the best vantage points in an open-top Jeep.",
        price: 3500,
        category: "activity",
        image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
        approved: true,
        features: ["Guide", "Refreshments", "Photos"],
        createdAt: new Date()
    }
];

async function seed() {
    try {
        await client.connect();
        const db = client.db();
        const listings = db.collection('listings');

        // Optional: Clear existing if you want a fresh start
        // await listings.deleteMany({});

        const result = await listings.insertMany(sampleListings);
        console.log(`Successfully seeded ${result.insertedCount} listings into the database!`);

    } catch (err) {
        console.error("Error seeding database:", err);
    } finally {
        await client.close();
    }
}

seed();
