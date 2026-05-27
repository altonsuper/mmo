# MindbloxCore - What We Done

## Core Engine ✅
1. **Schema System** `engine/schema.js`
   - Auto-validate JSON dari `/data/*.json`
   - Type: Mob, Item, Soul, Recipe, Map, Prop, Warper
   - RPG Stats: level, hp, atk, def, atkSpeed, exp, tier[easy/normal/hard/boss]

2. **World Runtime** `engine/world.js`
   - Matter.js physics, 60fps tick
   - Spawn/Despawn entity dari registry
   - Auto scale stat by tier + boss multiplier
   - Warper system: injek tile → teleport
   - gainExp + level up logic

3. **Server + IO** `server.js`
   - Socket.io realtime
   - GM CLI via stdin + chatbox
   - Hot reload `/data` tanpa restart
   - Auto broadcast registry ke client

## GM Game Builder Tools ✅
1. **Chat Commands** `/gm` di client
   - `spawn Type id x y` → spawn runtime
   - `create Type id {json}` → write `/data/*.json` + reload
   - `delete Type id` → hapus file + reload
   - `kill id | all` → despawn entity
   - `tp x y | tp id x y` → teleport
   - `save` → save world state

2. **Map Editor** `client/admin.html`
   - Canvas 4096x4096, 64px tiles
   - Place/Erase: Prop, Mob, Warper
   - Warper target: `map_id x y`
   - Save ke `/data/maps/nama.json`

3. **Asset Tools**
   - `npm run detect` → cek JSON vs assets, lapor missing field
   - `node tools/gen_placeholder.js` → generate SVG warna solid + auto update JSON
   - Color code: Mob=ijo, Item=kuning, Tree=ijo tua, House=biru, Warper=magenta

4. **Scaffold** `npm run scaffold`
   - Tree project max 3 level
   - Count file per folder `/data`
   - List file modified today

## Database = JSON Files ✅
| Folder | Isi | GM Command |
| --- | --- | --- |
| `/data/mobs/` | Template mob + stats + tier | `create Mob id {}` |
| `/data/maps/` | Layout map + warper + props | Save dari admin.html |
| `/data/props/` | Tree, House, Floor, Grass | `create Prop id {}` |
| `/data/items/` | Item template | `create Item id {}` |

## Client ✅
1. `client/index.html` - Game canvas + HUD + chat
2. `client/admin.html` - Map editor gede
3. Fallback render: pake `color` dari JSON kalau sprite belum ada

## Status: GM udah bisa build game dari chatbox + map editor tanpa coding
