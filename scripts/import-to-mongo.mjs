import fs from 'fs';
import path from 'path';
import dns from 'dns';
import { MongoClient } from 'mongodb';

// Set public DNS for reliable SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGODB_URI = 'mongodb+srv://laxsavani:laxsavani@cluster0.ykxfhke.mongodb.net/bundelkhand_news?retryWrites=true&w=majority';
const DB_NAME = 'bundelkhand_news';
const BACKUP_DIR = path.resolve(process.cwd(), 'backup_data');

const COLLECTIONS = [
  'categories',
  'districts',
  'sub_districts',
  'articles',
  'homepage_sections',
  'homepage_hero',
  'homepage_breaking',
  'homepage_top10',
  'ads',
  'reels',
  'show_episodes',
  'shakhsiyat',
  'ticker_items',
  'reporters',
  'profiles',
  'user_roles'
];

async function importAll() {
  console.log(`====================================================`);
  console.log(`🚀 Starting Supabase -> MongoDB Atlas Data Migration`);
  console.log(`📡 Target Database: ${DB_NAME}`);
  console.log(`📂 Source Directory: ${BACKUP_DIR}`);
  console.log(`====================================================\n`);

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log(`✅ Connected successfully to MongoDB Atlas!`);
    const db = client.db(DB_NAME);

    const report = [];

    for (const name of COLLECTIONS) {
      const filePath = path.join(BACKUP_DIR, `${name}.json`);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${filePath}, skipping...`);
        continue;
      }

      const raw = fs.readFileSync(filePath, 'utf8');
      const items = JSON.parse(raw);

      if (!Array.isArray(items) || items.length === 0) {
        console.log(`ℹ️ [${name}] has 0 records, skipping.`);
        report.push({ collection: name, sourceCount: 0, mongoCount: 0, status: 'EMPTY' });
        continue;
      }

      const collection = db.collection(name);

      // Clean existing collection to ensure idempotent clean import
      await collection.deleteMany({});

      // Map rows: ensure _id is string uuid from id
      const docs = items.map((item) => {
        const doc = { ...item };
        if (doc.id && !doc._id) {
          doc._id = doc.id;
        }
        return doc;
      });

      // Insert in batches of 500
      const batchSize = 500;
      let insertedCount = 0;
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = docs.slice(i, i + batchSize);
        const res = await collection.insertMany(batch, { ordered: false });
        insertedCount += res.insertedCount;
      }

      const currentCount = await collection.countDocuments();
      console.log(`✅ [${name}]: Migrated ${currentCount} documents (Source: ${items.length})`);
      report.push({
        collection: name,
        sourceCount: items.length,
        mongoCount: currentCount,
        status: items.length === currentCount ? 'MATCH 100%' : 'COUNT MISMATCH'
      });
    }

    console.log(`\n⚙️ Creating Performance Indexes in MongoDB...`);
    // Articles indexes
    const articlesCol = db.collection('articles');
    await articlesCol.createIndex({ slug: 1 }, { unique: true, sparse: true });
    await articlesCol.createIndex({ category_id: 1 });
    await articlesCol.createIndex({ district_id: 1 });
    await articlesCol.createIndex({ sub_district_id: 1 });
    await articlesCol.createIndex({ status: 1 });
    await articlesCol.createIndex({ publish_at: -1 });
    await articlesCol.createIndex({ created_at: -1 });

    // Categories indexes
    await db.collection('categories').createIndex({ slug: 1 }, { unique: true, sparse: true });

    // Districts indexes
    await db.collection('districts').createIndex({ slug: 1 }, { unique: true, sparse: true });

    // Sub-districts indexes
    await db.collection('sub_districts').createIndex({ slug: 1 });
    await db.collection('sub_districts').createIndex({ jila_id: 1 });

    console.log(`✅ Indexes created successfully!`);

    console.log(`\n====================================================`);
    console.log(`🎉 MIGRATION VERIFICATION REPORT:`);
    console.table(report);
    console.log(`====================================================`);

  } catch (err) {
    console.error(`❌ Migration Error:`, err);
  } finally {
    await client.close();
    console.log(`🔒 MongoDB connection closed.`);
  }
}

importAll();
