import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SCHEMA, validateAndFill } from '../engine/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');

console.log('=== AUTOFIX: Scanning /data ===\n');
let fixed = 0, errors = 0;

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkDir(fullPath);
      return;
    }
    
    if (!file.endsWith('.json')) return;
    
    const folder = path.basename(path.dirname(fullPath));
    const type = folder.slice(0, -1).charAt(0).toUpperCase() + folder.slice(1, -1); // mobs -> Mob
    
    if (!SCHEMA[type]) return;
    
    try {
      const raw = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      const old = JSON.stringify(raw);
      
      // Auto tambah id dari filename kalau gak ada
      if (!raw.id) raw.id = path.basename(file, '.json');
      
      // Validate + fill defaults dari schema.js
      const fixedData = validateAndFill(type, raw);
      
      const newStr = JSON.stringify(fixedData, null, 2);
      if (old!== newStr) {
        fs.writeFileSync(fullPath, newStr);
        console.log(`[FIXED] ${type} ${raw.id} → ${fullPath}`);
        fixed++;
      }
    } catch (e) {
      console.log(`[ERROR] ${fullPath}: ${e.message}`);
      errors++;
    }
  });
}

walkDir(dataDir);
console.log(`\n=== DONE ===`);
console.log(`Fixed: ${fixed} files`);
console.log(`Errors: ${errors} files`);
console.log('\nRun: npm start');
