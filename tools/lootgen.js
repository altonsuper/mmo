import fs from 'fs';

const LOOT_RULES = {
  '#66ff66': ['hp_potion'], // easy drop potion
  '#44ff44': ['hp_potion', 'gold_coin'], // normal
  '#22cc22': ['hp_potion', 'gold_coin', 'sword_01'], // hard
  '#00ff00': ['boss_chest', 'gold_coin', 'soul_water'] // boss
};

const dir = './data/mobs';
fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.json')) return;
  const p = `${dir}/${file}`;
  const mob = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!mob.color ||!LOOT_RULES[mob.color]) return;
  
  mob.drops = LOOT_RULES[mob.color].map(id => ({id, rate: 0.5}));
  fs.writeFileSync(p, JSON.stringify(mob, null, 2));
  console.log(`[LOOT] ${mob.id} drops: ${mob.drops.map(d=>d.id).join(', ')}`);
});
