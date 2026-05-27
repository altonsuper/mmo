import fs from 'fs';
import { execSync } from 'child_process';

const mapId = process.argv[2];
if (!mapId) {
  console.log('Usage: npm run export dungeon_01');
  process.exit(1);
}

const files = [
  `data/maps/${mapId}.json`,
 ...fs.readdirSync('data/mobs').filter(f=>f.includes(mapId)).map(f=>`data/mobs/${f}`),
 ...fs.readdirSync('data/items').filter(f=>f.includes(mapId)).map(f=>`data/items/${f}`)
].filter(f => fs.existsSync(f));

const zipName = `${mapId}.zip`;
execSync(`tar -a -c -f ${zipName} ${files.join(' ')}`);
console.log(`[EXPORT] ${zipName} created with ${files.length} files`);
