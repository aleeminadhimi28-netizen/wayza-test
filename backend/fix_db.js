import { connectDB, getDB } from './config/db.js';
(async () => {
  await connectDB();
  const db = getDB();
  const r = await db.collection('listings').updateMany({title: 'Sample Property'}, { $set: { category: 'hotel' } });
  console.log('Fixed', r);
  process.exit(0);
})();
