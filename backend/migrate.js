import { MongoClient } from 'mongodb';

const localUri = 'mongodb://localhost:27017';
const atlasUri = 'mongodb+srv://riyarsunny706_db_user:GD7wXA6PuM0O0NgW@cluster0.1lestwk.mongodb.net/';
const dbName = 'your_database_name';

async function migrate() {
    const localClient = new MongoClient(localUri);
    const atlasClient = new MongoClient(atlasUri);

    try {
        await localClient.connect();
        await atlasClient.connect();
        console.log("Connected to both databases...");

        const localDb = localClient.db(dbName);
        const atlasDb = atlasClient.db(dbName);

        // Get all collections from local
        const collections = await localDb.listCollections().toArray();

        for (let col of collections) {
            const name = col.name;
            console.log(`Migrating collection: ${name}`);
            
            const data = await localDb.collection(name).find({}).toArray();
            
            if (data.length > 0) {
                await atlasDb.collection(name).insertMany(data);
                console.log(`Successfully moved ${data.length} documents for ${name}`);
            }
        }
        console.log("Migration complete!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await localClient.close();
        await atlasClient.close();
    }
}

migrate();