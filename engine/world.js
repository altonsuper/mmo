import { Bus } from "./bus.js";
import { REGISTRY } from "./schema.js";
import { randomUUID } from "crypto";
import Matter from "matter-js";
const { Engine, Bodies, Body, World: MWorld, Events } = Matter;

const engine = Engine.create({ gravity: { x: 0, y: 0 } });
const world = engine.world;

export const World = {
  currentMap: 'world_01',
  warpers: [],
  
  clear() {
    for (const [id, e] of this.entities.entries()) {
      if (e._t === 'Player') continue;
      MWorld.remove(world, e.body);
      this.entities.delete(id);
    }
    this.warpers = [];
    Bus.emit('world:clear');
  },

  loadMap(mapData) {
    this.clear();
    this.currentMap = mapData.id;
    console.log(`[MAP] Loading ${this.currentMap} ${mapData.width}x${mapData.height}`);
    
    this.warpers = mapData.objects?.filter(o => o.type === 'Warper') || [];
    
    mapData.objects?.forEach(o => {
      if (o.type === 'Warper') return;
      this.spawn(o.type, o.id, o.x * 64 + 32, o.y * 64 + 32);
    });
    
    Bus.emit('world:loaded', {map: this.currentMap});
  },
  currentMap: 'world_01',
  warpers: [],
  
  clear() {
    // Despawn semua entity kecuali player
    for (const [id, e] of this.entities.entries()) {
      if (e._t === 'Player') continue;
      MWorld.remove(world, e.body);
      this.entities.delete(id);
    }
    this.warpers = [];
    Bus.emit('world:clear');
  },

  loadMap(mapData) {
    this.clear();
    this.currentMap = mapData.name || 'unknown';
    console.log(`[MAP] Loading ${this.currentMap} ${mapData.width}x${mapData.height}`);
    
    // 1. Load warpers
    this.warpers = mapData.objects?.filter(o => o.type === 'Warper') || [];
    
    // 2. Spawn semua object dari map
    mapData.objects?.forEach(o => {
      if (o.type === 'Warper') return; // warper ga di-spawn, cuma data
      this.spawn(o.type, o.id, o.x * 64 + 32, o.y * 64 + 32);
    });
    
    Bus.emit('world:loaded', {map: this.currentMap, size: [mapData.width, mapData.height]});
  },
  entities: new Map(),
  engine,

  spawn(templateType, templateId, x, y) {
    const base = REGISTRY[templateType]?.[templateId];
    if (!base) throw new Error(`Template not found: ${templateType}.${templateId}`);
    const id = randomUUID();
    const isMob = templateType === 'Mob';
    const body = isMob
    ? Bodies.circle(x, y, 16, { frictionAir: 0.2 })
      : Bodies.rectangle(x, y, 20, 20, { isSensor: true, isStatic: true });

    const ent = {
   ...structuredClone(base),
      _id: id,
      _t: templateType,
      x, y,
      body,
      inventory: [],
      hp: base.hp || 100,
      level: base.level || 1,
      exp: 0,
      expToLevel: base.expToLevel || 100
    };

    body.label = id;
    MWorld.add(world, body);
    this.entities.set(id, ent);
    Bus.emit('world:spawn', ent);
    return ent;
  },

  despawn(id) {
    const e = this.entities.get(id);
    if (!e) return;
    MWorld.remove(world, e.body);
    this.entities.delete(id);
    Bus.emit('world:despawn', id);
  },

  move(id, vx, vy) {
    const e = this.entities.get(id);
    if (!e) return;
    Body.setVelocity(e.body, { x: vx, y: vy });
  },

  step() {
    Engine.update(engine, 1000 / 60);
    for (const e of this.entities.values()) {
      e.x = e.body.position.x;
      e.y = e.body.position.y;
      Bus.emit('world:move', e);
    }
  }
};

// CUMA 1X YA INI
export function gainExp(entityId, amount) {
  const e = World.entities.get(entityId);
  if (!e) return;
  e.exp += amount;
  while (e.exp >= e.expToLevel) {
    e.exp -= e.expToLevel;
    e.level++;
    e.hp += 20;
    e.atk = (e.atk || 10) + 2;
    e.expToLevel = Math.floor(e.expToLevel * 1.5);
    Bus.emit('levelup', {id: entityId, level: e.level});
  }
  Bus.emit('exp:gain', {id: entityId, exp: e.exp, level: e.level});
}
