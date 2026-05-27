import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SCHEMA } from '../engine/schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../data');

const QUEST_ID = process.argv[2] || 'quest_kill_slime';
const TARGET_MAP = process.argv[3]; // optional: paksa map tertentu

console.log(`=== QUESTGEN: ${QUEST_ID} ===\n`);

// 1. Scan semua map buat cari yg ada mob
const maps = fs.readdirSync(path.join(dataDir, 'maps'))
 .filter(f => f.endsWith('.json'))
 .map(f => JSON.parse(fs.readFileSync(path.join(dataDir, 'maps', f), 'utf8')));

// 2. Scan semua mob buat tau nama + tier
const mobs = {};
fs.readdirSync(path.join(dataDir, 'mobs')).forEach(f => {
  if (!f.endsWith('.json')) return;
  const mob = JSON.parse(fs.readFileSync(path.join(dataDir, 'mobs', f), 'utf8'));
  mobs[mob.id] = mob;
});

// 3. Cari map yg ada slime. Prioritas: dungeon > world
let targetMap = null;
let targetMob = null;

if (TARGET_MAP) {
  targetMap = maps.find(m => m.id === TARGET_MAP);
} else {
  // Auto detect: cari map yg ada Mob + keyword slime
  for (const map of maps) {
    const hasMob = map.objects?.some(o => o.type === 'Mob' && o.id.includes('slime'));
    if (hasMob) {
      targetMap = map;
      targetMob = map.objects.find(o => o.type === 'Mob' && o.id.includes('slime'));
      break;
    }
  }
}

if (!targetMap) {
  console.error('[QUESTGEN] ERROR: Gak ada map yg isinya slime. Jalanin mapgen dulu.');
  process.exit(1);
}

if (!targetMob) {
  targetMob = {id: 'slime_easy', name: 'Slime', tier: 'easy'}; // fallback
}

// 4. Cari warper di world_01 yg ke targetMap
const world = maps.find(m => m.id === 'world_01');
const warper = world?.objects?.find(o => 
  o.type === 'Warper' && o.target?.map === targetMap.id
);

// 5. Generate quest JSON
const quest = {
  id: QUEST_ID,
  name: `Bunuh ${mobs[targetMob.id]?.name || targetMob.id}`,
  color: '#ffff44', // kuning = quest
  type: 'Quest',
  subtype: 'kill',
  target: {
    map: targetMap.id, // MASUK MAP MANA
    mobId: targetMob.id,
    count: 5
  },
  reward: {
    exp: 100,
    gold: 50,
    items: [{id: 'hp_potion', count: 2}]
  },
  text: {
    start: `Masuk ke ${targetMap.name} dan bunuh 5 ${targetMob.name}!`,
    progress: `Bunuh ${targetMob.name}: $COUNT/5`,
    complete: `Bagus! Ini hadiahmu.`
  },
  npc: 'npc_quest_giver', // kasih quest dari NPC ini
  warperId: warper?.id || null // kalau mau auto track warper mana yg ke map ini
};

// 6. Save ke data/quests/
const outPath = path.join(dataDir, 'quests', `${QUEST_ID}.json`);
fs.mkdirSync(path.dirname(outPath), {recursive: true});
fs.writeFileSync(outPath, JSON.stringify(quest, null, 2));

console.log(`[QUESTGEN] Quest: ${quest.name}`);
console.log(`[QUESTGEN] Target Map: ${quest.target.map} -> ${targetMap.name}`);
console.log(`[QUESTGEN] Target Mob: ${quest.target.mobId} x${quest.target.count}`);
if (warper) console.log(`[QUESTGEN] Warper: ${warper.id} di world_01`);
console.log(`[QUESTGEN] Saved: ${outPath}`);
console.log('\nTest: /gm spawn Quest quest_kill_slime 100 100');
