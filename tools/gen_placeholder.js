import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { detectMeta, generatePlaceholderSVG } from '../engine/db_by_colour.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetDir = path.join(__dirname, '../client/assets');
const dataDir = path.join(__dirname, '../data');

fs.mkdirSync(assetDir, {recursive: true});

// Scan semua folder di /data
fs.readdirSync(dataDir).forEach(folder => {
  const dir = path.join(dataDir, folder);
  if (!fs.statSync(dir).isDirectory()) return;
  
  fs.readdirSync(dir).filter(f => f.endsWith('.json')).forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    if (data.sprite || data.icon) return;
    
    // Detect meta dari id + color
    const meta = detectMeta(data.id, data.color);
    const svg = generatePlaceholderSVG(meta, data.id);
    
    const outDir = path.join(assetDir, folder);
    fs.mkdirSync(outDir, {recursive: true});
    const outPath = path.join(outDir, `${data.id}.svg`);
    fs.writeFileSync(outPath, svg);
    
    // Update JSON
    data.sprite = `${folder}/${data.id}.svg`;
    data.color = meta.color;
    Object.assign(data, meta);
    delete data.folder;
    fs.writeFileSync(path.join(dir, file), JSON.stringify(data, null, 2));
    console.log(`Generated ${meta.type} ${data.id} → ${meta.color}`);
  });
});
console.log('Done. All assets classified by color.');
