import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Schema } from '../engine/schema.js';
import '../engine/schema.js'; // biar Schema.define ke-load

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../data');
const folders = {
  mobs: 'Mob',
  items: 'Item',
  souls: 'Soul',
  recipes: 'Recipe',
  maps: 'Map'
};

console.log('=== MindbloxCore Asset Detector ===\n');

let totalFiles = 0;
let totalErrors = 0;
const report = {};

for (const [folder, schemaType] of Object.entries(folders)) {
  const dir = path.join(dataDir, folder);
  if (!fs.existsSync(dir)) continue;

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  report[schemaType] = [];

  for (const file of files) {
    totalFiles++;
    const filePath = path.join(dir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const errors = [];

    // Cek field required dari Schema
    const rules = Schema.types?.[schemaType] || {};
    for (const [key, rule] of Object.entries(rules)) {
      if (rule.required && data[key] == null) {
        errors.push(`Missing required field: "${key}"`);
      }
    }

    // Cek field yang disaranin tapi belum wajib
    const suggested = ['icon', 'model', 'sound', 'particle', 'desc'];
    for (const key of suggested) {
      if (data[key] == null) {
        errors.push(`Missing suggested field: "${key}"`);
      }
    }

    if (errors.length > 0) {
      totalErrors++;
      report[schemaType].push({ file, id: data.id || 'no-id', errors });
    }
  }
}

// Print report
for (const [type, items] of Object.entries(report)) {
  if (items.length === 0) continue;
  console.log(`[${type}] ${items.length} files need attention:`);
  for (const item of items) {
    console.log(` - ${item.file} | id: ${item.id}`);
    item.errors.forEach(e => console.log(` * ${e}`));
  }
  console.log('');
}

console.log(`=== Summary: ${totalErrors}/${totalFiles} files need assets ===`);
if (totalErrors === 0) console.log('All good. No missing assets!');
else console.log('Tip: Add missing fields to your.json files, then run "npm run detect" again.');
