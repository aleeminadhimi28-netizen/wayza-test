// backend/scripts/seed.js
import { connectDB, getDB } from '../config/db.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

(async () => {
  try {
    await connectDB();
    const db = getDB();
    const users = db.collection('users');
    const listings = db.collection('listings');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@wayza.com';
    const guestEmail = 'testguest@test.com';
    
    const adminExists = await users.findOne({ email: adminEmail });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Password123', salt);
      await users.insertOne({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date()
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    const guestExists = await users.findOne({ email: guestEmail });
    if (!guestExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Password123', salt);
      await users.insertOne({
        email: guestEmail,
        password: hashedPassword,
        role: 'guest',
        createdAt: new Date()
      });
      console.log('✅ Guest test user created');
    } else {
      console.log('ℹ️ Guest test user already exists');
    }
    const sampleExists = await listings.findOne({ title: 'Sample Property' });
    if (!sampleExists) {
      await listings.insertOne({
        title: 'Sample Property',
        location: 'Sample City',
        price: 100,
        description: 'A sample property for testing.',
        ownerEmail: adminEmail,
        approved: true,
        createdAt: new Date(),
        variants: []
      });
      console.log('✅ Sample property created');
    } else {
      console.log('ℹ️ Sample property already exists');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed script failed', err);
    process.exit(1);
  }
})();
