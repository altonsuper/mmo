import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../data');
const outDir = path.join(__dirname, '../build');
const folders = ['mobs', 'items', 'souls', 'recipes', 'maps'];

console.log('Combining all JSON from /data/...');
const db = { _meta: { generated: new Date().toISOString(), total: 0 } };

for (const type of folders) {
  const dir = path.join(dataDir, type);
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  db[type] = [];
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    db[type].push(data);
    db._meta.total++;
  }
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
const outPath = path.join(outDir, 'database.json');
fs.writeFileSync(outPath, JSON.stringify(db, null, 2));
console.log(`Done. ${db._meta.total} items combined -> ${outPath}`);
