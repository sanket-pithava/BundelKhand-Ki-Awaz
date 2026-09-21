import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb+srv://laxsavani:laxsavani@cluster0.ykxfhke.mongodb.net/bundelkhand_news?retryWrites=true&w=majority');
await client.connect();
const db = client.db('bundelkhand_news');

const sections = await db.collection('homepage_sections').find({ status: true }).toArray();
const categories = await db.collection('categories').find({}).toArray();
const catMap = new Map(categories.map(c => [c.id, c.name]));

console.log('--- Active Homepage Sections ---');
for (const s of sections) {
  const arts = await db.collection('articles').find({
    status: 'published',
    $or: [
      { category_id: s.category_id },
      { category: catMap.get(s.category_id) }
    ]
  }).limit(s.article_limit || 5).toArray();

  console.log({
    title_hindi: s.title_hindi,
    title_english: s.title_english,
    category: catMap.get(s.category_id),
    articlesCount: arts.length,
    sampleArticle: arts[0]?.title
  });
}
await client.close();
