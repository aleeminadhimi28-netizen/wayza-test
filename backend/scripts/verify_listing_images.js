import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const url = process.env.MONGO_URL;
if (!url) {
  console.error("MONGO_URL not configured");
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error("Please provide partner email as first argument");
  process.exit(1);
}

const client = new MongoClient(url);

async function run() {
  try {
    await client.connect();
    const db = client.db();
    const listing = await db.collection('listings').findOne({ ownerEmail: email });
    if (!listing) {
      console.error(`No listing found for ownerEmail: ${email}`);
      process.exit(1);
    }

    console.log(JSON.stringify({
      ok: true,
      title: listing.title,
      image: listing.image,
      images: listing.images,
    }));
    
    // Validate image fields
    if (!listing.image || !listing.image.includes('res.cloudinary.com')) {
      console.error("Image field is not a Cloudinary URL:", listing.image);
      process.exit(1);
    }
    if (!Array.isArray(listing.images) || listing.images.length === 0 || !listing.images[0].includes('res.cloudinary.com')) {
      console.error("Images field is not a valid array of Cloudinary URLs:", listing.images);
      process.exit(1);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error executing script:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();
