import { createRequire } from 'node:module';
if (typeof (globalThis as any).require === 'undefined') {
  try {
    (globalThis as any).require = createRequire(import.meta.url);
  } catch (e) {
    // Ignore in non-Node environments
  }
}

import { MongoClient, Db } from 'mongodb';

const DIRECT_URI =
  'mongodb://laxsavani:laxsavani@ac-xjo4akj-shard-00-00.ykxfhke.mongodb.net:27017,ac-xjo4akj-shard-00-01.ykxfhke.mongodb.net:27017,ac-xjo4akj-shard-00-02.ykxfhke.mongodb.net:27017/bundelkhand_news?ssl=true&replicaSet=atlas-wfb2lh-shard-0&authSource=admin&retryWrites=true&w=majority';

const uri = process.env.MONGODB_URI || DIRECT_URI;
const dbName = 'bundelkhand_news';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

function createClient(): Promise<MongoClient> {
  const client = new MongoClient(uri, {
    maxPoolSize: 20,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 15000,
  });
  return client.connect().catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  });
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClient();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = createClient();
}

export async function getMongoDb(): Promise<Db> {
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (err) {
    console.error('❌ getMongoDb failed to connect:', err);
    throw err;
  }
}

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}
