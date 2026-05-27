/**
 * MindbloxCore Color Database
 * Warna → Folder → Type → Default Stats
 * Dipake sama: schema.js, server.js, gen_placeholder.js, admin.html
 */

export const COLOR_DB = {
  // === MOBS ===
  '#66ff66': { folder: 'mobs', type: 'Mob', tier: 'easy', label: 'Slime Jr' },
  '#44ff44': { folder: 'mobs', type: 'Mob', tier: 'normal', label: 'Slime' },
  '#22cc22': { folder: 'mobs', type: 'Mob', tier: 'hard', label: 'Alpha Slime' },
  '#00ff00': { folder: 'mobs', type: 'Mob', tier: 'boss', isBoss: true, label: 'Slime King' },
  '#88ff88': { folder: 'mobs', type: 'Mob', tier: 'normal', label: 'Forest Mob' },

  // === ITEMS ===
  '#ff4444': { folder: 'items', type: 'Item', subtype: 'consumable', label: 'HP Potion' },
  '#ffff44': { folder: 'items', type: 'Item', subtype: 'currency', label: 'Gold Coin' },
  '#ff8844': { folder: 'items', type: 'Item', subtype: 'equip', label: 'Weapon' },
  '#ff44ff': { folder: 'items', type: 'Item', subtype: 'key', label: 'Key Item' },

  // === SOULS ===
  '#44ffff': { folder: 'souls', type: 'Soul', label: 'Mob Soul' },
  '#00cccc': { folder: 'souls', type: 'Soul', label: 'Boss Soul' },

  // === PROPS / TERRAIN ===
  '#228B22': { folder: 'props', type: 'Prop', subtype: 'tree', solid: true, label: 'Tree' },
  '#8B4513': { folder: 'props', type: 'Prop', subtype: 'terrain', solid: false, label: 'Dirt' },
  '#4169E1': { folder: 'props', type: 'Prop', subtype: 'building', solid: true, label: 'House' },
  '#32CD32': { folder: 'props', type: 'Prop', subtype: 'terrain', solid: false, label: 'Grass' },
  '#696969': { folder: 'props', type: 'Prop', subtype: 'floor', solid: false, label: 'Stone' },
  '#A0522D': { folder: 'props', type: 'Prop', subtype: 'terrain', solid: true, label: 'Rock' },

  // === WARPER ===
  '#ff00ff': { folder: 'warpers', type: 'Warper', label: 'Portal' },
  '#cc00cc': { folder: 'warpers', type: 'Warper', label: 'Door' },

  // === RECIPE ===
  '#ffa500': { folder: 'recipes', type: 'Recipe', label: 'Craft Recipe' },

  // === ERROR / UNKNOWN ===
  '#000000': { folder: 'items', type: 'Item', label: 'Unknown' }
};

// Reverse lookup: folder → default color
export const FOLDER_COLOR = {
  mobs: '#44ff44',
  items: '#ffff44', 
  souls: '#44ffff',
  props: '#8B4513',
  warpers: '#ff00ff',
  recipes: '#ffa500',
  maps: '#333333' // map gak punya warna, cuma container
};

// Keyword fallback kalau user gak kasih warna
export const KEYWORD_DB = {
  // Mobs
  slime: 'mobs', goblin: 'mobs', wolf: 'mobs', dragon: 'mobs', boss: 'mobs', orc: 'mobs',
  // Items 
  potion: 'items', sword: 'items', coin: 'items', key: 'items', gem: 'items', scroll: 'items',
  // Props
  tree: 'props', house: 'props', grass: 'props', floor: 'props', rock: 'props', wall: 'props',
  // Souls
  soul: 'souls',
  // Warpers
  portal: 'warpers', door: 'warpers', warp: 'warpers',
  // Recipe
  recipe: 'recipes', craft: 'recipes'
};

/**
 * Detect folder + type dari id dan color
 * @param {string} id - entity id
 * @param {string} color - hex color
 * @returns {object} {folder, type, tier, isBoss,...defaults}
 */
export function detectMeta(id, color) {
  // 1. Prioritas warna
  if (color && COLOR_DB[color]) {
    return {...COLOR_DB[color], color};
  }
  
  // 2. Keyword di ID
  const lower = id.toLowerCase();
  for (const [key, folder] of Object.entries(KEYWORD_DB)) {
    if (lower.includes(key)) {
      const defaultColor = FOLDER_COLOR[folder];
      return {folder, type: folder.slice(0,-1).charAt(0).toUpperCase() + folder.slice(1,-1), color: defaultColor};
    }
  }
  
  // 3. Default items
  return {folder: 'items', type: 'Item', color: '#ffff44'};
}

/**
 * Generate placeholder SVG dari meta
 */
export function generatePlaceholderSVG(meta, id) {
  const label = id.slice(0, 8);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
  <rect width="64" height="64" fill="${meta.color}"/>
  <text x="32" y="30" font-family="monospace" font-size="9" fill="#000" text-anchor="middle">${meta.type}</text>
  <text x="32" y="42" font-family="monospace" font-size="8" fill="#000" text-anchor="middle">${label}</text>
</svg>`;
}
