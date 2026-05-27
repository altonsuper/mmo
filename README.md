Set-Content README.md @'
# MetaMuseSparkMMO

Chat-based MMO Engine. GM = Roblox Studio.

## Features
- Schema-driven JSON entities: Mob, Item, Map, Warper, Soul
- GM Commands: /gm create, /gm batch_create, /gm spawn
- Auto Tools: mapgen, autofix, designer, questgen, template
- Smart Designer: Drop PNG → auto split anim → auto place ke map
- Animation: Auto detect walk, attack, melee, range dari nama file

## Quick Start
```bash
npm install
npm run autofix
npm run mapgen dungeon_01 32 32
npm start


## GM pipeline
npm run template goblin_camp
npm run balance
npm run lootgen
npm run designer world_01 props
npm run questgen
npm start
