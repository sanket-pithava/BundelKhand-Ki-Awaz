import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://iawattknncbxkqzrfzte.supabase.co';
const SUPABASE_KEY = 'sb_publishable_RcOYTFEtWd-gPSzVB8i1rA_MUwqnq-8';

const BACKUP_DIR = path.resolve(process.cwd(), 'backup_data');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const TABLES = [
  'articles',
  'categories',
  'districts',
  'sub_districts',
  'ads',
  'reels',
  'show_episodes',
  'shakhsiyat',
  'ticker_items',
  'impact_items',
  'homepage_sections',
  'homepage_hero',
  'homepage_breaking',
  'homepage_top10',
  'reporters',
  'profiles',
  'user_roles',
  'district_categories'
];

async function fetchTableInBatches(tableName) {
  const batchSize = 500;
  let offset = 0;
  let allRows = [];
  let hasMore = true;

  console.log(`\n📦 Backing up [${tableName}]...`);

  while (hasMore) {
    const url = `${SUPABASE_URL}/rest/v1/${tableName}?select=*&limit=${batchSize}&offset=${offset}`;
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Range-Unit': 'items',
        'Prefer': 'count=exact'
      }
    });

    if (!response.ok) {
      console.error(`❌ Error fetching ${tableName}: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text);
      break;
    }

    const rows = await response.json();
    allRows = allRows.concat(rows);
    console.log(`   Fetched ${rows.length} rows (Total so far: ${allRows.length})`);

    if (rows.length < batchSize) {
      hasMore = false;
    } else {
      offset += batchSize;
    }
  }

  const filePath = path.join(BACKUP_DIR, `${tableName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(allRows, null, 2), 'utf8');
  console.log(`✅ Saved ${allRows.length} records of [${tableName}] to ${filePath}`);
  return { table: tableName, count: allRows.length };
}

async function runBackup() {
  console.log(`=============================================`);
  console.log(`🚀 Starting Zero-Data-Loss Supabase Backup...`);
  console.log(`📂 Output Directory: ${BACKUP_DIR}`);
  console.log(`=============================================`);

  const summary = [];
  for (const table of TABLES) {
    try {
      const res = await fetchTableInBatches(table);
      summary.push(res);
    } catch (err) {
      console.error(`❌ Failed to backup ${table}:`, err);
      summary.push({ table, count: 0, error: err.message });
    }
  }

  const summaryFile = path.join(BACKUP_DIR, `_backup_summary.json`);
  fs.writeFileSync(summaryFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    tables: summary
  }, null, 2), 'utf8');

  console.log(`\n=============================================`);
  console.log(`🎉 BACKUP COMPLETE! Summary:`);
  console.table(summary);
  console.log(`=============================================`);
}

runBackup();
