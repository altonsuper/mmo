import fs from 'fs';
import { execSync } from 'child_process';

const TEMPLATES = {
  goblin_camp: {
    size: [24, 24],
    mobs: [
      {id: 'goblin_easy', color: '#66ff66', count: 5},
      {id: 'goblin_shaman', color: '#22cc22', count: 1},
      {id: 'goblin_king', color: '#00ff00', count: 1}
    ],
    items: [
      {id: 'hp_potion', color: '#ff4444', count: 3},
      {id: 'gold_coin', color: '#ffff44', count: 10}
    ],
    warps: { exit: 'world_01' }
  },
  slime_forest: {
    size: [32, 32],
    mobs: [
      {id: 'slime_jr', color: '#66ff66', count: 8},
      {id: 'slime_king', color: '#00ff00', count: 1}
    ],
    items: [],
    warps: { exit: 'world_01' }
  }
};

const name = process.argv[2];
const tpl = TEMPLATES[name];
if (!tpl) {
  console.log('Available:', Object.keys(TEMPLATES).join(', '));
  process.exit(1);
}

// 1. Generate base map pake mapgen
console.log(`[TEMPLATE] Generating ${name}...`);
execSync(`node tools/mapgen.js ${name} ${tpl.size[0]} ${tpl.size[1]}`, {stdio: 'inherit'});

// 2. Batch create mob + item pake color rules
const batch = [];
tpl.mobs.forEach(m => {
  for (let i = 0; i < m.count; i++) {
    batch.push({id: `${m.id}_${i}`, color: m.color});
  }
});
tpl.items.forEach(it => {
  for (let i = 0; i < it.count; i++) {
    batch.push({id: `${it.id}_${i}`, color: it.color});
  }
});

fs.writeFileSync(`./temp_batch.json`, JSON.stringify(batch));
console.log(`[TEMPLATE] Batch: ${batch.length} entities`);
console.log(`[TEMPLATE] Done. Run: /gm batch_create`);
console.log(`[TEMPLATE] Then paste content of temp_batch.json`);
