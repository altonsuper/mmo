import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REGISTRY } from '../engine/schema.js';
import '../engine/schema.js'; // load schema

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

console.log('=== ANTINYASAR: CURRENT CONTEXT ===\n');

// 1. Last error dari log
const logPath = path.join(root, 'server.log');
if (fs.existsSync(logPath)) {
  const log = fs.readFileSync(logPath, 'utf8').split('\n').slice(-20);
  const err = log.filter(l => l.includes('Error') || l.includes('ERR'));
  if (err.length) {
    console.log('--- LAST ERRORS ---');
    err.forEach(e => console.log(e));
    console.log('');
  }
}

// 2. Schema aktif
console.log('--- ACTIVE SCHEMA ---');
Object.keys(REGISTRY).forEach(type => {
  const fields = Object.keys(REGISTRY[type].sample || REGISTRY[type]._fields || {});
  console.log(`${type.padEnd(8)}: ${fields.join(', ') || 'no fields'}`);
});

// 3. File core + baris terakhir diubah
console.log('\n--- CORE FILES MTIME ---');
['engine/schema.js','engine/world.js','server.js','client/index.html'].forEach(f => {
  const p = path.join(root, f);
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    const lines = fs.readFileSync(p, 'utf8').split('\n').length;
    console.log(`${f.padEnd(20)}: ${lines} lines, modified ${stat.mtime.toLocaleString()}`);
  }
});

// 4. Entity runtime kalau server jalan
const dumpPath = path.join(root, 'runtime_dump.json');
if (fs.existsSync(dumpPath)) {
  const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));
  console.log(`\n--- RUNTIME: ${dump.length} entities alive ---`);
  dump.slice(0,5).forEach(e => console.log(`${e._id.slice(0,8)} ${e._t}:${e.id} Lv${e.level} HP:${e.hp} @${e.x},${e.y}`));
}

console.log('\n=== RULES FOR AI ===');
console.log('1. Semua field baru wajib ada di schema.js dulu');
console.log('2. GM command = write /data/*.json, bukan runtime doang');
console.log('3. Jangan edit engine/world.js kalau bisa tambah function baru');
console.log('4. Test pake: /gm spawn Mob slime_easy 0 0');
console.log('5. Kalau error, cek server.log dulu\n');

console.log('\n--- GM COMMANDS ---');
console.log('spawn Type id x y');
console.log('create id {json} - auto detect folder by color/keyword');
console.log('batch_create [{id:"",color:""}] - mass create');
console.log('delete Type id');
console.log('kill id|all');
console.log('tp x y | tp id x y');

// 5. Color Classification Rules
console.log('\n--- COLOR → DATABASE RULES ---');
import { COLOR_DB } from '../engine/schema.js';
Object.entries(COLOR_DB).forEach(([color, folder]) => {
  console.log(`${color} → ${folder}`);
});
