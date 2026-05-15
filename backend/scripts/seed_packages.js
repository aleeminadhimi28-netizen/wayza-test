import { connectDB, getDB } from '../config/db.js';

(async () => {
  await connectDB();
  const db = getDB();
  
  const hotel = await db.collection('listings').findOne({ category: 'hotel' });
  const vehicle = await db.collection('listings').findOne({ category: { $in: ['bike', 'car'] } });
  
  const packages = [
    {
      name: 'Romantic Varkala Getaway',
      description: 'A perfect 3-day getaway with a clifftop villa and a Royal Enfield to explore.',
      price: 15000,
      hotelId: hotel ? hotel._id.toString() : 'placeholder_hotel_id',
      vehicleId: vehicle ? vehicle._id.toString() : 'placeholder_vehicle_id',
      experienceDetails: 'Candlelight dinner on the cliff included.',
      image: '/images/varkala_hero.webp',
      active: true,
      createdAt: new Date()
    },
    {
      name: 'Digital Nomad Power Week',
      description: 'Stay productive with high-speed wifi and a dedicated workspace, plus a scooter for quick breaks.',
      price: 12000,
      hotelId: hotel ? hotel._id.toString() : 'placeholder_hotel_id',
      vehicleId: vehicle ? vehicle._id.toString() : 'placeholder_vehicle_id',
      experienceDetails: 'Access to co-working space and unlimited coffee.',
      image: '/images/varkala_cliff.webp',
      active: true,
      createdAt: new Date()
    }
  ];
  
  const result = await db.collection('packages').insertMany(packages);
  console.log('✅ Seeded packages:', result.insertedCount);
  process.exit(0);
})();
