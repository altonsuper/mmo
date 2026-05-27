import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SCHEMA } from '../engine/schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Config
const MAP_ID = process.argv[2] || 'dungeon_01';
const WIDTH = parseInt(process.argv[3]) || 32;
const HEIGHT = parseInt(process.argv[4]) || 32;
const ROOM_COUNT = 3; // minimal 2 buat entrance + exit

const COLORS = {
  floor: '#696969', // abu = jalan
  wall: '#A0522D', // coklat = tembok solid
  warp: '#ff00ff', // magenta = warper
  mob: '#44ff44', // ijo = mob
  item: '#ffff44' // kuning = item
};

// 1. Init grid: 0 = wall, 1 = floor
const grid = Array.from({length: HEIGHT}, () => Array(WIDTH).fill(0));
const objects = [];

// 2. Generate random rooms
const rooms = [];
for (let i = 0; i < ROOM_COUNT; i++) {
  const rw = 5 + Math.floor(Math.random() * 5);
  const rh = 5 + Math.floor(Math.random() * 5);
  const rx = 1 + Math.floor(Math.random() * (WIDTH - rw - 2));
  const ry = 1 + Math.floor(Math.random() * (HEIGHT - rh - 2));
  rooms.push({x: rx, y: ry, w: rw, h: rh});
  
  // Carve room
  for (let y = ry; y < ry + rh; y++) {
    for (let x = rx; x < rx + rw; x++) {
      grid[y][x] = 1;
    }
  }
}

// 3. Connect rooms with corridors - DIJAMIN WALKABLE
function carveCorridor(x1, y1, x2, y2) {
  let x = x1, y = y1;
  while (x!== x2) {
    grid[y][x] = 1;
    x += x < x2? 1 : -1;
  }
  while (y!== y2) {
    grid[y][x] = 1;
    y += y < y2? 1 : -1;
  }
}

for (let i = 1; i < rooms.length; i++) {
  const a = rooms[i-1], b = rooms[i];
  const ax = a.x + Math.floor(a.w/2);
  const ay = a.y + Math.floor(a.h/2);
  const bx = b.x + Math.floor(b.w/2);
  const by = b.y + Math.floor(b.h/2);
  carveCorridor(ax, ay, bx, by);
}

// 4. Place Entrance & Exit Warper di room pertama & terakhir
const entrance = rooms[0];
const exit = rooms[rooms.length - 1];

const warpIn = {
  type: 'Warper',
  id: `${MAP_ID}_enter`,
  color: COLORS.warp,
  x: entrance.x + Math.floor(entrance.w/2),
  y: entrance.y + Math.floor(entrance.h/2),
  target: { map: 'world_01', x: 50, y: 50 } // balik ke world
};

const warpOut = {
  type: 'Warper',
  id: `${MAP_ID}_exit`,
  color: COLORS.warp,
  x: exit.x + Math.floor(exit.w/2),
  y: exit.y + Math.floor(exit.h/2),
  target: { map: 'world_01', x: 51, y: 50 } // next area
};

objects.push(warpIn, warpOut);

// 5. Fill floor & wall props
for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    if (grid[y][x] === 1) {
      objects.push({
        type: 'Prop',
        id: `floor_${x}_${y}`,
        color: COLORS.floor,
        x, y, solid: false
      });
    } else {
      objects.push({
        type: 'Prop',
        id: `wall_${x}_${y}`,
        color: COLORS.wall,
        x, y, solid: true
      });
    }
  }
}

// 6. Spawn random mob di room, tapi jangan di tile warper
rooms.forEach((room, idx) => {
  if (idx === 0) return; // room entrance kosong
  const mobCount = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < mobCount; i++) {
    let mx, my;
    do {
      mx = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
      my = room.y + 1 + Math.floor(Math.random() * (room.h - 2));
    } while ((mx === warpIn.x && my === warpIn.y) || (mx === warpOut.x && my === warpOut.y));
    
    objects.push({
      type: 'Mob',
      id: `slime_${MAP_ID}_${idx}_${i}`,
      color: COLORS.mob,
      x: mx, y: my,
      hp: 50, atk: 5
    });
  }
});

// 7. Validate: BFS dari warpIn ke warpOut WAJIB nyambung
function bfsWalkable(sx, sy, tx, ty) {
  const queue = [[sx, sy]];
  const visited = new Set([`${sx},${sy}`]);
  
  while (queue.length) {
    const [x, y] = queue.shift();
    if (x === tx && y === ty) return true;
    
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= WIDTH || ny >= HEIGHT) continue;
      if (grid[ny][nx] === 0) continue; // wall
      if (visited.has(`${nx},${ny}`)) continue;
      visited.add(`${nx},${ny}`);
      queue.push([nx, ny]);
    }
  }
  return false;
}

const pathOK = bfsWalkable(warpIn.x, warpIn.y, warpOut.x, warpOut.y);
if (!pathOK) {
  console.error('[MAPGEN] ERROR: Warp to warp not walkable! Regenerate.');
  process.exit(1);
}

// 8. Write JSON pake schema Map
const mapData = {
  id: MAP_ID,
  name: MAP_ID,
  width: WIDTH,
  height: HEIGHT,
  objects: objects
};

const outPath = path.join(__dirname, `../data/maps/${MAP_ID}.json`);
fs.mkdirSync(path.dirname(outPath), {recursive: true});
fs.writeFileSync(outPath, JSON.stringify(mapData, null, 2));

console.log(`[MAPGEN] Generated ${MAP_ID} ${WIDTH}x${HEIGHT}`);
console.log(`[MAPGEN] Rooms: ${ROOM_COUNT}, Objects: ${objects.length}`);
console.log(`[MAPGEN] Path Warp->Warp: OK`);
console.log(`[MAPGEN] Saved: ${outPath}`);
