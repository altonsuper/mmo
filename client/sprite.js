const cache = {};
const animCache = {};
let manifest = {};

// Load manifest sekali
fetch('/assets/mobs/_manifest.json').then(r => r.json()).then(m => manifest = m);

export function loadSprite(type, id) {
  const key = `${type}/${id}`;
  if (cache[key]) return cache[key];
  
  const img = new Image();
  img.src = `/assets/${key}.png`;
  img.onerror = () => img.src = `/assets/${key}.svg`; // fallback SVG
  cache[key] = img;
  return img;
}

// Deteksi semua frame anim: slime_walk_0.png, slime_walk_1.png...
export function loadAnim(type, id, action) {
  const baseKey = `${type}/${id}_${action}`;
  if (animCache[baseKey]) return animCache[baseKey];
  
  const frames = [];
  for (let i = 0; i < 8; i++) { // max 8 frame
    const img = new Image();
    img.src = `/assets/${type}/${id}_${action}_${i}.png`;
    img.onload = () => frames[i] = img;
    img.onerror = () => {}; // stop kalau gak ada frame i
  }
  
  // Kalau gak ada frame, pake static
  if (frames.length === 0) {
    frames[0] = loadSprite(type, id);
  }
  
  animCache[baseKey] = frames;
  return frames;
}

export function getFrame(entity, deltaTime) {
  const type = entity.type.toLowerCase() + 's'; // Mob -> mobs
  const id = entity.id;
  
  // Tentuin action: attack > move > idle
  let action = 'static';
  const rules = manifest[id];
  if (entity.state === 'attack' && rules?.attack) action = 'attack';
  else if (entity.state === 'attack' && rules?.shoot) action = 'shoot';
  else if ((entity.vx!== 0 || entity.vy!== 0) && rules?.walk) action = 'walk';
  else if (entity.state === 'die' && rules?.die) action = 'die';
  if (entity.state === 'attack') action = 'attack';
  else if (entity.vx!== 0 || entity.vy!== 0) action = 'walk';
  
  const frames = loadAnim(type, id, action);
  if (frames.length <= 1) return frames[0];
  
  // Anim speed: 10 FPS
  if (!entity.animTime) entity.animTime = 0;
  entity.animTime += deltaTime;
  const frameIdx = Math.floor(entity.animTime * 10) % frames.length;
  
  return frames[frameIdx] || frames[0];
}
