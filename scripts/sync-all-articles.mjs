import fs from 'node:fs';
import dns from 'node:dns';
import { MongoClient } from 'mongodb';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://laxsavani:laxsavani@cluster0.ykxfhke.mongodb.net/bundelkhand_news?retryWrites=true&w=majority';
const DB_NAME = 'bundelkhand_news';

async function syncArticles() {
  console.log('Connecting to MongoDB Atlas...');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  const raw = fs.readFileSync('backup_data/articles.json', 'utf8');
  const articles = JSON.parse(raw);
  console.log(`Found ${articles.length} articles in backup_data/articles.json.`);

  const collection = db.collection('articles');
  
  // Upsert each article preserving id and publishing status
  const batchSize = 250;
  let inserted = 0;
  let updated = 0;

  for (let i = 0; i < articles.length; i += batchSize) {
    const chunk = articles.slice(i, i + batchSize);
    const operations = chunk.map((a) => {
      const docId = a.id || a._id;
      const { _id, ...rest } = a;
      return {
        updateOne: {
          filter: { id: docId },
          update: {
            $set: {
              ...rest,
              id: docId,
              _id: docId,
            }
          },
          upsert: true,
        }
      };
    });

    const res = await collection.bulkWrite(operations, { ordered: false });
    inserted += res.upsertedCount;
    updated += res.modifiedCount;
    console.log(`Processed ${Math.min(i + batchSize, articles.length)}/${articles.length} articles...`);
  }

  const finalCount = await collection.countDocuments();
  const publishedCount = await collection.countDocuments({ status: 'published' });
  console.log(`✅ Articles sync complete!`);
  console.log(`📊 Total articles in MongoDB: ${finalCount}`);
  console.log(`🟢 Published articles: ${publishedCount}`);

  await client.close();
}

syncArticles().catch((err) => {
  console.error('❌ Error syncing articles:', err);
  process.exit(1);
});
