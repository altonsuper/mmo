import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from 'canvas';
import { detectMeta } from '../engine/db_by_colour.js';
import { validateAndFill } from '../engine/schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mapId = process.argv[2];
const assetFolder = process.argv[3] || 'mobs'; // mobs, props, items

if (!mapId) {
  console.log('Usage: node tools/designer.js <mapId> [mobs|props|items]');
  console.log('Example: node tools/designer.js world_01 mobs');
  process.exit(1);
}

const mapPath = path.join(__dirname, `../data/maps/${mapId}.json`);
const assetDir = path.join(__dirname, `../client/assets/${assetFolder}`);
const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

console.log(`=== SMART DESIGNER: ${mapId} / ${assetFolder} ===\n`);

// RULES: Detect dari nama file
const ANIM_RULES = {
  walk: { action: 'walk', frameW: 64, frameH: 64, loop: true },
  run: { action: 'walk', frameW: 64, frameH: 64, loop: true },
  idle: { action: 'static', frameW: 64, frameH: 64, loop: true },
  attack: { action: 'attack', frameW: 64, frameH: 64, loop: false },
  melee: { action: 'attack', frameW: 64, frameH: 64, loop: false, type: 'melee' },
  range: { action: 'attack', frameW: 64, frameH: 64, loop: false, type: 'range' },
  shoot: { action: 'attack', frameW: 64, frameH: 64, loop: false, type: 'range' },
  die: { action: 'die', frameW: 64, frameH: 64, loop: false },
  dead: { action: 'die', frameW: 64, frameH: 64, loop: false },
  hit: { action: 'hit', frameW: 64, frameH: 64, loop: false }
};

const usedTiles = new Set();
mapData.objects?.forEach(o => {
  if (o.x!== undefined) usedTiles.add(`${o.x},${o.y}`);
});

const holes = [];
for (let y = 0; y < mapData.height; y++) {
  for (let x = 0; x < mapData.width; x++) {
    if (!usedTiles.has(`${x},${y}`)) holes.push({x, y});
  }
}

// 1. Scan asset + auto split kalau sprite sheet
const assetFiles = fs.readdirSync(assetDir).filter(f => 
  /\.(png|jpg|svg)$/i.test(f) &&!/_[0-9]+\.png$/.test(f) // skip yg udah frame
);

let totalPlaced = 0;
const animManifest = {}; // buat rules.json

for (const file of assetFiles) {
  const fullPath = path.join(assetDir, file);
  const baseName = path.basename(file, path.extname(file)); // slime_walk_melee
  const parts = baseName.split('_'); // [slime, walk, melee]
  
  const entityId = parts[0]; // slime
  const actionKeys = parts.slice(1); // [walk, melee]
  
  // 2. Cek apakah ini sprite sheet yg perlu di-split
  let isSheet = false;
  let rule = null;
  
  for (const key of actionKeys) {
    if (ANIM_RULES[key]) {
      rule = ANIM_RULES[key];
      isSheet = true;
      break;
    }
  }
  
  if (isSheet) {
    // SPLIT SPRITE SHEET
    const img = await loadImage(fullPath);
    const cols = Math.floor(img.width / rule.frameW);
    const rows = Math.floor(img.height / rule.frameH);
    const totalFrames = cols * rows;
    
    console.log(`[SPLIT] ${file} -> ${totalFrames} frames [${rule.action}]`);
    
    for (let i = 0; i < totalFrames; i++) {
      const x = (i % cols) * rule.frameW;
      const y = Math.floor(i / cols) * rule.frameH;
      const canvas = createCanvas(rule.frameW, rule.frameH);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, x, y, rule.frameW, rule.frameH, 0, 0, rule.frameW, rule.frameH);
      
      const frameName = `${entityId}_${rule.action}_${i}.png`;
      fs.writeFileSync(path.join(assetDir, frameName), canvas.toBuffer('image/png'));
    }
    
    // Simpan ke manifest buat client
    if (!animManifest[entityId]) animManifest[entityId] = {};
    animManifest[entityId][rule.action] = {
      frames: totalFrames,
      loop: rule.loop,
      atkType: rule.type || 'melee' // melee atau range
    };
    
    // Hapus sheet asli biar gak dobel
    fs.unlinkSync(fullPath);
    continue; // lanjut file berikutnya, jangan spawn
  }
  
  // 3. Kalau bukan sheet, berarti static asset -> spawn ke map
  if (holes.length === 0) {
    console.log(`[SKIP] ${file}: Map full`);
    continue;
  }
  
  const holeIdx = Math.floor(Math.random() * holes.length);
  const {x, y} = holes.splice(holeIdx, 1)[0];
  
  const meta = detectMeta(entityId, null);
  const objData = {
    id: `${entityId}_${x}_${y}`,
    x, y,
    sprite: `${assetFolder}/${file}`,
    color: meta.color
  };
  
  try {
    const validObj = validateAndFill(meta.type, objData);
    mapData.objects.push(validObj);
    console.log(`[PLACE] ${validObj.type} ${validObj.id} at ${x},${y}`);
    totalPlaced++;
  } catch (e) {
    console.log(`[ERR] ${entityId}: ${e.message}`);
  }
}

// 4. Save map + manifest
fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2));

// Save rules buat AI/Client
const manifestPath = path.join(__dirname, `../client/assets/${assetFolder}/_manifest.json`);
fs.writeFileSync(manifestPath, JSON.stringify(animManifest, null, 2));

console.log(`\n=== DONE ===`);
console.log(`Placed: ${totalPlaced} static assets`);
console.log(`Generated manifest: ${manifestPath}`);
console.log(`Rules:`, animManifest);
console.log(`\nNext: npm start -> anim auto jalan sesuai nama file`);
