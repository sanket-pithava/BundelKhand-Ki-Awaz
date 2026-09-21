import dns from 'node:dns';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { MongoClient } from 'mongodb';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://laxsavani:laxsavani@cluster0.ykxfhke.mongodb.net/bundelkhand_news?retryWrites=true&w=majority';
const DB_NAME = 'bundelkhand_news';

function hashPassword(password, salt) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const h = crypto.pbkdf2Sync(password, s, 10000, 64, 'sha512').toString('hex');
  return { hash: h, salt: s };
}

async function setup() {
  console.log('Connecting to MongoDB Atlas...');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  // 1. First import all backup profiles if not present
  if (fs.existsSync('backup_data/profiles.json')) {
    const rawProfiles = JSON.parse(fs.readFileSync('backup_data/profiles.json', 'utf8'));
    console.log(`Found ${rawProfiles.length} backup profiles. Syncing to 'profiles' collection...`);
    for (const p of rawProfiles) {
      await db.collection('profiles').updateOne(
        { id: p.id },
        {
          $set: {
            id: p.id,
            email: p.email.toLowerCase(),
            display_name: p.display_name || p.email.split('@')[0],
            created_at: p.created_at,
          }
        },
        { upsert: true }
      );
    }
  }

  // 2. Set up initial admin passwords in profiles
  const initialAdmins = [
    { email: 'sanket@gmail.com', name: 'Sanket Pithava', password: 'password', role: 'admin' },
    { email: 'admin@harbole.com', name: 'Super Admin', password: 'admin', role: 'admin' },
  ];

  for (const adm of initialAdmins) {
    const { hash, salt } = hashPassword(adm.password);
    const existing = await db.collection('profiles').findOne({ email: adm.email });
    const userId = existing?.id || crypto.randomUUID();

    await db.collection('profiles').updateOne(
      { email: adm.email },
      {
        $set: {
          id: userId,
          email: adm.email,
          display_name: adm.name,
          role: adm.role,
          password_hash: hash,
          salt: salt,
          status: true,
          updated_at: new Date().toISOString(),
        },
        $setOnInsert: {
          created_at: new Date().toISOString(),
        }
      },
      { upsert: true }
    );

    // Sync user_roles
    await db.collection('user_roles').updateOne(
      { user_id: userId },
      {
        $set: {
          id: crypto.randomUUID(),
          user_id: userId,
          role: adm.role,
          created_at: new Date().toISOString(),
        }
      },
      { upsert: true }
    );

    console.log(`✅ Admin configured: ${adm.email} (Password: "${adm.password}")`);
  }

  // Also sync roles from user_roles into profiles so all users have their role attached
  const allRoles = await db.collection('user_roles').find({}).toArray();
  for (const r of allRoles) {
    if (r.user_id && r.role) {
      await db.collection('profiles').updateOne(
        { id: r.user_id },
        { $set: { role: r.role } }
      );
    }
  }

  console.log('🎉 Setup complete! Admin accounts successfully configured in profiles collection.');
  await client.close();
}

setup().catch((err) => {
  console.error('❌ Setup error:', err);
  process.exit(1);
});
