import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { MongoClient } from 'mongodb';

// ==========================================
// CONFIGURATION: Set your new Supabase details here or in .env
// ==========================================
const NEW_SUPABASE_URL = process.env.NEW_SUPABASE_URL || 'https://YOUR_NEW_PROJECT_ID.supabase.co';
const NEW_SUPABASE_KEY = process.env.NEW_SUPABASE_KEY || 'YOUR_NEW_SUPABASE_SERVICE_ROLE_OR_ANON_KEY';
const BUCKET_NAME = 'media';

const OLD_SUPABASE_URL = 'https://iawattknncbxkqzrfzte.supabase.co';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://laxsavani:laxsavani@ac-xjo4akj-shard-00-00.ykxfhke.mongodb.net:27017,ac-xjo4akj-shard-00-01.ykxfhke.mongodb.net:27017,ac-xjo4akj-shard-00-02.ykxfhke.mongodb.net:27017/bundelkhand_news?ssl=true&replicaSet=atlas-wfb2lh-shard-0&authSource=admin&retryWrites=true&w=majority';
const DB_NAME = 'bundelkhand_news';

const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_KEY);

// Helper: Recursively get all files from a local directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
}

// 1. Upload local images folder to Supabase Storage
async function uploadLocalImagesToSupabase(localDir = 'media') {
  const resolvedDir = path.resolve(process.cwd(), localDir);
  console.log(`\n📤 Scanning folder [${resolvedDir}] for images...`);
  
  if (!fs.existsSync(resolvedDir)) {
    console.error(`❌ Folder not found: ${resolvedDir}`);
    console.log(`💡 Please place your images inside a folder named "${localDir}" in project root.`);
    return;
  }

  const allFiles = getAllFiles(resolvedDir);
  console.log(`Found ${allFiles.length} files to upload.`);

  let successCount = 0;
  let failCount = 0;

  for (const filePath of allFiles) {
    // Determine the path inside Supabase bucket
    const relativePath = path.relative(resolvedDir, filePath).replace(/\\/g, '/');
    const fileBuffer = fs.readFileSync(filePath);
    
    // Determine content-type
    const ext = path.extname(filePath).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    console.log(`Uploading: ${relativePath}...`);
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(relativePath, fileBuffer, {
      contentType,
      upsert: true,
    });

    if (error) {
      console.error(`❌ Failed: ${relativePath} ->`, error.message);
      failCount++;
    } else {
      successCount++;
    }
  }

  console.log(`\n🎉 Upload Complete! Success: ${successCount}, Failed: ${failCount}`);
}

// 2. Update MongoDB URLs to point to New Supabase
async function updateMongoUrls() {
  if (NEW_SUPABASE_URL.includes('YOUR_NEW_PROJECT_ID')) {
    console.error('❌ Please set NEW_SUPABASE_URL in the script or .env first!');
    return;
  }

  console.log(`\n🔄 Updating MongoDB URLs:`);
  console.log(`  From: ${OLD_SUPABASE_URL}`);
  console.log(`  To:   ${NEW_SUPABASE_URL}`);

  const mongo = new MongoClient(MONGODB_URI);
  await mongo.connect();
  const db = mongo.db(DB_NAME);

  const collections = [
    { name: 'articles', fields: ['image_url', 'mobile_image_url'] },
    { name: 'districts', fields: ['image_url'] },
    { name: 'ads', fields: ['image_url', 'mobile_image_url'] },
    { name: 'shakhsiyat', fields: ['image_url'] },
    { name: 'show_episodes', fields: ['thumbnail_url'] },
    { name: 'reels', fields: ['thumbnail_url'] },
  ];

  for (const col of collections) {
    for (const field of col.fields) {
      const result = await db.collection(col.name).updateMany(
        { [field]: { $regex: OLD_SUPABASE_URL } },
        [
          {
            $set: {
              [field]: {
                $replaceOne: {
                  input: `$${field}`,
                  find: OLD_SUPABASE_URL,
                  replacement: NEW_SUPABASE_URL,
                },
              },
            },
          },
        ]
      );
      console.log(`✅ [${col.name}.${field}]: Modified ${result.modifiedCount} records.`);
    }
  }

  await mongo.close();
  console.log('🎉 MongoDB URLs successfully updated!');
}

// CLI Execution
async function main() {
  const command = process.argv[2];

  if (command === 'upload') {
    const folder = process.argv[3] || 'media';
    await uploadLocalImagesToSupabase(folder);
  } else if (command === 'update-urls') {
    await updateMongoUrls();
  } else if (command === 'all') {
    const folder = process.argv[3] || 'media';
    await uploadLocalImagesToSupabase(folder);
    await updateMongoUrls();
  } else {
    console.log(`
Usage:
  1. Upload local images to new Supabase bucket:
     node scripts/migrate-images.mjs upload <folder_path>

  2. Update MongoDB database URLs to new Supabase URL:
     node scripts/migrate-images.mjs update-urls

  3. Do both (Upload + Update URLs):
     node scripts/migrate-images.mjs all <folder_path>
    `);
  }
}

main().catch(console.error);
