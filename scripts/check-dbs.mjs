import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb+srv://laxsavani:laxsavani@cluster0.ykxfhke.mongodb.net/?retryWrites=true&w=majority');
await client.connect();
const adminDb = client.db().admin();
const dbs = await adminDb.listDatabases();
console.log('Databases in cluster:');
for (const d of dbs.databases) {
  const cols = await client.db(d.name).listCollections().toArray();
  console.log(d.name + ': ' + cols.length + ' collections');
}
await client.close();
