import fs from 'fs';
import { SCHEMA } from '../engine/schema.js';

const BALANCE_TABLE = {
  easy: { hp: 30, atk: 3, def: 0, exp: 10 },
  normal: { hp: 100, atk: 10, def: 2, exp: 25 },
  hard: { hp: 300, atk: 25, def: 8, exp: 100 },
  boss: { hp: 1000, atk: 60, def: 20, exp: 500, isBoss: true }
};

const dir = './data/mobs';
fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.json')) return;
  const p = `${dir}/${file}`;
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!data.tier ||!BALANCE_TABLE[data.tier]) return;
  
  const stats = BALANCE_TABLE[data.tier];
  Object.assign(data, stats);
  
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
  console.log(`[BALANCE] ${data.id} → ${data.tier} HP:${data.hp} ATK:${data.atk}`);
});
console.log('Done. All mobs balanced.');
