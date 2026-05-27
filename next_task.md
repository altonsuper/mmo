# MindbloxCore - Next Task

## Goal: GM is The Game Builder
GM bisa bikin MMO dari chat + editor. No VSCode untuk content.

## Sprint 1: Interior Scene System
1. **Map Loader v2** 
   - Pas warp ke map beda → `World.entities.clear()` + load map baru
   - Client fade to black pas ganti map
   - File: `engine/world.js` → `World.loadMap()`
   - Test: `/gm create Map house_inside {width:20,height:20}` → warper masuk rumah

2. **Door Warper Auto**
   - Prop type:House auto punya warper di pintu
   - `/gm create Prop house_01 {interior:"house_inside",door:[10,19]}`
   - Player injek door tile → auto warp

3. **Instance Map**
   - Map bisa `"instance": true` → tiap player masuk bikin copy
   - Buat dungeon/boss room pribadi
   - File: `data/maps/boss_room.json`

## Sprint 2: AI Combat v1
1. **Mob Behavior**
   - `tier: easy` → diem, `normal` → patrol, `hard` → chase, `boss` → skill
   - File: `engine/ai.js` baru
   - `/gm create Mob wolf_hard {tier:"hard","aggroRange":200}`

2. **Damage + HP Bar**
   - Click mob = attack, pake `atkSpeed`
   - HP bar di atas kepala mob + player
   - Mob mati → drop exp + `/gm kill` auto

3. **Loot Table**
   - `/gm create Mob goblin {loot:["item_coin","soul_goblin:0.5"]}`
   - 50% chance drop soul_goblin

## Sprint 3: Player System
1. **Save Player** 
   - `/gm saveplayer` → write `data/players/user_01.json`
   - Load pas connect, biar level/item ga reset

2. **Inventory UI**
   - Tekan I → buka inventory grid
   - Click item = use/equip
   - Drag drop belum, klik aja dulu

3. **Craft v2**
   - `/gm create Recipe sword_iron {cost:{iron:3},result:"item_sword_iron"}`
   - UI: Klik craft button, bukan chat

## Sprint 4: Multiplayer Polish
1. **Minimap** - Canvas 200x200 pojok kanan
2. **Name + Level** - Render di atas kepala
3. **Chat Global** - `/all` chat ke semua map
4. **10k CCU Test** - `artillery.io` script

## Rule Buat AI/Dev:
1. **Semua content = JSON**. Jangan hardcode di .js
2. **GM command wajib write DB**. User gak buka VSCode
3. **Placeholder dulu**. Color cukup, designer belakangan
4. **Command simple**. `/gm spawn Mob slime 0 0` bukan `/gm entity create --type=Mob`
5. **Backward compatible**. Update schema jangan bikin mob lama error

## Next Command Buat Kamu:
Ketik salah satu buat lanjut:
`lanjut interior` | `lanjut ai` | `lanjut inventory` | `lanjut multiplayer`
