import dotenv from "dotenv";
import { connectDB } from "../config/db.js";

dotenv.config();

async function main() {
  const db = await connectDB();
  const listings = await db.collection("listings").find({ category: { $in: ["bike", "car", "activity"] } }).toArray();
  console.log("LISTINGS COUNT:", listings.length);
  listings.slice(0, 5).forEach(l => {
    console.log(`ID: ${l._id}, title: ${l.title}, price: ${l.price}, variants:`, JSON.stringify(l.variants, null, 2));
  });
  process.exit(0);
}

main().catch(console.error);
