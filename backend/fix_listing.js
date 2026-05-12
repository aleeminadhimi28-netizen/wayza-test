import { connectDB, getDB } from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  await connectDB();
  const db = getDB();
  const r = await db.collection('listings').deleteOne({ title: '5', price: 0 });
  console.log('Fixed Title 5:', r);
  process.exit(0);
})();
