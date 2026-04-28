import { connectDB, getDB } from './config/db.js';

(async () => {
    try {
        await connectDB();
        const db = getDB();
        await db.collection('users').updateOne(
            { email: 'testguest@test.com' },
            { $set: { name: 'Test Guest', phone: '1234567890' } }
        );
        console.log('✅ Updated test user with name and phone');
        process.exit(0);
    } catch (err) {
        console.error('❌ Update failed:', err);
        process.exit(1);
    }
})();