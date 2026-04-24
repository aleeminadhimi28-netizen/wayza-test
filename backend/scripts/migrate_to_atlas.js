import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

// CONFIGURATION
const LOCAL_URL = "mongodb://localhost:27017";
const LOCAL_DB_NAME = "wayzza"; // Change this if your local DB name is different
const ATLAS_URL = process.env.MONGO_URL;

if (!ATLAS_URL) {
    console.error("Atlas MONGO_URL not found in .env");
    process.exit(1);
}

async function migrate() {
    const localClient = new MongoClient(LOCAL_URL);
    const atlasClient = new MongoClient(ATLAS_URL);

    try {
        console.log("Connecting to local MongoDB...");
        await localClient.connect();
        console.log("Connecting to Atlas MongoDB...");
        await atlasClient.connect();

        const localDb = localClient.db(LOCAL_DB_NAME);
        const atlasDb = atlasClient.db(); // Atlas URL usually specifies the DB name

        const collections = await localDb.listCollections().toArray();
        console.log(`Found ${collections.length} collections locally.`);

        for (const colDef of collections) {
            const colName = colDef.name;
            console.log(`Migrating collection: ${colName}...`);

            const localCol = localDb.collection(colName);
            const atlasCol = atlasDb.collection(colName);

            const documents = await localCol.find({}).toArray();

            if (documents.length > 0) {
                // Clear Atlas collection first to avoid duplicates if re-running
                // await atlasCol.deleteMany({});

                const result = await atlasCol.insertMany(documents);
                console.log(`  - Inserted ${result.insertedCount} documents into ${colName}`);
            } else {
                console.log(`  - Collection ${colName} is empty. Skipping.`);
            }
        }

        console.log("\nMigration complete! All local data is now on Atlas.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await localClient.close();
        await atlasClient.close();
    }
}

migrate();
