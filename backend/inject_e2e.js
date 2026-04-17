import bcrypt from 'bcryptjs';
import { connectDB, getDB } from './config/db.js';

(async () => {
    try {
        await connectDB();
        const db = getDB();
        const hash = await bcrypt.hash('Password123', 10);
        
        // 1. Partner
        const partner = { 
            name: 'Test Partner', 
            email: 'partner@test.com', 
            password: hash, 
            role: 'partner', 
            phone: '9876543210' 
        };
        await db.collection('users').updateOne({ email: 'partner@test.com' }, { $set: partner }, { upsert: true });
        
        // 2. Listing
        const listing = { 
            title: 'Neural Sanctuary E2E', 
            desc: 'A premium E2E test stay.', 
            location: 'Munnar, Kerala', 
            price: 5000, 
            category: 'hotel', 
            ownerEmail: 'partner@test.com', 
            approved: true, 
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945', 
            walkthroughVideo: 'https://player.vimeo.com/video/506820000',
            variants: [{ name: 'Standard Suite', price: 5000 }] 
        };
        const lRes = await db.collection('listings').updateOne({ title: 'Neural Sanctuary E2E' }, { $set: listing }, { upsert: true });
        console.log('Listing Ready:', listing.title);

        // 3. Guest
        const guest = { 
            name: 'Test Guest', 
            email: 'guest@test.com', 
            password: hash, 
            role: 'guest', 
            phone: '1234567890' 
        };
        await db.collection('users').updateOne({ email: 'guest@test.com' }, { $set: guest }, { upsert: true });
        
        console.log('✅ E2E Injection Complete');
        process.exit(0);
    } catch (err) {
        console.error('❌ Injection Failed:', err);
        process.exit(1);
    }
})();
