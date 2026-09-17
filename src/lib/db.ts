import dns from 'dns';
import { MongoClient, Db } from 'mongodb';

// Ensure DNS resolution for MongoDB Atlas SRV connection strings
if (typeof dns.setServers === 'function') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch (e) {
    // Ignore if not permitted
  }
}

const uri =
  process.env.MONGODB_URI ||
  'mongodb+srv://laxsavani:laxsavani@cluster0.ykxfhke.mongodb.net/bundelkhand_news?retryWrites=true&w=majority';
const dbName = 'bundelkhand_news';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 20,
      minPoolSize: 2,
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri, {
    maxPoolSize: 20,
    minPoolSize: 2,
  });
  clientPromise = client.connect();
}

export async function getMongoDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}
