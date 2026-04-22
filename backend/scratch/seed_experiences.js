import { MongoClient } from 'mongodb';

const uri = 'mongodb://wayza:pudols123@ac-t1bgulx-shard-00-00.k5x8kar.mongodb.net:27017,ac-t1bgulx-shard-00-01.k5x8kar.mongodb.net:27017,ac-t1bgulx-shard-00-02.k5x8kar.mongodb.net:27017/wayza?ssl=true&authSource=admin&retryWrites=true&w=majority';
const client = new MongoClient(uri);

const experiences = [
    {
        title: "Paragliding over Red Cliffs",
        description: "Soar above the stunning red laterite cliffs of Varkala and the endless blue of the Arabian Sea. An adrenaline-pumping experience with certified instructors.",
        price: 12500,
        location: "Varkala Helipad",
        category: "activity",
        subtype: "adventure",
        image: "https://images.unsplash.com/photo-1520114878144-612374253e75?auto=format&fit=crop&w=1200&q=80",
        approved: true,
        createdAt: new Date()
    },
    {
        title: "Secret Coastal Seafood Trail",
        description: "A private culinary journey through hidden coastal shacks and local kitchens. Taste the freshest authentic Kerala seafood prepared by native chefs.",
        price: 2500,
        location: "Varkala Cliff",
        category: "activity",
        subtype: "culinary",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=80",
        approved: true,
        createdAt: new Date()
    },
    {
        title: "Sunrise Cliff Yoga Retreat",
        description: "Find your inner peace with a guided yoga session right on the edge of the cliff as the sun rises over the horizon. Perfect for all skill levels.",
        price: 1500,
        location: "Odayam Beach",
        category: "activity",
        subtype: "wellness",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
        approved: true,
        createdAt: new Date()
    },
    {
        title: "Golden Hour Backwater Kayaking",
        description: "Paddle peacefully through the lush mangrove forests and calm backwaters of Edava. Experience nature and bird watching at its finest.",
        price: 3000,
        location: "Edava Backwaters",
        category: "activity",
        subtype: "maritime",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
        approved: true,
        createdAt: new Date()
    },
    {
        title: "Native Kathakali Performance",
        description: "Immerse yourself in Kerala's rich heritage with a private, authentic Kathakali dance performance complete with traditional vibrant makeup.",
        price: 4500,
        location: "Varkala Cultural Center",
        category: "activity",
        subtype: "cultural",
        image: "https://images.unsplash.com/photo-1566378955258-8636e05fdfcb?auto=format&fit=crop&w=1200&q=80",
        approved: true,
        createdAt: new Date()
    },
    {
        title: "Extreme Jet Ski Expedition",
        description: "Tear across the waves of the Arabian Sea on a high-performance jet ski. Guided open-water expeditions for thrill-seekers.",
        price: 15000,
        location: "Kappil Beach",
        category: "activity",
        subtype: "adventure",
        image: "https://images.unsplash.com/photo-1520262454473-a1a82276a574?auto=format&fit=crop&w=1200&q=80",
        approved: true,
        createdAt: new Date()
    }
];

async function run() {
  try {
    await client.connect();
    const db = client.db('wayza');
    
    // First, let's remove any old mock activities to prevent duplicates if ran multiple times
    await db.collection('listings').deleteMany({ category: 'activity' });

    const result = await db.collection('listings').insertMany(experiences);
    console.log(`Successfully inserted ${result.insertedCount} mock experiences!`);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
