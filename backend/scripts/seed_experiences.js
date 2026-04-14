import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/wayza';

const experiences = [
    {
        title: "Varkala Cliff Paragliding",
        location: "Varkala Cliff",
        price: 4500,
        description: "Soar like a bird over the majestic red cliffs of Varkala. Experience breathtaking views of the Arabian Sea and the coastline. Guided by certified professional pilots.",
        category: "activity",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
        ownerEmail: "admin@wayza.com",
        approved: true,
        createdAt: new Date()
    },
    {
        title: "Kappil Lake Kayaking",
        location: "Kappil, Varkala",
        price: 1200,
        description: "Navigate the serene backwaters where the lake meets the sea. A tranquil escape through coconut groves and calm waters. Perfect for early morning or sunset.",
        category: "activity",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        ownerEmail: "admin@wayza.com",
        approved: true,
        createdAt: new Date()
    },
    {
        title: "Advanced Surf Lessons",
        location: "Edava Beach",
        price: 3000,
        description: "Master the waves with our expert instructors. Whether you're a beginner or looking to perfect your technique, Edava's swells provide the perfect classroom.",
        category: "activity",
        image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80",
        ownerEmail: "admin@wayza.com",
        approved: true,
        createdAt: new Date()
    },
    {
        title: "Traditional Kathakali Performance",
        location: "Varkala Cultural Center",
        price: 800,
        description: "Witness the vibrant colors and dramatic storytelling of Kerala's ancient dance drama. Includes a pre-show makeup demonstration and English explanation.",
        category: "activity",
        image: "https://images.unsplash.com/photo-1626442651167-797745778a08?auto=format&fit=crop&w=1200&q=80",
        ownerEmail: "admin@wayza.com",
        approved: true,
        createdAt: new Date()
    },
    {
        title: "Ayurvedic Spa & Healing Ritual",
        location: "North Cliff, Varkala",
        price: 5500,
        description: "A comprehensive 3-hour wellness session including full-body abhyanga massage, shirodhara, and a personalized herbal steam bath at an elite wellness center.",
        category: "activity",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
        ownerEmail: "admin@wayza.com",
        approved: true,
        createdAt: new Date()
    }
];

async function seed() {
    const client = new MongoClient(MONGO_URL.includes('wayza') ? MONGO_URL.split('/wayza')[0] : MONGO_URL);
    try {
        await client.connect();
        const db = client.db('wayza');
        const result = await db.collection('listings').insertMany(experiences);
        console.log(`Successfully seeded ${result.insertedCount} experiences.`);
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await client.close();
    }
}

seed();
