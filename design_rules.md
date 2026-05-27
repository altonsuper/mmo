# Rules Asset Naming

Format: `entity_action_type.png`

1. entity: id dari DB. ex: slime, goblin, player
2. action: walk, run, idle, attack, shoot, die, hit
3. type: melee, range. Kosongin kalau bukan attack.

Contoh Valid:
- slime.png → static
- slime_walk.png → jalan, loop
- slime_attack_melee.png → attack dekat, gak loop
- archer_shoot_range.png → attack jauh, gak loop
- player_die.png → mati, play sekali

Ukuran: 64x64 per frame. Kalau 256x64 = 4 frame auto split.

Folder:
mobs/ = Mob
props/ = Prop 
items/ = Item